const LeadService = require('../services/lead.service');

const assignLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    const lead = await LeadService.assignLead(id, assignedTo, req.user);
    res.json({ lead });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  assignLead,
};
