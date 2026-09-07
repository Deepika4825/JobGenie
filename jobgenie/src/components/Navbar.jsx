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
    <header style={{ background: 'white', borderBottom: '1px solid var(--rose-border)' }}
      className="sticky top-0 z-10 shadow-sm px-4 md:px-6 py-3 flex items-center gap-4">

      <button onClick={onToggle} aria-label="Toggle sidebar"
        className="flex flex-col gap-1.5 p-1.5 rounded-lg transition-colors"
        style={{ '--tw-bg-opacity': 1 }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--rose-warm)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <span className="block w-5 h-0.5 rounded" style={{ background: 'var(--rose-dark)' }} />
        <span className="block w-5 h-0.5 rounded" style={{ background: 'var(--rose-dark)' }} />
        <span className="block w-5 h-0.5 rounded" style={{ background: 'var(--rose-dark)' }} />
      </button>

      <Logo size={28} showText={false} />
      <h1 className="text-base font-semibold" style={{ color: 'var(--rose-dark)' }}>{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />
        <button onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl border transition-all"
          style={{ borderColor: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--rose-light)'; e.currentTarget.style.borderColor = 'var(--rose-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = 'transparent'; }}>
          <Avatar avatar={profile.avatar} name={profile.name} size="sm" />
          <div className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-xs font-bold truncate max-w-[100px]" style={{ color: 'var(--rose-purple)' }}>
              {profile.username ? `@${profile.username}` : profile.name || 'Profile'}
            </span>
            {profile.name && profile.username && (
              <span className="text-xs truncate max-w-[100px]" style={{ color: 'var(--rose-secondary)' }}>{profile.name}</span>
            )}
          </div>
        </button>
      </div>
    </header>
  );
}
