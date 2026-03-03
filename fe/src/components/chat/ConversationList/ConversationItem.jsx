import Avatar from '../../common/Avatar';
import Badge from '../../common/Badge';
import useAuthStore from '../../../store/authStore';
import usePresenceStore from '../../../store/presenceStore';
import { formatRelativeTime } from '../../../utils/formatDate';

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
  const otherUserId = otherUser?._id || otherUser;

  const isOnline = usePresenceStore((s) => otherUserId ? s.onlineUsers.has(otherUserId) : false);
  const lastSeen = usePresenceStore((s) => otherUserId ? s.lastSeen[otherUserId] : null);

  const ts = formatTimestamp(lastMsg?.createdAt || opportunity.createdAt);

  return (
    <div className={`flex p-[1px] w-[95%] mx-auto my-1 xs:my-1.5 sm:my-2 rounded-xl ${isActive ? 'bg-gradient-to-r from-[#162850] to-[#1e6daf] shadow-[0_4px_4px_#00000040]' : 'hover:bg-gray-50'
      }`}>
      <button
        onClick={onClick}
        className={`w-full items-center gap-3 border-gray-200  text-left transition-colors`}
      >
        <div className='bg-gray-200 flex p-1 xs:p-1.5 sm:p-2 items-center gap-1.5 xs:gap-2 sm:gap-3 rounded-xl'>
          <Avatar user={otherUser || { name: opportunity.name }} size="md" showPresence />

          <div className="min-w-0 flex-1">
            <div className="font-bold text-[10px] xs:text-xs sm:text-sm text-gray-900 truncate">{opportunity.name}</div>
            <div className="truncate text-[9px] xs:text-[10px] sm:text-xs text-gray-500 mt-0.5">{preview}</div>
            {otherUser && !isOnline && lastSeen && (
              <div className="text-[8px] xs:text-[9px] sm:text-[10px] text-gray-400 mt-0.5 hidden xs:block">
                Last seen {formatRelativeTime(lastSeen)}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
            <span className="text-[9px] xs:text-[10px] sm:text-[11px] text-gray-400 leading-tight">{ts.date}</span>
            <span className="text-[9px] xs:text-[10px] sm:text-[11px] text-gray-400 leading-tight">{ts.time}</span>
            <Badge count={opportunity.unreadCount} />
          </div>
        </div>
      </button>
    </div>
  );
}
