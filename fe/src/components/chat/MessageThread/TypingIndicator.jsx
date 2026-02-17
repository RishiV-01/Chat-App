import usePresenceStore from '../../../store/presenceStore';
import useChatStore from '../../../store/chatStore';

export default function TypingIndicator({ opportunityId, currentUserId }) {
  const typingUsers = usePresenceStore((s) =>
    Array.from(s.typingUsers[opportunityId] || []),
  );

  const opportunity = useChatStore((s) =>
    s.opportunities.find((o) => o._id === opportunityId),
  );

  // Filter out current user and get names
  const typingNames = typingUsers
    .filter((id) => id !== currentUserId)
    .map((id) => {
      const participant = opportunity?.participants?.find(
        (p) => (p.userId?._id || p.userId) === id,
      );
      return participant?.userId?.name?.split(' ')[0] || 'Someone';
    });

  if (typingNames.length === 0) return null;

  const text =
    typingNames.length === 1
      ? `${typingNames[0]} is typing`
      : `${typingNames.join(' and ')} are typing`;

  return (
    <div className="px-6 py-1">
      <span className="text-xs text-gray-400 italic">
        {text}
        <span className="ml-1 inline-flex gap-0.5">
          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
        </span>
      </span>
    </div>
  );
}
