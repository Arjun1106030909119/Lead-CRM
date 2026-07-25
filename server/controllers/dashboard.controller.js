const DashboardService = require('../services/dashboard.service');

const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await DashboardService.getDashboardSummary(req.user);
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
};
