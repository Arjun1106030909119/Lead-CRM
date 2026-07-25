import api from './api';

export const fetchDashboardData = () => api.get('/dashboard');
