import api from './axiosInstance';

export const uploadFile = (file, opportunityId, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('opportunityId', opportunityId);

  return api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
};
