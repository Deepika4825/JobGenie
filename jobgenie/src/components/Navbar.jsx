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
    <header className="er-navbar sticky top-0 z-10"
      style={{ height: '58px', display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '0.75rem' }}>

      {/* Hamburger */}
      <button onClick={onToggle} aria-label="Menu"
        style={{ display:'flex', flexDirection:'column', gap:'5px', padding:'8px', borderRadius:'10px', border:'none', background:'transparent', cursor:'pointer', transition:'background 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(142,69,133,0.08)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        {[0,1,2].map(i => (
          <span key={i} style={{ display:'block', width:'20px', height:'2px', borderRadius:'2px', background:'var(--rose-dark)' }} />
        ))}
      </button>

      <Logo size={26} showText={false} />

      <span style={{ width:'1px', height:'18px', background:'var(--rose-border)', flexShrink:0 }} />

      <h1 style={{ fontSize:'0.9rem', fontWeight:600, color:'var(--rose-dark)', letterSpacing:'-0.01em' }}>{title}</h1>

      <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'6px' }}>
        <NotificationBell />

        <button onClick={() => navigate('/profile')}
          style={{ display:'flex', alignItems:'center', gap:'8px', padding:'5px 12px 5px 5px', borderRadius:'999px', border:'1px solid var(--rose-border)', background:'transparent', cursor:'pointer', transition:'all 0.18s ease' }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(142,69,133,0.07)'; e.currentTarget.style.borderColor='rgba(142,69,133,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='var(--rose-border)'; }}>
          <Avatar avatar={profile.avatar} name={profile.name} size="sm" />
          <div className="hidden sm:block" style={{ textAlign:'left', lineHeight:1.2 }}>
            <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--rose-accent)', maxWidth:'90px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {profile.username ? `@${profile.username}` : profile.name || 'Profile'}
            </div>
            {profile.name && profile.username && (
              <div style={{ fontSize:'0.68rem', color:'var(--rose-secondary)', maxWidth:'90px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{profile.name}</div>
            )}
          </div>
        </button>
      </div>
    </header>
  );
}
