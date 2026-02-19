import api from './axiosInstance';

// =============================================================================
// POC: File upload to local backend (current — Multer disk storage)
// =============================================================================
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

// =============================================================================
// PRODUCTION: File upload via ChatApp backend -> Parent App File API
// =============================================================================
// The upload function above works the same way in production.
// The ChatApp backend proxies the multipart upload to the parent app's file API.
// No frontend changes needed for the upload flow itself.
//
// However, if the parent app provides pre-signed S3 upload URLs for
// direct browser-to-S3 uploads (bypassing the backend), use this:
//
// export const uploadFileDirect = async (file, opportunityId, onProgress) => {
//   // Step 1: Get pre-signed upload URL from ChatApp backend
//   const { data: { uploadUrl, fileId } } = await api.post('/files/request-upload', {
//     opportunityId,
//     fileName: file.name,
//     mimeType: file.type,
//     size: file.size,
//   });
//
//   // Step 2: Upload directly to S3 using the pre-signed URL
//   await axios.put(uploadUrl, file, {
//     headers: { 'Content-Type': file.type },
//     onUploadProgress: (e) => {
//       if (onProgress && e.total) {
//         onProgress(Math.round((e.loaded * 100) / e.total));
//       }
//     },
//   });
//
//   // Step 3: Confirm upload with ChatApp backend
//   const { data } = await api.post('/files/confirm-upload', { fileId, opportunityId });
//   return { data };
// };
