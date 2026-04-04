const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function apiSignup({ name, username, email, password }) {
  const res = await fetch(`${API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  return data; // { id, name, username, email }
}

export async function apiLogin({ email, password }) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data; // { id, name, username, email }
}

export async function apiSaveProfile(userId, profile) {
  const res = await fetch(`${API}/profile/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save profile');
  return data;
}

export async function apiGetProfile(userId) {
  const res = await fetch(`${API}/profile/${userId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get profile');
  return data;
}
