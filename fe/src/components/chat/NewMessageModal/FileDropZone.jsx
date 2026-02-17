import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { formatFileSize } from '../../../utils/formatFileSize';

export default function FileDropZone({ selectedFile, onFileSelect, uploading, progress }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  if (selectedFile) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <Upload size={18} className="text-gray-500" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{selectedFile.name}</div>
          <div className="text-xs text-gray-400">{formatFileSize(selectedFile.size)}</div>
          {uploading && (
            <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
              <div
                className="h-1.5 rounded-full bg-navy-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        {!uploading && (
          <button
            onClick={() => onFileSelect(null)}
            className="text-gray-400 hover:text-red-500"
          >
            <X size={18} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
        isDragging ? 'border-navy-400 bg-navy-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <Upload size={24} className="mx-auto mb-2 text-gray-400" />
      <p className="text-sm text-gray-600">
        <span className="font-semibold">Drag & Drop Files</span> or{' '}
        <span className="font-semibold text-navy-600">Browse Files</span>
      </p>
      <p className="mt-1 text-xs text-gray-400">PDF file size no more than 50MB</p>

      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
      />
    </div>
  );
}
