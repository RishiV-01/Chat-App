import { X, Download } from 'lucide-react';
import useUiStore from '../../store/uiStore';

export default function FilePreviewModal() {
  const { filePreview, closeFilePreview } = useUiStore();
  const { isOpen, url, type, name } = filePreview;

  if (!isOpen) return null;

  const isImage = type?.startsWith('image/');
  const isPdf = type === 'application/pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-black/50 px-6 py-3 text-white">
        <span className="truncate text-sm font-medium">{name}</span>
        <div className="flex items-center gap-2">
          <a
            href={url}
            download={name}
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/20"
            title="Download"
          >
            <Download size={18} />
          </a>
          <button
            onClick={closeFilePreview}
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-12 max-h-[85vh] max-w-[90vw] overflow-auto" onClick={closeFilePreview}>
        {isImage && (
          <img
            src={url}
            alt={name}
            className="max-h-[85vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {isPdf && (
          <iframe
            src={url}
            title={name}
            className="h-[85vh] w-[80vw] rounded bg-white"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
    </div>
  );
}
