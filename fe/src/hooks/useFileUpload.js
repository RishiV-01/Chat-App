import { useState, useCallback } from 'react';
import { uploadFile } from '../api/fileApi';

export default function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const upload = useCallback(async (file, opportunityId) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const { data } = await uploadFile(file, opportunityId, setProgress);
      setUploading(false);
      setProgress(100);
      return data.file;
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
      setUploading(false);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return { upload, uploading, progress, error, reset };
}
