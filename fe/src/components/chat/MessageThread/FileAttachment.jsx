import useUiStore from '../../../store/uiStore';

export default function FileAttachment({ file }) {
  const { openFilePreview } = useUiStore();

  const isImage = file.mimeType?.startsWith('image/');
  const isPdf = file.mimeType === 'application/pdf';
  const fileUrl = file.url || (file.storagePath ? `/uploads/${file.storagePath}` : null);

  const handleClick = () => {
    if ((isImage || isPdf) && fileUrl) {
      openFilePreview(fileUrl, file.mimeType, file.originalName);
    } else if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
    >
      {file.originalName}
    </button>
  );
}
