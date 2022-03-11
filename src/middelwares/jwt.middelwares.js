const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  let authHeader = req.header('Authorization') || '';

  try {
    authHeader = authHeader.split(' ');
    const type = authHeader[0];
    const token = authHeader[1];

    console.log("LOOOG", req.header('Authorization'));

    if (type !== 'Bearer') {
      return res.status(401).send({
        message: 'invalid token type'
      });
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);

    next();
  } catch (err) {
    return res.status(401).send({
      message: JSON.stringify(err)
    });
  }
}
