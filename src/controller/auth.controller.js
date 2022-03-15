const db = require('../modules/database.module');
const passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const con = require('../consts/base-const');
const sharp = require('sharp');
const { errorsCodes } = require('../consts/server-codes');

const extractTypeBase64 = (image) => {
  const data = {
    base64: '',
    type: ''
  }
  const [ info, base64 ] = image?.split(',') || [];
  data.base64 = base64 || '';
  data.type = info?.split(/[^a-zа-яё0-9]/gi)[2] || '';
  return data;
}

const generateTokenPayload = (userId, isRefreshToken) => {
  return { id: userId, isRefreshToken };
}

const generateUserTokens = async (userId) => {
  const accessTokenPayload = generateTokenPayload(userId, false);
  const refreshTokenPayload = generateTokenPayload(userId, true);

  const authData = {
    accessToken: jwt.sign(accessTokenPayload, '' + process.env.JWT_SECRET, { expiresIn: '' + process.env.ACCESS_TOKEN_EXPIRES_IN }),
    refreshToken: jwt.sign(refreshTokenPayload, '' + process.env.JWT_SECRET, { expiresIn: '' + process.env.REFRESH_TOKEN_EXPIRES_IN })
  }

  const updateTokensQuery = {
    text: `
        UPDATE users
        SET access_token = $1,
            refresh_token = $2
        WHERE id = $3
      `,
    values: [authData.accessToken, authData.refreshToken, userId],
  }
  await db.query(updateTokensQuery);

  return authData;
}

const signup = async (req, res) => {
  let { email, password, fullName, displayName, avatarImage } = req.body;
  let miniatureAvatarImage = '';
  let originalAvatarImage = '';
  avatarImage = extractTypeBase64(avatarImage);

  try {
    const imageBase64 = avatarImage?.base64;
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
      const filePath = con.correctOriginPath() + '/src/files/temporary/avatar-' + email + '.' + avatarImage.type;

      await fs.writeFile(filePath, imageBase64, { encoding: 'base64' });
      const miniatureBuffer = await sharp(filePath).resize(48).toBuffer();
      const base64orig = 'data:image/' + avatarImage.type + ';base64,';

      originalAvatarImage = base64orig + imageBase64;
      miniatureAvatarImage = base64orig + miniatureBuffer.toString('base64');
      await fs.rm(filePath);

      const saveUserAvatarImage = {
        text: `
          INSERT INTO user_profile_photo ("original", "miniature", "user_id")
          VALUES ($1, $2, $3)
        `,
        values: [originalAvatarImage, miniatureAvatarImage, userId]
      }
      await db.query(saveUserAvatarImage);
    }

    return res.status(201).send({
      message: 'registration success'
    });
  } catch (err) {
    if (err.file === 'nbtinsert.c' && err.code === '23505') {
      return res.status(500).send({
        code: errorsCodes.userExist,
        message: JSON.stringify(err)
      });
    }

    const deleteUserOnError = {
      text: `
        DELETE FROM users
        WHERE "email" = $1
      `,
      values: [email]
    }
    await db.query(deleteUserOnError);

    console.error('auth.controller "signup" function error: ', err);

    return res.status(500).send({
      code: errorsCodes.internalError,
      message: err.message || JSON.stringify(err)
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

    if (!isPasswordCorrect) {
      return res.status(500).send({
        code: errorsCodes.invalidUser,
        message: 'invalid email or password'
      });
    }

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

    const authData = await generateUserTokens(accurateUser.id);

    return res.status(200).send({
      userData: {
        displayName: accurateUser.displayname || '',
        fullName: accurateUser.fullname,
        email: accurateUser.email,
        miniatureAvatar: actualImage?.miniature  || '',
        originalAvatar: actualImage?.original  || ''
      },
      authData
    });
  } catch (err) {
    console.error('auth.controller "signin" function error: ', err);

    return res.status(500).send({
      code: errorsCodes.internalError,
      message: JSON.stringify(err)
    });
  }
}

const authWithRefToken = async (req, res) => {
  let authHeader = req.header('Authorization') || ' ';

  try {
    authHeader = authHeader.split(' ');
    const type = authHeader[0];
    const token = authHeader[1];

    if (type !== 'Bearer') {
      throw { message: 'invalid token type' };
    }

    const { id, isRefreshToken } = jwt.verify(token, process.env.JWT_SECRET);

    if (!isRefreshToken) {
      throw { message: 'incorrect token' };
    }

    const userTokensQuery = {
      text: `
        SELECT 
          refresh_token as "refreshToken"
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      values: [id],
    }
    const matchedUsers = await db.query(userTokensQuery);
    const { refreshToken } = matchedUsers.rows[0];

    if (refreshToken !== token) {
      throw { message: 'incorrect token' };
    }

    const authData = await generateUserTokens(id);

    return res.status(200).send({
      authData
    });
  } catch (err) {
    return res.status(403).send({
      code: errorsCodes.invalidToken,
      message: err.message || JSON.stringify(err)
    });
  }
}

module.exports = {
  signup,
  signin,
  authWithRefToken
}
