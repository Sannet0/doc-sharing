const { errorsCodes } = require('../consts/server-codes');
const db = require('../modules/database.module');

const createFolder = async (req, res) => {
  const { folderName, originFolderId } = req.body;
  const { id, email } = req.user;
  try {
    const createFolderQuery = {
      text: `
          INSERT INTO folders ("name", "origin_folder_id", "creator_id")
          VALUES ($1, $2, $3)
          RETURNING "id", "name", "origin_folder_id"
      `,
      values: [folderName, originFolderId, id]
    }

    const createFolderReturnValues = await db.query(createFolderQuery);
    const actualFolder = createFolderReturnValues.rows[0];

    return res.status(201).send({
      folderId: actualFolder.id,
      folderName: actualFolder.name,
      originFolderId: actualFolder.origin_folder_id
    });
  } catch (err) {
    console.log("LOOOG", err);

    return res.status(500).send({
      code: errorsCodes.internalError,
      message: JSON.stringify(err)
    });
  }

  // req: {
  //   folderName: 'folder',
  //     originFolderId: 1
  // }
  // res: {
  //   folderId: 2,
  //     folderName: 'folder',
  //     originFolderId: 1
  // }
}

const deleteFolder = async (req, res) => {
  const {} = req.query;
  try {

  } catch (err) {
    return res.status(500).send({
      code: errorsCodes.internalError,
      message: JSON.stringify(err)
    });
  }

  // req: {
  //   folderId: 2
  // }
  // res: {
  //   folderId: 2
  //   folderName: 'folder',
  //     originFolderId: 1,
  //     folders: [
  //     {
  //       folderId: 3
  //       folderName: 'folder2',
  //       originFolderId: 2,
  //     }
  //   ],
  //     files: []
  // }
}

const getFolderInfo = async (req, res) => {
  const {} = req.query;
  try {

  } catch (err) {
    return res.status(500).send({
      code: errorsCodes.internalError,
      message: JSON.stringify(err)
    });
  }

  // req: {
  //   folderId: 2,
  //     newName: 'new folder name'
  // }
  // res: {
  //   message: 'folder rename success'
  // }
}

const editFolderName = async (req, res) => {
  const {} = req.body;
  try {

  } catch (err) {
    return res.status(500).send({
      code: errorsCodes.internalError,
      message: JSON.stringify(err)
    });
  }

  // req: {
  //   folderId: 2
  // }
  // res: {
  //   message: 'folder delete success'
  // }
}
