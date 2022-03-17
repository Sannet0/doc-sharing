const jwt = require('jsonwebtoken');
const db = require('../modules/database.module');

module.exports = async (req, res, next) => {
  let authHeader = req.header('Authorization') || '';

  try {
    authHeader = authHeader.split(' ');
    const type = authHeader[0];
    const token = authHeader[1];

    if (type !== 'Bearer') {
      throw 'invalid token type';
    }

    const { id, isRefreshToken } = jwt.verify(token, process.env.JWT_SECRET);

    if (isRefreshToken) {
      throw 'not a access token';
    }

    const userTokensQuery = {
      text: `
        SELECT 
          access_token as "accessToken"
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      values: [id],
    }
    const matchedUsers = await db.query(userTokensQuery);
    const { accessToken } = matchedUsers.rows[0];

    if (accessToken !== token) {
      throw 'incorrect token';
    }

    req.user = { id };

    next();
  } catch (err) {
    return res.status(401).send({
      message: err.message || JSON.stringify(err)
    });
  }
}
