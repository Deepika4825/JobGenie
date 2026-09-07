import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { apiSignup } from '../services/auth';
import { useProfile } from '../context/ProfileContext';

export default function Signup() {
  const navigate = useNavigate();
  const { reloadProfile } = useProfile();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.email || !form.password) return setError('Please fill in all fields.');
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) return setError('Username: 3–20 chars, letters/numbers/underscores only.');
    if (!/\S+@\S+\.\S+/.test(form.email)) return setError('Enter a valid email address.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true); setError('');
    try {
      const user = await apiSignup(form);
      localStorage.setItem('user', JSON.stringify(user));
      reloadProfile();
      navigate('/analyze', { replace: true });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'var(--rose-bg)' }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8"><Logo size={60} /></div>
        <div className="rose-card">
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--rose-dark)' }}>Create account</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--rose-secondary)' }}>Join JobGenie and supercharge your job search</p>
          {error && <div className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 p-3 rounded-xl">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium block mb-1" style={{ color: 'var(--rose-dark)' }}>Full Name</label>
              <input type="text" placeholder="John Doe" value={form.name}
                onChange={(e) => set('name', e.target.value)} className="rose-input" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1" style={{ color: 'var(--rose-dark)' }}>Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--rose-secondary)' }}>@</span>
                <input type="text" placeholder="john_doe" value={form.username}
                  onChange={(e) => set('username', e.target.value.toLowerCase().replace(/\s/g, '_'))}
                  className="rose-input" style={{ paddingLeft: '2rem' }} />
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--rose-secondary)' }}>Letters, numbers, underscores — 3 to 20 chars</p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1" style={{ color: 'var(--rose-dark)' }}>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={(e) => set('email', e.target.value)} className="rose-input" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1" style={{ color: 'var(--rose-dark)' }}>Password</label>
              <input type="password" placeholder="Min. 6 characters" value={form.password}
                onChange={(e) => set('password', e.target.value)} className="rose-input" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-1">
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
          <p className="text-center text-sm mt-6" style={{ color: 'var(--rose-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--rose-purple)' }}>Login</Link>
          </p>
        </div>
        <p className="text-center text-xs mt-6">
          <Link to="/" className="hover:underline" style={{ color: 'var(--rose-secondary)' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
