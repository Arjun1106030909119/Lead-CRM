const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const RequestError = require('../utils/RequestError');
const User = require('../models/user.model');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      throw new RequestError('Authentication required', 401);
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.userId).select('-password');

    if (!user) {
      throw new RequestError('Invalid authentication token', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new RequestError('Invalid or expired token', 401));
    }
    next(error);
  }
};

module.exports = {
  verifyToken,
};
