const db = require('../modules/database.module');
const passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const con = require('../consts/base-const');
const sharp = require('sharp');
const { errorsCodes, successCodes } = require('../consts/server-codes');

const extractTypeBase64 = (image) => {
  if(image) {
    const data = image.split(/\s/g);
    const info = data[0].split(/[^a-zа-яё0-9]/gi);

    return {
      base64: data[1],
      type: info[2]
    }
  }

  return {
    base64: '',
    type: ''
  }
}

const signup = async (req, res) => {
  let { email, password, fullName, displayName, avatarImage } = req.body;
  let miniatureAvatarImage = '';
  avatarImage = extractTypeBase64(avatarImage)

  try {
    const imageBase64 = avatarImage?.base64;

    if(imageBase64) {
      const filePath = con.correctOriginPath() + '/src/files/temporary/avatar-' + email + '.' + avatarImage.type;

      fs.writeFileSync(filePath, imageBase64, { encoding: 'base64' });
      const miniatureBuffer = await sharp(filePath).resize(48).toBuffer();

      miniatureAvatarImage = miniatureBuffer.toString('base64');
      fs.rmSync(filePath);
    }
    const hash = passwordHash.generate(password);

    const createUsersQuery = {
      text: `
          INSERT INTO users ("email", "password", "fullname", "displayname")
          VALUES ($1, $2, $3, $4)
          RETURNING id
      `,
      values: [email, hash, fullName, displayName]
    }
    const createUsersReturnValues = await db.query(createUsersQuery);
    const userId =  createUsersReturnValues.rows[0].id;

    if(imageBase64) {
      const saveUserAvatarImage = {
        text: `
        INSERT INTO user_profile_photo ("original", "miniature", "user_id")
        VALUES ($1, $2, $3)
      `,
        values: [imageBase64, miniatureAvatarImage, userId]
      }
      await db.query(saveUserAvatarImage);
    }

    return res.status(201).send({
      code: successCodes.successRegistration,
      message: 'registration success'
    });
  } catch (err) {
    if(err.file === 'nbtinsert.c') {
      if(err.code === '23505') {
        return res.status(500).send({
          code: errorsCodes.userExist,
          message: JSON.stringify(err)
        });
      }
    }

    return res.status(500).send({
      code: errorsCodes.internalError,
      message: JSON.stringify(err)
    });
  }
}

const signin = async (req, res) => {
  const { email, password } = req.query;
  try {
    const userQuery = {
      text: `
          SELECT * FROM users
          WHERE email = $1
          LIMIT 1
      `,
      values: [email],
    }
    const matchedUsers = await db.query(userQuery);
    const accurateUser = matchedUsers.rows[0];

    if (!accurateUser) {
      return res.status(404).send({
        code: errorsCodes.invalidUser,
        message: 'no such user'
      });
    }

    const isPasswordCorrect = passwordHash.verify(password, accurateUser.password);

    if(!isPasswordCorrect) {
      return res.status(500).send({
        code: errorsCodes.invalidUser,
        message: 'invalid email or password'
      });
    }

    const payload = { id: accurateUser.id, email: accurateUser.email };

    const imageQuery = {
      text: `
          SELECT * FROM user_profile_photo
          WHERE user_id = $1
          LIMIT 1
      `,
      values: [accurateUser.id],
    }
    const matchedImages = await db.query(imageQuery);
    const actualImage = matchedImages.rows[0];

    return res.status(200).send({
      userData: {
        displayName: accurateUser.displayname,
        fullName: accurateUser.fullname
      },
      authData: {
        accessToken: jwt.sign(payload, '' + process.env.SECRET, { expiresIn: '30m' }),
        refreshToken: jwt.sign(payload, '' + process.env.SECRET, { expiresIn: '24h' }),
        miniatureAvatar: actualImage?.miniature,
        originalAvatar: actualImage?.original
      }
    });
  } catch (err) {
    return res.status(500).send({
      code: errorsCodes.internalError,
      message: JSON.stringify(err)
    });
  }
}

module.exports = {
  signup,
  signin
}
