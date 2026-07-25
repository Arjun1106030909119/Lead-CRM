const { Lead } = require('../models/lead.model');
const Note = require('../models/note.model');

class DashboardService {
  static async getDashboardSummary(user) {
    const isUserAdmin = user.role === 'ADMIN';
    const leadQuery = isUserAdmin ? {} : { assignedTo: user._id };

    // Metric counts
    const [totalLeads, won, lost, qualified] = await Promise.all([
      Lead.countDocuments(leadQuery),
      Lead.countDocuments({ ...leadQuery, status: 'WON' }),
      Lead.countDocuments({ ...leadQuery, status: 'LOST' }),
      Lead.countDocuments({ ...leadQuery, status: 'QUALIFIED' }),
    ]);

    // Recent leads (latest 5)
    const recentLeads = await Lead.find(leadQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    // Recent notes (latest 5)
    let noteQuery = {};
    if (!isUserAdmin) {
      const userLeadIds = await Lead.find(leadQuery).distinct('_id');
      noteQuery = { lead: { $in: userLeadIds } };
    }

    const recentNotes = await Note.find(noteQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('lead', 'name company');

    return {
      metrics: {
        totalLeads,
        won,
        lost,
        qualified,
      },
      recentLeads,
      recentNotes,
    };
  }
}

module.exports = DashboardService;
