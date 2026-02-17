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
      <div className="flex items-center justify-between px-6 py-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-navy-800">
            [{opportunity.name}] Conversation
          </h3>
          {otherUser && (
            <div className="mt-1">
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
          className="flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
        >
          <Download size={16} />
          Export
        </button>
      </div>

      {opportunity.status !== 'active' && (
        <div className="flex items-center gap-2 bg-amber-50 px-6 py-2 text-sm text-amber-700">
          <Lock size={14} />
          This opportunity is closed. Messages are read-only.
        </div>
      )}
    </div>
  );
}
