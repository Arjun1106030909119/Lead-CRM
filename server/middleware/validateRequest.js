const { validationResult } = require('express-validator');
const RequestError = require('../utils/RequestError');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((error) => `${error.param}: ${error.msg}`).join(', ');
    return next(new RequestError(message, 400));
  }
  next();
};

module.exports = validateRequest;
