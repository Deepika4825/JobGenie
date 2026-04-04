import { useState } from 'react';
import { useProfile } from '../context/ProfileContext';

export default function NotificationBell() {
  const { notifications, markAllRead, unreadCount } = useProfile();
  const [open, setOpen] = useState(false);

  const toggle = () => { setOpen((v) => !v); if (!open) markAllRead(); };

  return (
    <div className="relative">
      <button onClick={toggle}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-40 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
              <span className="text-xs text-gray-400">{notifications.length} total</span>
            </div>
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-3xl mb-2">🔕</p>
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifications.map((n) => (
                  <li key={n.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-3 items-start">
                      <span className="text-lg mt-0.5">💼</span>
                      <div>
                        <p className="text-sm text-gray-700 leading-snug">{n.msg}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
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
