const UserService = require('../services/user.service');

const getUsers = async (req, res, next) => {
  try {
    const users = await UserService.getAllUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
};
