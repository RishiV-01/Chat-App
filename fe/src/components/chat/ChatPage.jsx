import { useEffect } from 'react';
import useChatStore from '../../store/chatStore';
import ConversationList from './ConversationList/ConversationList';
import MessageThread from './MessageThread/MessageThread';
import NewMessageModal from './NewMessageModal/NewMessageModal';
import FilePreviewModal from '../common/FilePreviewModal';

export default function ChatPage() {
  const { fetchOpportunities, opportunities, activeOpportunityId, setActiveOpportunity } = useChatStore();

  useEffect(() => {
    fetchOpportunities();
  }, []);

  // Auto-select first opportunity
  useEffect(() => {
    if (opportunities.length > 0 && !activeOpportunityId) {
      setActiveOpportunity(opportunities[0]._id);
    }
  }, [opportunities, activeOpportunityId]);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Page title */}
      <div className="px-8 pt-4 pb-3">
        <h1 className="text-4xl font-light text-navy-600">Messages</h1>
      </div>

      {/* Content - two card panels side by side */}
      <div className="flex flex-1 gap-4 overflow-hidden px-8 pb-4">
        <ConversationList />
        <MessageThread />
      </div>

      {/* Modals */}
      <NewMessageModal />
      <FilePreviewModal />
    </div>
  );
}
