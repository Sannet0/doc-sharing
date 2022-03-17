const fsPromises = require('fs').promises;
const fs = require('fs');
const { correctOriginPath, extractTypeBase64 } = require('../consts/base-const')
const { errorsCodes } = require('../consts/server-codes');
const { v4: uuid } = require('uuid');
const db = require('../modules/database.module');

const uploadFile = async (req, res) => {
  try {
    let { folderId, content, name } = req.body;
    const  { id } = req.user;
    content = extractTypeBase64(content);

    if ( folderId === 0 ) {
      folderId = null
    }

    const contentBase64 = content.base64;
    const origFilePath = correctOriginPath(1) + '/files';

    fs.lstat(origFilePath, async (err) => {
      if (err) {
        await fsPromises.mkdir(origFilePath);
      }
    });

    const filePath = origFilePath + '/' + uuid() + '.' + content.type;

    await fsPromises.writeFile(filePath, contentBase64, { encoding: 'base64' });

    const insertFileQuery = {
      text: `
        INSERT INTO files ("path", "displayname", "type", "folder_id", "creator_id")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING "id", "path", "displayname" as "displayName", "type", "folder_id" as "folderId", "creator_id" as "creatorId"
      `,
      values: [filePath, name, content.type, folderId, id]
    }
    await db.query(insertFileQuery);

    return res.status(200).send('');
  } catch (err) {
    if (err.file === 'ri_triggers.c' && err.code === '23503') {
      return res.status(400).send({
        code: errorsCodes.invalidFolder,
        message: JSON.stringify(err)
      });
    }

    console.error('files.controller "uploadFile" function error: ', err);

    return res.status(500).send({
      code: errorsCodes.internalError,
      message: JSON.stringify(err)
    });
  }
}

module.exports = {
  uploadFile
}
