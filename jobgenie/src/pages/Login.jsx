import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { apiLogin } from '../services/auth';
import { useProfile } from '../context/ProfileContext';

export default function Login() {
  const navigate = useNavigate();
  const { reloadProfile } = useProfile();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Please fill in all fields.');
    setLoading(true); setError('');
    try {
      const user = await apiLogin(form);
      localStorage.setItem('user', JSON.stringify(user));
      reloadProfile();
      navigate('/analyze', { replace: true });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--rose-bg)' }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8"><Logo size={60} /></div>
        <div className="rose-card">
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--rose-dark)' }}>Welcome back</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--rose-secondary)' }}>Sign in to your JobGenie account</p>
          {error && <div className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 p-3 rounded-xl">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium block mb-1" style={{ color: 'var(--rose-dark)' }}>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={(e) => set('email', e.target.value)} className="rose-input" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1" style={{ color: 'var(--rose-dark)' }}>Password</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={(e) => set('password', e.target.value)} className="rose-input" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-1">
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
          <p className="text-center text-sm mt-6" style={{ color: 'var(--rose-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold hover:underline" style={{ color: 'var(--rose-purple)' }}>Sign Up</Link>
          </p>
        </div>
        <p className="text-center text-xs mt-6">
          <Link to="/" className="hover:underline" style={{ color: 'var(--rose-secondary)' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
