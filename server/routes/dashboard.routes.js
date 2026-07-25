const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

router.use(verifyToken);
router.get('/', dashboardController.getDashboardSummary);

module.exports = router;
