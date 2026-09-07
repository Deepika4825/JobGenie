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
      {open && <div className="fixed inset-0 bg-black/30 z-20" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col
        transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'white', borderRight: '1px solid var(--rose-border)', boxShadow: '2px 0 12px rgba(142,69,133,0.08)' }}>

        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--rose-border)' }}>
          <Logo size={36} />
          <button onClick={onClose} className="text-xl transition-colors"
            style={{ color: 'var(--rose-secondary)' }}
            onMouseEnter={e => e.target.style.color = 'var(--rose-purple)'}
            onMouseLeave={e => e.target.style.color = 'var(--rose-secondary)'}>✕</button>
        </div>

        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--rose-border)' }}>
          <div className="flex items-center gap-3">
            <Avatar avatar={profile.avatar} name={profile.name} size="sm" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--rose-dark)' }}>{profile.name || 'User'}</p>
              <p className="text-xs truncate" style={{ color: 'var(--rose-secondary)' }}>
                {profile.username ? `@${profile.username}` : profile.email || ''}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={({ isActive }) => isActive
                ? { background: 'var(--rose-purple)', color: 'white' }
                : { color: 'var(--rose-dark)' }}
              onMouseEnter={e => { if (!e.currentTarget.style.background.includes('8E4585')) e.currentTarget.style.background = 'var(--rose-light)'; }}
              onMouseLeave={e => { if (!e.currentTarget.style.background.includes('8E4585')) e.currentTarget.style.background = ''; }}>
              <span>{icon}</span>{label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4" style={{ borderTop: '1px solid var(--rose-border)' }}>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-red-500 hover:bg-red-50">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
