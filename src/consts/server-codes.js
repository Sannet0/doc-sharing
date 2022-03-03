const errorsCodes = {
  internalError: 'INTERNAL_ERROR',
  userExist: 'USER_EXIST',
  validatorError: 'VALIDATOR_ERROR',
  invalidEmailOrPassword: 'INVALID_EMAIL_OR_PASSWORD',
  invalidToken: 'INVALID_TOKEN'
}

const successCodes = {
  successRegistration: 'SUCCESS_REGISTRATION',
}

module.exports = {
  errorsCodes,
  successCodes
}
