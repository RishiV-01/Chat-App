import api from './axiosInstance';

export const getOpportunities = (status) =>
  api.get('/opportunities', { params: status ? { status } : {} });

export const getOpportunity = (id) => api.get(`/opportunities/${id}`);

export const updateOpportunity = (id, data) => api.patch(`/opportunities/${id}`, data);
