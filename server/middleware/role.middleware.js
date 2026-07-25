const RequestError = require('../utils/RequestError');

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new RequestError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new RequestError('Forbidden: insufficient permissions', 403));
    }

    next();
  };
};

module.exports = {
  requireRole,
};
