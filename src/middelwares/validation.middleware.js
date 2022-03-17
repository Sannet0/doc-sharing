const { errorsCodes } = require('../consts/server-codes');


module.exports = (validator, isQuery = false) => {
  return async (req, res, next) => {
    try {
      if (isQuery) {
        req.query = await validator.validateAsync(req.query);
      } else {
        req.body = await validator.validateAsync(req.body);
      }

      next();
    } catch (err) {
      return res.status(400).send({
        code: errorsCodes.validatorError,
        error: err.message || JSON.stringify(err)
      });
    }
  }
}
