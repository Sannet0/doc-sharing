const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  let authHeader = req.header('Authorization') || ' ';

  try {
    authHeader = authHeader.split(' ');
    const type = authHeader[0];
    const token = authHeader[1];

    if(type !== 'Bearer') {
      throw { message: 'unauthorized', statusCode: 401 };
    }

    req.user = jwt.verify(token, process.env.SECRET);

    next();
  } catch (err) {
    return res.status(500).send({
      error: JSON.stringify(err)
    });
  }
}
