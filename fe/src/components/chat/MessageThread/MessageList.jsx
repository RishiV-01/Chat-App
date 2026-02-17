import { useEffect, useRef, useCallback } from 'react';
import useChatStore from '../../../store/chatStore';
import MessageBubble from './MessageBubble';
import LoadingSpinner from '../../common/LoadingSpinner';
import { isSameDay, formatDateDivider } from '../../../utils/formatDate';

export default function MessageList({ messages, currentUserId }) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const sentinelRef = useRef(null);
  const isAtBottom = useRef(true);
  const { activeOpportunityId, hasMore, messagesLoading, fetchMessagesForOpportunity } = useChatStore();

  // Auto-scroll to bottom on new messages (if already at bottom)
  useEffect(() => {
    if (isAtBottom.current && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Scroll to bottom when switching conversations
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView();
    }
    isAtBottom.current = true;
  }, [activeOpportunityId]);

  // Track scroll position
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    isAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
  }, []);

  // Infinite scroll up for older messages
  useEffect(() => {
    if (!sentinelRef.current || !hasMore[activeOpportunityId]) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !messagesLoading && messages.length > 0) {
          const oldestId = messages[0]?._id;
          if (oldestId) {
            fetchMessagesForOpportunity(activeOpportunityId, oldestId);
          }
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [activeOpportunityId, messagesLoading, hasMore, messages.length]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-6 py-4"
    >
      {/* Load more sentinel */}
      {hasMore[activeOpportunityId] && (
        <div ref={sentinelRef}>
          {messagesLoading && <LoadingSpinner size="sm" />}
        </div>
      )}

      {messages.length === 0 && !messagesLoading && (
        <div className="flex h-full items-center justify-center text-gray-400">
          No messages yet. Start the conversation!
        </div>
      )}

      {messages.map((msg, idx) => {
        const prevMsg = idx > 0 ? messages[idx - 1] : null;
        const showDivider = !prevMsg || !isSameDay(prevMsg.createdAt, msg.createdAt);
        const senderId = msg.senderId?._id || msg.senderId;
        const isOwn = senderId === currentUserId;

        return (
          <div key={msg._id}>
            {showDivider && (
              <div className="my-4 flex items-center gap-3">
                <div className="flex-1 border-t" />
                <span className="text-xs font-medium text-gray-400">
                  {formatDateDivider(msg.createdAt)}
                </span>
                <div className="flex-1 border-t" />
              </div>
            )}
            <MessageBubble message={msg} isOwn={isOwn} />
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
