import { NavLink, useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import Avatar from './Avatar';
import Logo from './Logo';

const NAV = [
  { to: '/analyze', icon: '📊', label: 'Resume Analysis' },
  { to: '/jobs',    icon: '💼', label: 'Job Recommendations' },
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
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-30 flex flex-col
        transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Logo size={36} />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* User */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Avatar avatar={profile.avatar} name={profile.name} size="sm" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-800 truncate">{profile.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">
                {profile.username ? `@${profile.username}` : profile.email || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`
              }>
              <span>{icon}</span>{label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-gray-100">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
