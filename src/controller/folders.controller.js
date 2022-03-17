const fs = require('fs').promises;
const db = require('../modules/database.module');
const { errorsCodes } = require('../consts/server-codes');

const isFolderExist = async (userId, folderId) => {
  const checkFolderUniqueQuery = {
    text: `
        SELECT * FROM folders
        WHERE "creator_id" = $1
        AND "name" = $2
        LIMIT 1
      `,
    values: [userId, folderId]
  }
  const checkFolderUniqueReturnValues =  await db.query(checkFolderUniqueQuery);
  const actualMatchedFolder = checkFolderUniqueReturnValues.rows[0];

  return !!actualMatchedFolder;
}

const createFolder = async (req, res) => {
  let { folderName, originFolderId } = req.body;
  const  { id } = req.user;

  try {
    let existFoldersQuery = {
      text: '',
      values: []
    };

    if (originFolderId === 0) {
      originFolderId = null;

      existFoldersQuery = {
        text: `
        SELECT * FROM folders
        WHERE "creator_id" = $1
        AND "origin_folder_id" IS NULL
        AND "name" = $2
        LIMIT 1
      `,
        values: [id, folderName]
      }
    } else {
      const isFolderAlreadyExist =  await isFolderExist(id, originFolderId);

      if (!isFolderAlreadyExist) {
        return res.status(500).send({
          code: errorsCodes.invalidFolder
        });
      }

      existFoldersQuery = {
        text: `
        SELECT * FROM folders
          WHERE "creator_id" = $1
          AND "origin_folder_id" = $2
          AND "name" = $3
        LIMIT 1
      `,
        values: [id, originFolderId, folderName]
      }
    }

    const existFoldersReturnValues = await db.query(existFoldersQuery);
    const actualMatchFolders = existFoldersReturnValues.rows[0];

    if(actualMatchFolders) {
      return res.status(500).send({
        code: errorsCodes.folderExist
      });
    }

    const createFolderQuery = {
      text: `
          INSERT INTO folders ("name", "origin_folder_id", "creator_id")
          VALUES ($1, $2, $3)
          RETURNING "id", "name", "origin_folder_id" as "originFolderId"
      `,
      values: [folderName, originFolderId, id]
    }
    const createFolderReturnValues = await db.query(createFolderQuery);
    const actualFolder = createFolderReturnValues.rows[0];

    return res.status(201).send({
      ...actualFolder
    });
  } catch (err) {
    console.error('folders.controller "createFolder" function error: ', err);

    return res.status(500).send({
      code: errorsCodes.internalError,
      message: err.message || JSON.stringify(err)
    });
  }
}

const deleteFolder = async (req, res) => {
  const { folderId } = req.query;
  const  { id } = req.user;

  try {
    const isFolderAlreadyExist =  await isFolderExist(id, folderId);

    if (!isFolderAlreadyExist) {
      return res.status(500).send({
        code: errorsCodes.invalidFolder
      });
    }

    const filesPathsQuery = {
      text: `
        WITH RECURSIVE folders_recursive("distance", "origin_folder_id", "id") AS (
          SELECT 1, "origin_folder_id", "id"
          FROM folders
          WHERE "origin_folder_id" = $1
          UNION ALL
            SELECT fr.distance + 1, f.origin_folder_id, f.id
            FROM folders_recursive fr, folders f
            WHERE fr.id = f.origin_folder_id
        )
        SELECT DISTINCT fl.id, fl.path  FROM folders_recursive AS fs
        JOIN (SELECT * FROM files) as fl on fl.folder_id = fs.id OR fl.folder_id = $1
      `,
      values: [folderId]
    }
    const filesPathsReturnValues = await db.query(filesPathsQuery);
    const filesPaths = filesPathsReturnValues.rows;

    const deleteFoldersPromises =[];
    for (let i in filesPaths) {
      deleteFoldersPromises.push(fs.unlink(filesPaths[i].path));
    }
    await Promise.all(deleteFoldersPromises);

    const deleteFoldersQuery = {
      text: `
        DELETE FROM folders
        WHERE id = $1
      `,
      values: [folderId]
    };
    await db.query(deleteFoldersQuery);

    return res.status(200).send({
      message: 'success delete folder'
    });
  } catch (err) {
    console.error('folders.controller "deleteFolder" function error: ', err);

    return res.status(500).send({
      code: errorsCodes.internalError,
      message: JSON.stringify(err)
    });
  }
}

