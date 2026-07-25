const AuthService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    await AuthService.register(name, email, password, role);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const token = await AuthService.login(email, password);
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
