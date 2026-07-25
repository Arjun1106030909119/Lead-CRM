const User = require('../models/user.model');
const RequestError = require('../utils/RequestError');

class UserService {
  static async getAllUsers() {
    return User.find().select('name email role');
  }

  static async getUserById(userId) {
    const user = await User.findById(userId).select('name email role');
    if (!user) {
      throw new RequestError('User not found', 404);
    }
    return user;
  }
}

module.exports = UserService;
