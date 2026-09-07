import { NavLink, useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import Avatar from './Avatar';
import Logo from './Logo';

const NAV = [
  { to: '/analyze',          icon: '📊', label: 'Resume Analysis' },
  { to: '/jobs',             icon: '💼', label: 'Job Recommendations' },
  { to: '/resume-generator', icon: '📄', label: 'Resume Generator' },
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const { profile } = useProfile();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('jg_profile');
    localStorage.removeItem('jg_notifs');
    navigate('/');
  };

  return (
    <>
      {open && (
        <div onClick={onClose} style={{
          position: 'fixed', inset: 0, background: 'rgba(74,74,74,0.25)',
          zIndex: 20, backdropFilter: 'blur(2px)',
        }} />
      )}
      <aside className="er-sidebar" style={{
        position: 'fixed', top: 0, left: 0, height: '100%', width: '260px',
        zIndex: 30, display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
      }}>

        {/* Logo row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem', borderBottom: '1px solid var(--er-border)',
        }}>
          <Logo size={34} />
          <button onClick={onClose} style={{
            width: '28px', height: '28px', borderRadius: '8px', border: 'none',
            background: 'transparent', cursor: 'pointer', fontSize: '1rem',
            color: 'var(--er-mauve)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--er-purple-tint)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>✕</button>
        </div>

        {/* User info */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--er-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Avatar avatar={profile.avatar} name={profile.name} size="sm" />
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--er-dark)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile.name || 'User'}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--er-mauve)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile.username ? `@${profile.username}` : profile.email || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.625rem 0.875rem', borderRadius: '0.875rem',
                fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
                transition: 'all 0.15s ease',
                background: isActive ? 'var(--er-purple)' : 'transparent',
                color: isActive ? 'white' : 'var(--er-dark)',
                boxShadow: isActive ? '0 2px 8px rgba(142,69,133,0.25)' : 'none',
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.style.background.includes('8E4585') && !e.currentTarget.style.background.includes('er-purple)')) {
                  e.currentTarget.style.background = 'var(--er-purple-tint)';
                  e.currentTarget.style.color = 'var(--er-purple)';
                }
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.getAttribute('aria-current')) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--er-dark)';
                }
              }}>
              <span style={{ fontSize: '1rem' }}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--er-border)' }}>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.625rem 0.875rem', borderRadius: '0.875rem',
            border: 'none', background: 'transparent', cursor: 'pointer',
            fontSize: '0.875rem', fontWeight: 500, color: '#ef4444',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
