const mongoose = require('mongoose');

const leadStatusEnum = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST'];

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    company: { type: String, required: true },
    status: { type: String, enum: leadStatusEnum, default: 'NEW' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activityLog: [
      {
        action: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        relatedNote: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
        oldValue: { type: String },
        newValue: { type: String },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = {
  Lead: mongoose.model('Lead', leadSchema),
  leadStatusEnum,
};
