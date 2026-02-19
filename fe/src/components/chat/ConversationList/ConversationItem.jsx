import Avatar from '../../common/Avatar';
import Badge from '../../common/Badge';
import useAuthStore from '../../../store/authStore';

function formatTimestamp(date) {
  if (!date) return { date: '', time: '' };
  const d = new Date(date);
  return {
    date: d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
  };
}

export default function ConversationItem({ opportunity, isActive, onClick }) {
  const currentUserId = useAuthStore((s) => s.user?._id);
  const lastMsg = opportunity.lastMessage;
  const preview = lastMsg
    ? lastMsg.type === 'file'
      ? `Shared a file: ${lastMsg.file?.originalName || 'file'}`
      : lastMsg.content?.replace(/<[^>]+>/g, ' ')
    : 'No messages yet';

  // Get the other participant (not current user)
  const otherParticipant = opportunity.participants?.find(
    (p) => (p.userId?._id || p.userId) !== currentUserId,
  );
  const otherUser = otherParticipant?.userId;

  const ts = formatTimestamp(lastMsg?.createdAt || opportunity.createdAt);

  return (
    <div className={`flex p-[2px] w-[95%] mx-auto rounded-xl ${isActive ? 'bg-gradient-to-r from-pink-500 to-blue-500' : 'hover:bg-gray-50'
      }`}>
      <button
        onClick={onClick}
        className={`w-full items-center gap-3 border-gray-200  text-left transition-colors`}
      >
        <div className='bg-gray-200 flex p-2 items-center gap-3 rounded-xl'>
          <Avatar user={otherUser || { name: opportunity.name }} size="md" showPresence />

          <div className="min-w-0 flex-1">
            <div className="font-bold text-sm text-gray-900 truncate">{opportunity.name}</div>
            <div className="truncate text-xs text-gray-500 mt-0.5">{preview}</div>
          </div>

          <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
            <span className="text-[11px] text-gray-400 leading-tight">{ts.date}</span>
            <span className="text-[11px] text-gray-400 leading-tight">{ts.time}</span>
            <Badge count={opportunity.unreadCount} />
          </div>
        </div>
      </button>
    </div>
  );
}
