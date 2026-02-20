import {
  LayoutDashboard,
  Users,
  Mail,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';
import { disconnectSocket } from '../../socket/socketManager';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', view: null },
  { icon: Users, label: 'Opportunities', view: 'opportunities' },
  { icon: Mail, label: 'Messages', view: 'messages' },
  { icon: Settings, label: 'Settings', view: null },
  { icon: Users, label: 'Users', view: null },
  { icon: HelpCircle, label: 'Help', view: null },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { activeView, setActiveView } = useUiStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/login');
  };

  const handleNavClick = (view) => {
    if (view) {
      setActiveView(view);
    }
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="flex w-14 flex-col items-center border-r bg-white py-3">
      {/* User initials */}
      <div className="mb-4 text-xs font-bold text-navy-800">{initials}</div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col items-center gap-1">
        {navItems.map(({ icon: Icon, label, view }) => {
          const isActive = view && activeView === view;
          return (
            <button
              key={label}
              title={label}
              onClick={() => handleNavClick(view)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                isActive
                  ? 'bg-navy-800 text-white'
                  : view
                    ? 'text-navy-600 hover:bg-gray-100 hover:text-navy-800 cursor-pointer'
                    : 'text-gray-300 cursor-default'
              }`}
            >
              <Icon size={18} />
            </button>
          );
        })}
      </nav>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        title="Logout"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-600 transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}
