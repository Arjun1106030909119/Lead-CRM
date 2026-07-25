const NoteService = require('../services/note.service');

const getNotes = async (req, res, next) => {
  try {
    const notes = await NoteService.getNotesByLeadId(req.params.leadId, req.user);
    res.json({ notes });
  } catch (error) {
    next(error);
  }
};

const addNote = async (req, res, next) => {
  try {
    const note = await NoteService.addNoteToLead(req.params.leadId, req.body.content, req.user);
    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const result = await NoteService.deleteNoteById(req.params.id, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotes,
  addNote,
  deleteNote,
};
