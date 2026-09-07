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
  '/setup':            'Profile Setup',
};

export default function Navbar({ onToggle }) {
  const { pathname } = useLocation();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const title = TITLES[pathname] || 'JobGenie';

  return (
    <header className="er-navbar sticky top-0 z-10 px-4 md:px-6"
      style={{ height: '58px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

      {/* Hamburger */}
      <button onClick={onToggle} aria-label="Menu"
        style={{
          display: 'flex', flexDirection: 'column', gap: '5px',
          padding: '8px', borderRadius: '10px', border: 'none',
          background: 'transparent', cursor: 'pointer', transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--er-purple-tint)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        {[0,1,2].map(i => (
          <span key={i} style={{ display: 'block', width: '20px', height: '2px', borderRadius: '2px', background: 'var(--er-dark)', transition: 'background 0.15s' }} />
        ))}
      </button>

      {/* Logo */}
      <Logo size={26} showText={false} />

      {/* Divider */}
      <span style={{ width: '1px', height: '20px', background: 'var(--er-border)', flexShrink: 0 }} />

      {/* Page title */}
      <h1 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--er-dark)', margin: 0, letterSpacing: '-0.01em' }}>{title}</h1>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <NotificationBell />

        {/* Profile pill */}
        <button onClick={() => navigate('/profile')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '5px 10px 5px 5px', borderRadius: '999px',
            border: '1px solid var(--er-border)', background: 'transparent',
            cursor: 'pointer', transition: 'all 0.18s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--er-purple-tint)'; e.currentTarget.style.borderColor = 'rgba(142,69,133,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--er-border)'; }}>
          <Avatar avatar={profile.avatar} name={profile.name} size="sm" />
          <div className="hidden sm:flex" style={{ flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--er-purple)', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.username ? `@${profile.username}` : profile.name || 'Profile'}
            </span>
            {profile.name && profile.username && (
              <span style={{ fontSize: '0.68rem', color: 'var(--er-mauve)', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.name}</span>
            )}
          </div>
        </button>
      </div>
    </header>
  );
}
