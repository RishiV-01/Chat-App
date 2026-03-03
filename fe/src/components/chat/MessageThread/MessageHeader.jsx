import { Download, Lock } from 'lucide-react';
import { exportChat } from '../../../api/messageApi';
import useAuthStore from '../../../store/authStore';
import OnlineIndicator from '../../common/OnlineIndicator';

export default function MessageHeader({ opportunity }) {
  const currentUserId = useAuthStore((s) => s.user?._id);

  if (!opportunity) return null;

  // Find the other participant
  const otherParticipant = opportunity.participants?.find(
    (p) => (p.userId?._id || p.userId) !== currentUserId,
  );
  const otherUser = otherParticipant?.userId;

  const handleExport = async () => {
    try {
      const { data } = await exportChat(opportunity._id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-export-${opportunity.opportunityId || opportunity._id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="border-b">
      <div className="flex items-center justify-between px-2 xs:px-3 sm:px-6 py-1.5 xs:py-2 sm:py-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[10px] xs:text-xs sm:text-sm font-bold uppercase tracking-wider text-navy-800 truncate">
            [{opportunity.name}] Conversation
          </h3>
          {otherUser && (
            <div className="mt-0.5 xs:mt-1">
              <OnlineIndicator
                userId={otherUser._id || otherUser}
                showLabel
                userName={otherUser.name}
              />
            </div>
          )}
        </div>
        <button
          onClick={handleExport}
          title="Export Chat"
          className="flex items-center gap-0.5 xs:gap-1 rounded px-1.5 xs:px-2 py-0.5 xs:py-1 text-[10px] xs:text-xs sm:text-sm text-gray-500 hover:bg-gray-100 flex-shrink-0"
        >
          <Download size={12} className="xs:w-[14px] xs:h-[14px] sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Export</span>
        </button>
      </div>

      {opportunity.status !== 'active' && (
        <div className="flex items-center gap-1.5 xs:gap-2 bg-amber-50 px-2 xs:px-3 sm:px-6 py-1.5 xs:py-2 text-[10px] xs:text-xs sm:text-sm text-amber-700">
          <Lock size={10} className="xs:w-3 xs:h-3 sm:w-[14px] sm:h-[14px]" />
          <span className="truncate">This opportunity is closed. Messages are read-only.</span>
        </div>
      )}
    </div>
  );
}