const getFolderInfo = async (req, res) => {
  const { folderId } = req.query;
  const  { id } = req.user;
  let result = {
    status: 200,
    data: {}
  }

  try {
    if (folderId === '0') {
      result = await getRootFolder(id);
    } else {
      result = await getOtherFolder(folderId, id);
    }

    return res.status(result.status).send(result.data);
  } catch (err) {
    console.error('folders.controller "getFolderInfo" function error: ', err);

    return res.status(500).send({
      code: errorsCodes.internalError,
      message: JSON.stringify(err)
    });
  }
}

const getOtherFolder = async (folderId, userId) => {
  const existFoldersQuery = {
    text: `
      SELECT
        id,
        name,
        COALESCE(origin_folder_id, 0) as "originFolderId",
        creator_id as "creatorId"
      FROM folders
        WHERE "id" = $1
        AND "creator_id" = $2
      LIMIT 1
    `,
    values: [folderId, userId]
  }
  const existFoldersReturnValues = await db.query(existFoldersQuery);
  const actualExistFolder = existFoldersReturnValues.rows[0];

  if (!actualExistFolder) {
    return {
      status: 500,
      data: {
        code: errorsCodes.invalidFolder
      }
    }
  }

  const childFoldersQuery = {
    text: `
      SELECT
        id,
        name,
        origin_folder_id as "originFolderId",
        creator_id as "creatorId"
      FROM folders
        WHERE "origin_folder_id" = $1
        AND "creator_id" = $2
    `,
    values: [folderId, userId]
  }
  const childFoldersReturnValues = await db.query(childFoldersQuery);
  const childFoldersInfo = childFoldersReturnValues.rows;

  const getChildFilesQuery = {
    text: `
      SELECT
        id,
        displayname as "displayName",
        type,
        creator_id as "creatorId"
      FROM files
      WHERE "folder_id" = $1
      AND "creator_id" = $2
    `,
    values: [folderId, userId]
  }
  const getChildFilesReturnValues = await db.query(getChildFilesQuery);
  const childFilesInfo = getChildFilesReturnValues.rows;

  return {
    status: 200,
    data: {
      ...actualExistFolder,
      folders: childFoldersInfo,
      files: childFilesInfo
    }
  }
}

const getRootFolder = async (userId) => {
  const getChildFoldersQuery = {
    text: `
      SELECT 
        id,
        name,
        origin_folder_id as "originFolderId",
        creator_id as "creatorId"
      FROM folders
      WHERE "origin_folder_id" IS NULL
      AND "creator_id" = $1
    `,
    values: [userId]
  }
  const getChildFoldersReturnValues = await db.query(getChildFoldersQuery);
  const childFoldersInfo = getChildFoldersReturnValues.rows;

  const getChildFilesQuery = {
    text: `
      SELECT
        id,
        displayname as "displayName",
        type,
        creator_id as "creatorId"
      FROM files
      WHERE "folder_id" IS NULL
      AND "creator_id" = $1
    `,
    values: [userId]
  }
  const getChildFilesReturnValues = await db.query(getChildFilesQuery);
  const childFilesInfo = getChildFilesReturnValues.rows;

  return {
    status: 200,
    data: {
        id: 0,
        name: 'root',
        originFolderId: null,
        creatorId: userId,
        folders: childFoldersInfo,
        files: childFilesInfo
    }
  }
}

const editFolderName = async (req, res) => {
  const { folderId, newName } = req.body;
  const  { id } = req.user;

  try {
    const isFolderAlreadyExist =  await isFolderExist(id, folderId);

    if (!isFolderAlreadyExist) {
      return res.status(500).send({
        code: errorsCodes.invalidFolder
      });
    }

    const updateFolderQuery = {
      text: `
        UPDATE folders 
        SET "name" = $1
        WHERE "id" = $2
        AND "creator_id" = $3
      `,
      values: [newName, folderId, id]
    }
    await db.query(updateFolderQuery);

    return res.status(200).send({
      message: 'success folder name edit'
    });
  } catch (err) {
    console.log('folders.controller "editFolderName" function error: ', err);

    return res.status(500).send({
      code: errorsCodes.internalError,
      message: JSON.stringify(err)
    });
  }
}

module.exports = {
  createFolder,
  deleteFolder,
  getFolderInfo,
  editFolderName
}
