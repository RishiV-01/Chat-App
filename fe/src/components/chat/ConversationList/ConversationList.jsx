import { MessageCircle } from 'lucide-react';
import useChatStore from '../../../store/chatStore';
import useUiStore from '../../../store/uiStore';
import ConversationItem from './ConversationItem';
import LoadingSpinner from '../../common/LoadingSpinner';

export default function ConversationList() {
  const { opportunities, activeOpportunityId, setActiveOpportunity, loading } = useChatStore();
  const { openNewMessageModal } = useUiStore();

  return (
    <div className="p-[2px] rounded-xl bg-gradient-to-r from-pink-500 to-blue-500">
      <div className='flex w-[400px] h-[-webkit-fill-available] flex-shrink-0 flex-col bg-white rounded-xl'>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            Conversations ({opportunities.length})
          </h2>
          <button
            onClick={openNewMessageModal}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#164060]"
          >
            <MessageCircle size={14} />
            New Message
          </button>
        </div>


        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <LoadingSpinner />
          ) : opportunities.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">No conversations yet</div>
          ) : (
            opportunities.map((opp) => (
              <ConversationItem
                key={opp._id}
                opportunity={opp}
                isActive={opp._id === activeOpportunityId}
                onClick={() => setActiveOpportunity(opp._id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
