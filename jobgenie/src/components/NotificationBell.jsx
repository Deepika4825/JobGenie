import { useState } from 'react';
import { useProfile } from '../context/ProfileContext';

export default function NotificationBell() {
  const { notifications, markAllRead, unreadCount } = useProfile();
  const [open, setOpen] = useState(false);

  const toggle = () => { setOpen((v) => !v); if (!open) markAllRead(); };

  return (
    <div className="relative">
      <button onClick={toggle}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
        onMouseEnter={e => e.currentTarget.style.background = 'var(--rose-warm)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            style={{ background: 'var(--rose-purple)' }}>
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 w-80 rounded-2xl shadow-xl z-40 overflow-hidden"
            style={{ background: 'white', border: '1px solid var(--rose-border)' }}>
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--rose-border)' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--rose-dark)' }}>Notifications</h3>
              <span className="text-xs" style={{ color: 'var(--rose-secondary)' }}>{notifications.length} total</span>
            </div>
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-3xl mb-2">🔕</p>
                <p className="text-sm" style={{ color: 'var(--rose-secondary)' }}>No notifications yet</p>
              </div>
            ) : (
              <ul className="max-h-72 overflow-y-auto divide-y" style={{ borderColor: 'var(--rose-border)' }}>
                {notifications.map((n) => (
                  <li key={n.id} className="px-4 py-3 transition-colors"
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--rose-warm)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="flex gap-3 items-start">
                      <span className="text-lg mt-0.5">💼</span>
                      <div>
                        <p className="text-sm leading-snug" style={{ color: 'var(--rose-dark)' }}>{n.msg}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--rose-secondary)' }}>{n.time}</p>
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
