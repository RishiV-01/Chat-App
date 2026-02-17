import { Check, CheckCheck } from 'lucide-react';
import { formatMessageTime } from '../../../utils/formatDate';
import FileAttachment from './FileAttachment';

export default function MessageBubble({ message, isOwn }) {
  const senderRole = message.senderId?.role;
  // Figma: "You" for own messages, role title for others (e.g. "Underwriter")
  const senderLabel = isOwn
    ? 'You'
    : senderRole
      ? senderRole.charAt(0).toUpperCase() + senderRole.slice(1)
      : message.senderId?.name || 'Unknown';

  const getStatusIcon = () => {
    if (!isOwn) return null;
    const readCount = message.status?.read?.length || 0;
    const deliveredCount = message.status?.delivered?.length || 0;

    if (readCount > 0) return <CheckCheck size={14} className="text-blue-500" />;
    if (deliveredCount > 0) return <CheckCheck size={14} className="text-gray-400" />;
    return <Check size={14} className="text-gray-400" />;
  };

  if (message.type === 'system') {
    return (
      <div className="my-2 text-center text-xs text-gray-400">
        {message.content}
      </div>
    );
  }

  return (
    <div className="mb-5">
      {/* Sender label with timestamp - right-aligned for own, left-aligned for others */}
      <div className={`mb-1.5 ${isOwn ? 'text-right' : 'text-left'}`}>
        <span className="text-sm font-bold text-gray-800">{senderLabel}</span>
        <span className="text-sm text-gray-500"> - {formatMessageTime(message.createdAt)}</span>
        {isOwn && (
          <span className="ml-1.5 inline-flex align-middle">{getStatusIcon()}</span>
        )}
      </div>

      {/* Message content - full-width flat section */}
      {message.content && (
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">
          {message.content}
        </p>
      )}

      {/* File attachments - horizontal inline chips like Figma */}
      {message.type === 'file' && message.file && (
        <div className="mt-3 flex flex-wrap gap-3">
          <FileAttachment file={message.file} />
        </div>
      )}
    </div>
  );
}
