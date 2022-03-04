const jwt = require('jsonwebtoken');
const { errorsCodes } = require('../consts/server-codes');

module.exports = async (req, res, next) => {
  let authHeader = req.header('Authorization') || ' ';

  try {
    authHeader = authHeader.split(' ');
    const type = authHeader[0];
    const token = authHeader[1];

    if(type !== 'Bearer') {
      return res.status(401).send({
        code: errorsCodes.invalidToken,
        message: 'invalid token type'
      });
    }

    req.user = jwt.verify(token, process.env.SECRET);

    next();
  } catch (err) {
    if(err.name === 'JsonWebTokenError') {
      return res.status(401).send({
        code: errorsCodes.invalidToken,
        message: JSON.stringify(err)
      });
    }

    return res.status(500).send({
      code: errorsCodes.internalError,
      error: JSON.stringify(err)
    });
  }
}
