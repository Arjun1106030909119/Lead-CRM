import api from './api';

export const fetchNotes = (leadId) => api.get(`/leads/${leadId}/notes`);
export const addNote = (leadId, payload) => api.post(`/leads/${leadId}/notes`, payload);
export const deleteNote = (noteId) => api.delete(`/notes/${noteId}`);
