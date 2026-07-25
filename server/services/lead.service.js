const { Lead } = require('../models/lead.model');
const RequestError = require('../utils/RequestError');

class LeadService {
  static appendActivity(lead, activity) {
    lead.activityLog = lead.activityLog || [];
    lead.activityLog.push({
      ...activity,
      timestamp: activity.timestamp || new Date(),
    });
  }

  static async getLeads(user, params = {}) {
    const {
      search,
      status,
      assignedTo,
      sort,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10,
    } = params;

    const query = {};

    if (user.role !== 'ADMIN') {
      query.assignedTo = user._id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (status) {
      query.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { name: searchRegex },
        { company: searchRegex },
        { email: searchRegex },
      ];
    }

    // Sort configuration
    let sortOptions = { createdAt: -1 }; // Default: Newest first

    if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'company') {
      sortOptions = { company: 1, createdAt: -1 };
    } else if (sortBy) {
      const order = (sortOrder === 'asc' || sortOrder === '1') ? 1 : -1;
      sortOptions = { [sortBy]: order };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Lead.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const leads = await Lead.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    return {
      leads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    };
  }

  static async getLeadById(id, user) {
    const lead = await Lead.findById(id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('activityLog.user', 'name email')
      .populate('activityLog.assignedTo', 'name email')
      .populate('activityLog.relatedNote', 'content');
    if (!lead) {
      throw new RequestError('Lead not found', 404);
    }
    if (user.role !== 'ADMIN' && String(lead.assignedTo?._id) !== String(user._id)) {
      throw new RequestError('Forbidden', 403);
    }

    lead.activityLog = (lead.activityLog || []).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    return lead;
  }

  static async createLead(data, user) {
    if (!data.name || !data.email || !data.phone || !data.company) {
      throw new RequestError('Missing required lead fields', 400);
    }
    if (data.assignedTo && user.role !== 'ADMIN') {
      throw new RequestError('Forbidden: only admin can assign leads', 403);
    }

    const activityLog = [
      {
        action: 'CREATED',
        user: user._id,
        note: 'Lead created',
      },
    ];

    if (data.assignedTo && String(data.assignedTo) !== String(user._id)) {
      activityLog.push({
        action: 'ASSIGNED',
        user: user._id,
        assignedTo: data.assignedTo,
        note: 'Lead assigned at creation',
        oldValue: null,
        newValue: String(data.assignedTo),
      });
    }

    const newLead = new Lead({
      ...data,
      createdBy: user._id,
      assignedTo: data.assignedTo || user._id,
      activityLog,
    });

    await newLead.save();
    return await Lead.findById(newLead._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('activityLog.user', 'name email')
      .populate('activityLog.assignedTo', 'name email');
  }

  static async updateLead(id, data, user) {
    const lead = await Lead.findById(id);
    if (!lead) {
      throw new RequestError('Lead not found', 404);
    }
    if (user.role !== 'ADMIN' && String(lead.assignedTo) !== String(user._id)) {
      throw new RequestError('Forbidden', 403);
    }
    if (data.assignedTo && user.role !== 'ADMIN') {
      throw new RequestError('Forbidden: only admin can change assignment', 403);
    }

    const changes = [];
    if (data.status && data.status !== lead.status) {
      changes.push({
        action: 'STATUS_CHANGED',
        user: user._id,
        oldValue: lead.status,
        newValue: data.status,
        note: `Status changed from ${lead.status} to ${data.status}`,
      });
    }

    if (data.assignedTo && String(data.assignedTo) !== String(lead.assignedTo)) {
      changes.push({
        action: 'ASSIGNED',
        user: user._id,
        assignedTo: data.assignedTo,
        oldValue: lead.assignedTo ? String(lead.assignedTo) : undefined,
        newValue: String(data.assignedTo),
        note: 'Lead reassigned',
      });
    }

    const updatedFields = Object.keys(data).filter(
      (key) => ['name', 'email', 'phone', 'company'].includes(key) && String(data[key]) !== String(lead[key])
    );
    if (updatedFields.length > 0) {
      changes.push({
        action: 'UPDATED',
        user: user._id,
        note: `Updated ${updatedFields.join(', ')}`,
      });
    }

    Object.assign(lead, data);
    changes.forEach((activity) => LeadService.appendActivity(lead, activity));

    await lead.save();
    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('activityLog.user', 'name email')
      .populate('activityLog.assignedTo', 'name email')
      .populate('activityLog.relatedNote', 'content');

    updatedLead.activityLog = (updatedLead.activityLog || []).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    return updatedLead;
  }

  static async assignLead(id, assignedToUserId, user) {
    if (user.role !== 'ADMIN') {
      throw new RequestError('Forbidden', 403);
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      throw new RequestError('Lead not found', 404);
    }

    const previousAssignedTo = lead.assignedTo;
    lead.assignedTo = assignedToUserId;
    LeadService.appendActivity(lead, {
      action: 'ASSIGNED',
      user: user._id,
      assignedTo: assignedToUserId,
      note: `Assigned lead to user ${assignedToUserId}`,
      oldValue: previousAssignedTo ? String(previousAssignedTo) : undefined,
      newValue: String(assignedToUserId),
    });

    await lead.save();
    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('activityLog.user', 'name email')
      .populate('activityLog.assignedTo', 'name email')
      .populate('activityLog.relatedNote', 'content');

    updatedLead.activityLog = (updatedLead.activityLog || []).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    return updatedLead;
  }

  static async deleteLead(id, user) {
    const lead = await Lead.findById(id);
    if (!lead) {
      throw new RequestError('Lead not found', 404);
    }
    if (user.role !== 'ADMIN' && String(lead.assignedTo) !== String(user._id)) {
      throw new RequestError('Forbidden', 403);
    }

    await Lead.findByIdAndDelete(id);
    return { message: 'Lead deleted successfully' };
  }
}

module.exports = LeadService;
