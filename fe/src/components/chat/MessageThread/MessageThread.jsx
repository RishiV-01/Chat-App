import { useEffect } from 'react';
import useChatStore from '../../../store/chatStore';
import useAuthStore from '../../../store/authStore';
import { emitEvent } from '../../../socket/socketManager';
import MessageHeader from './MessageHeader';
import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';
import MessageInput from '../MessageInput/MessageInput';

export default function MessageThread({ showActionButtons, variant = 'full' }) {
  const { activeOpportunityId, messages } = useChatStore();
  const { user } = useAuthStore();
  const opportunity = useChatStore((s) => s.opportunities.find((o) => o._id === s.activeOpportunityId));
  const currentMessages = messages[activeOpportunityId] || [];

  // Define variant-specific styles
  const variantStyles = {
    full: {
      container: 'flex flex-1 rounded-xl bg-gradient-to-l from-[#162850] to-[#1e6daf] p-[2px]',
      inner: 'flex flex-1 flex-col rounded-xl bg-white min-h-0',
    },
    modal: {
      container: 'flex flex-1 rounded-xl',
      inner: 'flex flex-1 flex-col rounded-xl bg-white min-h-0',
    },
  };

  const styles = variantStyles[variant] || variantStyles.full;

  useEffect(() => {
    if (activeOpportunityId) {
      emitEvent('join_opportunity', { opportunityId: activeOpportunityId });

      return () => {
        emitEvent('leave_opportunity', { opportunityId: activeOpportunityId });
      };
    }
  }, [activeOpportunityId]);

  // Mark as read when viewing messages
  useEffect(() => {
    if (!activeOpportunityId || currentMessages.length === 0) return;

    // Find the last message from someone else (not current user)
    const lastOtherMsg = [...currentMessages]
      .reverse()
      .find((m) => {
        const sid = m.senderId?._id || m.senderId;
        return sid !== user?._id;
      });

    if (lastOtherMsg) {
      emitEvent('mark_read', {
        opportunityId: activeOpportunityId,
        messageId: lastOtherMsg._id,
      });
      useChatStore.getState().decrementUnread(activeOpportunityId);
    }
  }, [activeOpportunityId, currentMessages.length]);

  if (!activeOpportunityId) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-gray-300 text-gray-400">
        Select a conversation to start messaging
      </div>
    );
  }
return (
  <div className={styles.container}>
    <div className={styles.inner}>
      
      {variant !== 'modal' && <MessageHeader opportunity={opportunity} />}

      {/* Scroll Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <MessageList
          messages={currentMessages}
          currentUserId={user?._id}
          variant={variant}
        />
      </div>

      <TypingIndicator
        opportunityId={activeOpportunityId}
        currentUserId={user?._id}
      />

      <MessageInput
        opportunityId={activeOpportunityId}
        isReadOnly={opportunity?.status !== 'active'}
        showActionButtons={showActionButtons}
      />

    </div>
  </div>
);
}
