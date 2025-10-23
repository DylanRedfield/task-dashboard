import { User } from '@/lib/api';
import { FiHome, FiFileText, FiUsers } from 'react-icons/fi';

interface SidebarProps {
  selectedView: 'board' | 'transcripts';
  onViewChange: (view: 'board' | 'transcripts') => void;
  users: User[];
}

export default function Sidebar({ selectedView, onViewChange, users }: SidebarProps) {
  const menuItems = [
    { id: 'board' as const, label: 'Task Board', icon: FiHome },
    { id: 'transcripts' as const, label: 'Transcripts', icon: FiFileText },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen sticky top-0">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary-600">TaskDash</h2>
        <p className="text-sm text-gray-500">Team Collaboration</p>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                selectedView === item.id
                  ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="mr-3" size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-8 px-6">
        <div className="flex items-center text-gray-600 mb-3">
          <FiUsers className="mr-2" size={18} />
          <h3 className="font-semibold text-sm uppercase">Team</h3>
        </div>
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-2 text-sm"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-700">{user.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
