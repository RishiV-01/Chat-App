import usePresenceStore from '../../store/presenceStore';

export default function Avatar({ user, size = 'md', showPresence = false }) {
  const isOnline = usePresenceStore((s) => user?._id ? s.onlineUsers.has(user._id) : false);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const dotSizes = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="relative inline-flex flex-shrink-0">
      <div className={`flex items-center justify-center rounded-full bg-gray-300 font-semibold text-gray-700 ${sizeClasses[size]}`}>
        {user?.profilePicture ? (
          <img src={user.profilePicture} alt={user.name} className="h-full w-full rounded-full object-cover" />
        ) : (
          initials
        )}
      </div>
      {showPresence && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-white ${dotSizes[size]} ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      )}
    </div>
  );
}
