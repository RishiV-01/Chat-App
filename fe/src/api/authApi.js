import api from './axiosInstance';

export const loginUser = (userId) => api.post('/auth/login', { userId });

export const getCurrentUser = () => api.get('/auth/me');

export const getAllUsers = () => api.get('/users');
