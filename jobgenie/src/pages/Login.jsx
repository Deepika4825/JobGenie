import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { apiLogin } from '../services/auth';
import { useProfile } from '../context/ProfileContext';

const inp = 'w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500';

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
    setLoading(true);
    setError('');
    try {
      const user = await apiLogin(form);
      localStorage.setItem('user', JSON.stringify(user));
      reloadProfile();
      navigate('/analyze', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8"><Logo size={60} /></div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in to your JobGenie account</p>
          {error && <div className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 p-3 rounded-xl">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={(e) => set('email', e.target.value)} className={inp} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={(e) => set('password', e.target.value)} className={inp} />
            </div>
            <button type="submit" disabled={loading}
              className="bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors mt-1">
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">Sign Up</Link>
          </p>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          <Link to="/" className="hover:text-gray-600">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
