import { useEffect } from 'react';
import useChatStore from '../../store/chatStore';
import ConversationList from '../chat/ConversationList/ConversationList';
import MessageThread from '../chat/MessageThread/MessageThread';
import NewMessageModal from '../chat/NewMessageModal/NewMessageModal';
import FilePreviewModal from '../common/FilePreviewModal';

export default function EmbedChatPage() {
  const { fetchOpportunities, opportunities, activeOpportunityId, setActiveOpportunity } = useChatStore();

  useEffect(() => {
    fetchOpportunities();
  }, []);

  useEffect(() => {
    if (opportunities.length > 0 && !activeOpportunityId) {
      setActiveOpportunity(opportunities[0]._id);
    }
  }, [opportunities, activeOpportunityId]);

  return (
    <div className="flex h-screen w-screen flex-col bg-white">
      <div className="px-8 pt-4 pb-3">
        <h1 className="text-4xl font-light text-navy-600">Messages</h1>
      </div>
      <div className="flex flex-1 gap-4 overflow-hidden px-8 pb-4">
        <ConversationList />
        <MessageThread />
      </div>
      <NewMessageModal />
      <FilePreviewModal />
    </div>
  );
}
