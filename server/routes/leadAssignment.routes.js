const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const leadAssignmentController = require('../controllers/leadAssignment.controller');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(verifyToken, requireRole('ADMIN'));

router.patch(
  '/:id/assign',
  param('id').isMongoId().withMessage('Valid lead id is required'),
  body('assignedTo').isMongoId().withMessage('Valid user id is required'),
  validateRequest,
  leadAssignmentController.assignLead
);

module.exports = router;
