const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

const router = express.Router();

router.get('/dashboard', verifyToken, (req, res) => {
  res.json({
    message: 'Protected dashboard route accessed',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

router.get('/admin', verifyToken, requireRole('ADMIN'), (req, res) => {
  res.json({
    message: 'Admin route accessed',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = router;
