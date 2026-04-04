import { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext(null);

const DEFAULT = {
  name: '', username: '', email: '', phone: '', location: '',
  degree: '', college: '', graduationYear: '',
  jobTitle: '', experience: '',
  interests: [],
  resumeName: '',
  bio: '',
  avatar: '',  // base64 image
};

export function ProfileProvider({ children }) {
  const loadFromStorage = () => {
    try {
      const user   = JSON.parse(localStorage.getItem('user') || '{}');
      const stored = localStorage.getItem('jg_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT,
          ...parsed,
          name:     parsed.name     || user.name     || '',
          username: parsed.username || user.username || '',
          email:    parsed.email    || user.email    || '',
        };
      }
      const seeded = {
        ...DEFAULT,
        name:     user.name     || '',
        username: user.username || '',
        email:    user.email    || '',
      };
      localStorage.setItem('jg_profile', JSON.stringify(seeded));
      return seeded;
    } catch {
      return DEFAULT;
    }
  };

  const [profile, setProfile] = useState(loadFromStorage);

  // Call this after login/signup to sync profile from localStorage immediately
  const reloadProfile = () => setProfile(loadFromStorage());

  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jg_notifs') || '[]'); } catch { return []; }
  });

  const saveProfile = (updates) => {
    const next = { ...profile, ...updates };
    setProfile(next);
    localStorage.setItem('jg_profile', JSON.stringify(next));
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...user, name: next.name, username: next.username, email: next.email }));
    // Also save to SQLite via API if user has an id
    if (user.id) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      }).catch(console.error);
    }
  };

  const addNotification = (msg) => {
    const notif = { id: Date.now(), msg, time: new Date().toLocaleTimeString(), read: false };
    setNotifications((prev) => {
      const next = [notif, ...prev].slice(0, 10);
      localStorage.setItem('jg_notifs', JSON.stringify(next));
      return next;
    });
  };

  const markAllRead = () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem('jg_notifs', JSON.stringify(next));
      return next;
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <ProfileContext.Provider value={{ profile, saveProfile, reloadProfile, notifications, addNotification, markAllRead, unreadCount }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
