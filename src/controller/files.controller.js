const fsPromises = require('fs').promises;
const fs = require('fs');
// const multiparty = require('multiparty');
const { v4: uuid } = require('uuid');
const { correctOriginPath, extractTypeBase64 } = require('../consts/base-const')
const { errorsCodes } = require('../consts/server-codes');
const db = require('../modules/database.module');
const util = require('util');

const files = {};

// const file = {
//   id: 'qwe92012jekla',
//   total: 0,
//   size: '',
//   md5: '',
//   name: 'folder',
//   folderId: 12,
//   content: {
//     1: 'qweqwe',
//     2: 'qweqwe'
//   }
// }

const isFolderExist = async (userId, folderId) => {
  const checkFolderUniqueQuery = {
    text: `
        SELECT * FROM folders
        WHERE "creator_id" = $1
        AND "id" = $2
        LIMIT 1
      `,
    values: [userId, folderId]
  }
  const checkFolderUniqueReturnValues =  await db.query(checkFolderUniqueQuery);
  const actualMatchedFolder = checkFolderUniqueReturnValues.rows[0];

  return !!actualMatchedFolder;
}

const initializeUploadFile = async (req, res) => {
  let { id, total, name, size, type, md5, folderId } = req.body;
  //const userID = req.user.id;
  const userId = 105;

  try {
    if ( folderId === 0 ) {
      folderId = null
    }

    //todo проверить размер
    if(type === 'image' && size === 2048) {
      return res.status(406).send({
        message: 'file is too large'
      });
    } else if (type === 'document' && size === 10240) {
      return res.status(406).send({
        message: 'file is too large'
      });
    } else if (type === 'else' && size === 5242880) {
      return res.status(406).send({
        message: 'file is too large'
      });
    }

    //todo проверить папку

    await isFolderExist();


    files[id] = { total, name, size, md5, folderId, content: {} };

    // return res.status(200).send('initialize success');
    return res.status(200).send(files);
  } catch (err) {
    console.error('files.controller "initializeUploadFile" function error: ', err);

    return res.status(500).send({
      code: errorsCodes.internalError,
      message: JSON.stringify(err)
    });
  }
}

const uploadChunk = async (req, res) => {
  const { id, chunkNum, chunk } = req.body;
  //const userID = req.user.id;

  try {

    if(!files[id]) {
      return res.status(400).send('file not init');
    }

    let { total, content } = files[id];

    if(!(1 <= chunkNum && total >= chunkNum)) {
      return res.status(400).send('out of range');
    }

    content[chunkNum] = chunk;
    files[id] = { ...files[id], content }

    //return res.status(200).send('chunk uploaded');
    return res.status(200).send(files);
  } catch (err) {
    console.error('files.controller "uploadChunk" function error: ', err);

    return res.status(500).send({
      code: errorsCodes.internalError,
      message: JSON.stringify(err)
    });
  }
}

const endUploadFile = async (req, res) => {
  const { id } = req.body;
  //const userID = req.user.id;

  try {
    if(!files[id]) {
      return res.status(400).send('file not init');
    }

    const { total, name, md5, folderId, content } = files[id];

    let file = '';

    for(let i = 1; i <= total; i++) {
      if(!content[i]) {
        return res.status(400).send('missed chunk');
      }

      file += content[i];
    }

    //todo проверить md5

    //todo записать фаил на сервер

    //todo записать фаил в бд

    return res.status(200).send(file);
  } catch (err) {
    console.error('files.controller "endUploadFile" function error: ', err);

    return res.status(500).send({
      code: errorsCodes.internalError,
      message: JSON.stringify(err)
    });
  }
}

// const uploadFile = async (req, res) => {
//   //let { folderId, content, name } = req.body;
//   const  { id } = req.user;
//   const form = new multiparty.Form();
//
//   // form.parse(req, function(err, fields, files) {
//   //   // res.writeHead(200, { 'content-type': 'text/plain' });
//   //   // res.write('received upload:\n\n');
//   //   // res.end(util.inspect({ fields: fields, files: files }));
//   //
//   //   return res.status(200).send({
//   //     fields, files
//   //   });
//   // });
//
//   // form.on('file', async (name,file) => {
//   //   return res.status(200).send({
//   //     name, file
//   //   });
//   // })
//
//   try {
//     // content = extractTypeBase64(content);
//     //
//     if ( folderId === 0 ) {
//       folderId = null
//     }
//     //
//     // const contentBase64 = content.base64;
//     // const origFilePath = correctOriginPath(1) + '/files';
//     //
//     // fs.lstat(origFilePath, async (err) => {
//     //   if (err) {
//     //     await fsPromises.mkdir(origFilePath);
//     //   }
//     // });
//     //
//     // const filePath = origFilePath + '/' + uuid() + '.' + content.type;
//     //
//     // await fsPromises.writeFile(filePath, contentBase64, { encoding: 'base64' });
//     //
//     // const insertFileQuery = {
//     //   text: `
//     //     INSERT INTO files ("path", "displayname", "type", "folder_id", "creator_id")
//     //     VALUES ($1, $2, $3, $4, $5)
//     //     RETURNING "id", "displayname" as "displayName", "type", "folder_id" as "folderId", "creator_id" as "creatorId"
//     //   `,
//     //   values: [filePath, name, content.type, folderId, id]
//     // }
//     // await db.query(insertFileQuery);
//     //
//     // return res.status(200).send('');
//   } catch (err) {
//     if (err.file === 'ri_triggers.c' && err.code === '23503') {
//       return res.status(400).send({
//         code: errorsCodes.invalidFolder,
//         message: JSON.stringify(err)
//       });
//     }
//
//     console.error('files.controller "uploadFile" function error: ', err);
//
//     return res.status(500).send({
//       code: errorsCodes.internalError,
//       message: JSON.stringify(err)
//     });
//   }
// }

module.exports = {
  initializeUploadFile,
  endUploadFile,
  uploadChunk
}
