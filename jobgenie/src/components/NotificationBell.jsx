import { useState } from 'react';
import { useProfile } from '../context/ProfileContext';

export default function NotificationBell() {
  const { notifications, markAllRead, unreadCount } = useProfile();
  const [open, setOpen] = useState(false);

  const toggle = () => { setOpen(v => !v); if (!open) markAllRead(); };

  return (
    <div style={{ position:'relative' }}>
      <button onClick={toggle}
        style={{ position:'relative', width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'10px', border:'none', background:'transparent', cursor:'pointer', transition:'background 0.15s', fontSize:'1.1rem' }}
        onMouseEnter={e => e.currentTarget.style.background='rgba(142,69,133,0.08)'}
        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--rose-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span style={{ position:'absolute', top:'6px', right:'6px', width:'8px', height:'8px', borderRadius:'50%', background:'var(--rose-accent)', border:'1.5px solid white' }} />
        )}
      </button>

      {open && (
        <>
          <div style={{ position:'fixed', inset:0, zIndex:30 }} onClick={() => setOpen(false)} />
          <div style={{ position:'absolute', right:0, top:'44px', width:'300px', background:'var(--rose-surface)', border:'1px solid var(--rose-border)', borderRadius:'16px', boxShadow:'0 8px 32px rgba(142,69,133,0.12)', zIndex:40, overflow:'hidden' }}>
            <div style={{ padding:'0.875rem 1rem', borderBottom:'1px solid var(--rose-border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--rose-dark)' }}>Notifications</span>
              <span style={{ fontSize:'0.72rem', color:'var(--rose-secondary)' }}>{notifications.length} total</span>
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding:'2.5rem 1rem', textAlign:'center' }}>
                <div style={{ fontSize:'1.75rem', marginBottom:'0.5rem' }}>🔕</div>
                <p style={{ fontSize:'0.8125rem', color:'var(--rose-secondary)' }}>No notifications yet</p>
              </div>
            ) : (
              <ul style={{ maxHeight:'260px', overflowY:'auto', listStyle:'none' }}>
                {notifications.map(n => (
                  <li key={n.id} style={{ padding:'0.75rem 1rem', borderBottom:'1px solid var(--rose-border)', transition:'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--rose-warm)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <div style={{ display:'flex', gap:'0.625rem', alignItems:'flex-start' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:'2px' }}>
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                      <div>
                        <p style={{ fontSize:'0.8125rem', color:'var(--rose-dark)', lineHeight:1.45 }}>{n.msg}</p>
                        <p style={{ fontSize:'0.7rem', color:'var(--rose-secondary)', marginTop:'2px' }}>{n.time}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
