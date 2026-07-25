import api from './api';

export const fetchUsers = () => api.get('/users');
