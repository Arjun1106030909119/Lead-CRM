const Note = require('../models/note.model');
const LeadService = require('./lead.service');
const RequestError = require('../utils/RequestError');

class NoteService {
  static async getNotesByLeadId(leadId, user) {
    await LeadService.getLeadById(leadId, user);
    return Note.find({ lead: leadId }).populate('user', 'name email').sort({ createdAt: -1 });
  }

  static async addNoteToLead(leadId, content, user) {
    if (!content || !content.trim()) {
      throw new RequestError('Note content is required', 400);
    }

    const lead = await LeadService.getLeadById(leadId, user);

    const note = new Note({
      lead: leadId,
      user: user._id,
      content: content.trim(),
    });

    await note.save();

    LeadService.appendActivity(lead, {
      action: 'NOTE_ADDED',
      user: user._id,
      relatedNote: note._id,
      note: 'Note added',
      oldValue: undefined,
      newValue: content.trim().slice(0, 100),
    });
    await lead.save();

    return note.populate('user', 'name email');
  }

  static async deleteNoteById(noteId, user) {
    if (user.role !== 'ADMIN') {
      throw new RequestError('Forbidden', 403);
    }

    const note = await Note.findById(noteId);
    if (!note) {
      throw new RequestError('Note not found', 404);
    }

    await Note.findByIdAndDelete(noteId);
    return { message: 'Note deleted successfully' };
  }
}

module.exports = NoteService;
