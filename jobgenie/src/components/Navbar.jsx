import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import NotificationBell from './NotificationBell';
import Avatar from './Avatar';
import Logo from './Logo';

const TITLES = {
  '/analyze':          'Resume Analysis',
  '/jobs':             'Job Recommendations',
  '/resume-generator': 'Resume Generator',
  '/profile':          'My Profile',
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
        <span className="block w-5 h-0.5 rounded" style={{ background: '#4A4A4A' }} />
        <span className="block w-5 h-0.5 rounded" style={{ background: '#4A4A4A' }} />
        <span className="block w-5 h-0.5 rounded" style={{ background: '#4A4A4A' }} />
      </button>

      <Logo size={28} showText={false} />
      <h1 className="text-base font-semibold" style={{ color: '#4A4A4A' }}>{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />
        <button onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl border border-transparent transition-all"
          style={{}}
          onMouseEnter={e => { e.currentTarget.style.background = '#f5eef5'; e.currentTarget.style.borderColor = '#DCA1A1'; }}
          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = 'transparent'; }}>
          <Avatar avatar={profile.avatar} name={profile.name} size="sm" />
          <div className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-xs font-bold truncate max-w-[100px]" style={{ color: '#8E4585' }}>
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
