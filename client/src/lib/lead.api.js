import api from './api';

export const fetchLeads = (params = {}) => api.get('/leads', { params });
export const fetchLead = (id) => api.get(`/leads/${id}`);
export const createLead = (payload) => api.post('/leads', payload);
export const updateLead = (id, payload) => api.put(`/leads/${id}`, payload);
export const assignLead = (id, payload) => api.patch(`/leads/${id}/assign`, payload);
export const deleteLead = (id) => api.delete(`/leads/${id}`);
