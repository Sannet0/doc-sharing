const { errorsCodes } = require('../consts/server-codes');
const db = require('../modules/database.module');

const createFolder = async (res, req) => {
  const { folderName, originFolderId } = res.body;
  try {
    const createFolderQuery = {
      text: `
          INSERT INTO folders ("foldername", "origin_folder_id")
          VALUES ($1, $2)
          RETURNING "id", "foldername"
      `,
      values: [folderName, originFolderId]
    }

    const createFolderReturnValues = await db.query(createFolderQuery);

  } catch (err) {
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

const deleteFolder = async (res, req) => {
  const {} = res.query;
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

const getFolderInfo = async (res, req) => {
  const {} = res.query;
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

const editFolderName = async (res, req) => {
  const {} = res.body;
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
