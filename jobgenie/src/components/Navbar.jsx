import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import NotificationBell from './NotificationBell';
import Avatar from './Avatar';
import Logo from './Logo';

const TITLES = {
  '/analyze': 'Resume Analysis',
  '/jobs':    'Job Recommendations',
  '/profile': 'My Profile',
};

export default function Navbar({ onToggle }) {
  const { pathname } = useLocation();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const title = TITLES[pathname] || 'JobGenie';

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm px-4 md:px-6 py-3 flex items-center gap-4">
      <button onClick={onToggle}
        className="flex flex-col gap-1.5 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Toggle sidebar">
        <span className="block w-5 h-0.5 bg-gray-600 rounded" />
        <span className="block w-5 h-0.5 bg-gray-600 rounded" />
        <span className="block w-5 h-0.5 bg-gray-600 rounded" />
      </button>

      <Logo size={28} showText={false} />
      <h1 className="text-base font-semibold text-gray-800">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />
        <button onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-all">
          <Avatar avatar={profile.avatar} name={profile.name} size="sm" />
          <div className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-xs font-bold text-indigo-600 truncate max-w-[100px]">
              {profile.username ? `@${profile.username}` : profile.name || 'Profile'}
            </span>
            {profile.name && profile.username && (
              <span className="text-xs text-gray-400 truncate max-w-[100px]">{profile.name}</span>
            )}
          </div>
        </button>
      </div>
    </header>
  );
}
