const express = require('express');
const { body, param } = require('express-validator');
const leadController = require('../controllers/lead.controller');
const validateRequest = require('../middleware/validateRequest');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

const leadValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('status')
    .optional()
    .isIn(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST'])
    .withMessage('Invalid status'),
  body('assignedTo').optional().isMongoId().withMessage('assignedTo must be a valid user id'),
  validateRequest,
];

router.use(verifyToken);

router.get('/', leadController.getLeads);
router.post('/', leadValidation, leadController.createLead);
router.get('/:id', param('id').isMongoId().withMessage('Valid lead id is required'), validateRequest, leadController.getLead);
router.put('/:id', param('id').isMongoId().withMessage('Valid lead id is required'), validateRequest, leadController.updateLead);
router.delete('/:id', param('id').isMongoId().withMessage('Valid lead id is required'), validateRequest, leadController.deleteLead);

module.exports = router;
