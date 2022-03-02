const Validators = require('../validators/validation.schemas');

module.exports = (validator, isQuery) => {
  return async (req, res, next) => {
    try {
      if (isQuery) {
        req.query = await validator.validateAsync(req.query);
      } else {
        req.body = await Validators[validator].validateAsync(req.body);
      }

      next();
    } catch (err) {
      return res.status(500).send({
        error: JSON.stringify(err)
      });
    }
  }
}
