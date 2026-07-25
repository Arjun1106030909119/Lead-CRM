const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const RequestError = require('../utils/RequestError');
const { JWT_SECRET } = require('../config');

class AuthService {
  static async register(name, email, password, role = 'MEMBER') {
    if (!name || !email || !password) {
      throw new RequestError('Missing name, email, or password', 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new RequestError('User already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    return user;
  }

  static async login(email, password) {
    if (!email || !password) {
      throw new RequestError('Missing email or password', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new RequestError('Invalid credentials', 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new RequestError('Invalid credentials', 401);
    }

    return jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '1h',
    });
  }
}

module.exports = AuthService;
