const express = require('express');
const { body, param } = require('express-validator');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const noteController = require('../controllers/note.controller');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(verifyToken);

router.get(
  '/leads/:leadId/notes',
  param('leadId').isMongoId().withMessage('Valid lead id is required'),
  validateRequest,
  noteController.getNotes
);

router.post(
  '/leads/:leadId/notes',
  param('leadId').isMongoId().withMessage('Valid lead id is required'),
  body('content').trim().notEmpty().withMessage('Note content is required'),
  validateRequest,
  noteController.addNote
);

router.delete(
  '/notes/:id',
  requireRole('ADMIN'),
  param('id').isMongoId().withMessage('Valid note id is required'),
  validateRequest,
  noteController.deleteNote
);

module.exports = router;
