const fsPromises = require('fs').promises;
const fs = require('fs');
const multiparty = require('multiparty');
const { v4: uuid } = require('uuid');
const { correctOriginPath, extractTypeBase64 } = require('../consts/base-const')
const { errorsCodes } = require('../consts/server-codes');
const db = require('../modules/database.module');
const util = require('util');

const uploadFile = async (req, res) => {
  //let { folderId, content, name } = req.body;
  const  { id } = req.user;
  const form = new multiparty.Form();

  form.parse(req, function(err, fields, files) {
    // res.writeHead(200, { 'content-type': 'text/plain' });
    // res.write('received upload:\n\n');
    //res.end(util.inspect({ fields: fields, files: files }));

    return res.status(200).send({
      fields, files
    });
  });

  // form.on('file', async (name,file) => {
  //   return res.status(200).send({
  //     name, file
  //   });
  // })

  try {
    // content = extractTypeBase64(content);
    //
    // if ( folderId === 0 ) {
    //   folderId = null
    // }
    //
    // const contentBase64 = content.base64;
    // const origFilePath = correctOriginPath(1) + '/files';
    //
    // fs.lstat(origFilePath, async (err) => {
    //   if (err) {
    //     await fsPromises.mkdir(origFilePath);
    //   }
    // });
    //
    // const filePath = origFilePath + '/' + uuid() + '.' + content.type;
    //
    // await fsPromises.writeFile(filePath, contentBase64, { encoding: 'base64' });
    //
    // const insertFileQuery = {
    //   text: `
    //     INSERT INTO files ("path", "displayname", "type", "folder_id", "creator_id")
    //     VALUES ($1, $2, $3, $4, $5)
    //     RETURNING "id", "path", "displayname" as "displayName", "type", "folder_id" as "folderId", "creator_id" as "creatorId"
    //   `,
    //   values: [filePath, name, content.type, folderId, id]
    // }
    // await db.query(insertFileQuery);
    //
    // return res.status(200).send('');
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
