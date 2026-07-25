const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.use(verifyToken);
router.get('/', userController.getUsers);

module.exports = router;
