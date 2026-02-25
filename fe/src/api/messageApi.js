import api from './axiosInstance';

export const getMessages = (oppId, params = {}) =>
  api.get(`/messages/opportunities/${oppId}/messages`, { params });

export const sendMessageRest = (oppId, data) =>
  api.post(`/messages/opportunities/${oppId}/messages`, data);

export const exportChat = (oppId) =>
  api.get(`/messages/opportunities/${oppId}/export`);
