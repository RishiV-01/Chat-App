import usePresenceStore from '../../store/presenceStore';

export default function OnlineIndicator({ userId, showLabel = false, userName = '' }) {
  const isOnline = usePresenceStore((s) => userId ? s.onlineUsers.has(userId) : false);

  if (showLabel) {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
        <span className="text-xs text-gray-500">
          {userName && `${userName} - `}{isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    );
  }

  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${
        isOnline ? 'bg-green-500' : 'bg-gray-400'
      }`}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
}
