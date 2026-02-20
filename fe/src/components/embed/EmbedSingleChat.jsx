import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import MessageThread from '../chat/MessageThread/MessageThread';
import FilePreviewModal from '../common/FilePreviewModal';

export default function EmbedSingleChat() {
  const { opportunityId } = useParams();
  const { fetchOpportunities, setActiveOpportunity } = useChatStore();

  useEffect(() => {
    const init = async () => {
      await fetchOpportunities();
      if (opportunityId) {
        setActiveOpportunity(opportunityId);
      }
    };
    init();
  }, [opportunityId]);

  return (
    <div className="flex h-screen w-screen flex-col bg-white">
      <div className="flex flex-1 overflow-hidden p-2">
        <MessageThread showActionButtons />
      </div>
      <FilePreviewModal />
    </div>
  );
}
