import { Check, CheckCheck } from 'lucide-react';
import { formatMessageTime } from '../../../utils/formatDate';
import FileAttachment from './FileAttachment';

export default function MessageBubble({ message, isOwn, variant = 'full' }) {
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

    if (readCount > 0) return <CheckCheck size={10} className="xs:w-3 xs:h-3 text-blue-500 sm:w-[14px] sm:h-[14px]" />;
    if (deliveredCount > 0) return <CheckCheck size={10} className="xs:w-3 xs:h-3 text-gray-400 sm:w-[14px] sm:h-[14px]" />;
    return <Check size={10} className="xs:w-3 xs:h-3 text-gray-400 sm:w-[14px] sm:h-[14px]" />;
  };

  if (message.type === 'system') {
    return (
      <div className="my-1.5 xs:my-2 text-center text-[9px] xs:text-[10px] sm:text-xs text-gray-400">
        {message.content}
      </div>
    );
  }

  // Modal variant - clean bubbles aligned left/right
  if (variant === 'modal') {
    return (
      <div className={`mb-2 xs:mb-3 sm:mb-4 flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-[90%] xs:max-w-[85%] sm:max-w-[75%]">
          {/* Sender label with timestamp */}
          <div className={`mb-0.5 xs:mb-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            <span className="text-[9px] xs:text-[10px] sm:text-xs text-gray-600">{senderLabel}</span>
            <span className="text-[9px] xs:text-[10px] sm:text-xs text-gray-600"> - {formatMessageTime(message.createdAt)}</span>
            {isOwn && (
              <span className="ml-1 xs:ml-1.5 inline-flex align-middle">{getStatusIcon()}</span>
            )}
          </div>

          {/* Message content - bubble with border */}
          {message.content && (
            <div 
              className="whitespace-pre-wrap break-words rounded-2xl border border-gray-900 bg-white px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 text-[10px] xs:text-xs sm:text-sm leading-relaxed text-gray-800"
              dangerouslySetInnerHTML={{ __html: message.content }}
            />
          )}

          {/* File attachments */}
          {message.type === 'file' && message.file && (
            <div className="mt-1.5 xs:mt-2 flex flex-wrap gap-1.5 xs:gap-2">
              <FileAttachment file={message.file} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default/full variant - original flat design
  return (
    <div className="mb-2 xs:mb-3 sm:mb-5 bg-[#d3d3d36e] p-1.5 xs:p-2 sm:p-4 rounded-xl">
      {/* Sender label with timestamp - right-aligned for own, left-aligned for others */}
      <div className={`mb-0.5 xs:mb-1 sm:mb-1.5 ${isOwn ? 'text-right' : 'text-left'}`}>
        <span className="text-[10px] xs:text-xs sm:text-sm font-bold text-gray-800">{senderLabel}</span>
        <span className="text-[10px] xs:text-xs sm:text-sm font-bold text-gray-800"> - {formatMessageTime(message.createdAt)}</span>
        {isOwn && (
          <span className="ml-1 xs:ml-1.5 inline-flex align-middle">{getStatusIcon()}</span>
        )}
      </div>

      {/* Message content - full-width flat section */}
      {message.content && (
        <div className="whitespace-pre-wrap break-words text-[10px] xs:text-xs sm:text-sm leading-relaxed text-gray-700"
          dangerouslySetInnerHTML={{ __html: message.content }}
        />
      )}

      {/* File attachments - horizontal inline chips like Figma */}
      {message.type === 'file' && message.file && (
        <div className="mt-1.5 xs:mt-2 sm:mt-3 flex flex-wrap gap-1.5 xs:gap-2 sm:gap-3">
          <FileAttachment file={message.file} />
        </div>
      )}
    </div>
  );
}
