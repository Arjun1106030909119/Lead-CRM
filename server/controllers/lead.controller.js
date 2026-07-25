const LeadService = require('../services/lead.service');

const getLeads = async (req, res, next) => {
  try {
    const result = await LeadService.getLeads(req.user, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getLead = async (req, res, next) => {
  try {
    const lead = await LeadService.getLeadById(req.params.id, req.user);
    res.json({ lead });
  } catch (error) {
    next(error);
  }
};

const createLead = async (req, res, next) => {
  try {
    const lead = await LeadService.createLead(req.body, req.user);
    res.status(201).json({ lead });
  } catch (error) {
    next(error);
  }
};

const updateLead = async (req, res, next) => {
  try {
    const lead = await LeadService.updateLead(req.params.id, req.body, req.user);
    res.json({ lead });
  } catch (error) {
    next(error);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    const result = await LeadService.deleteLead(req.params.id, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
};
