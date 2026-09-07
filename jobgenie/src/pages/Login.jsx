import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { apiLogin } from '../services/auth';
import { useProfile } from '../context/ProfileContext';

export default function Login() {
  const nav = useNavigate();
  const { reloadProfile } = useProfile();
  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Please fill in all fields.');
    setLoading(true); setError('');
    try {
      const user = await apiLogin(form);
      localStorage.setItem('user', JSON.stringify(user));
      reloadProfile();
      nav('/analyze', { replace:true });
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', background:'var(--rose-background)' }}>
      <div style={{ width:'100%', maxWidth:'420px' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:'2rem' }}><Logo size={56} /></div>
        <div className="rose-card" style={{ padding:'2rem' }}>
          <h2 style={{ fontSize:'1.4rem', fontWeight:700, color:'var(--rose-dark)', marginBottom:'0.375rem' }}>Welcome back</h2>
          <p style={{ fontSize:'0.875rem', color:'var(--rose-secondary)', marginBottom:'1.5rem' }}>Sign in to your JobGenie account</p>
          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'10px', padding:'0.75rem 1rem', color:'#dc2626', fontSize:'0.8125rem', marginBottom:'1rem' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div>
              <label className="rose-label">Email</label>
              <input type="email" className="rose-input" placeholder="you@example.com" value={form.email} onChange={e=>set('email',e.target.value)} />
            </div>
            <div>
              <label className="rose-label">Password</label>
              <input type="password" className="rose-input" placeholder="••••••••" value={form.password} onChange={e=>set('password',e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop:'0.5rem', padding:'0.875rem' }}>
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>
          <p style={{ textAlign:'center', fontSize:'0.8125rem', color:'var(--rose-secondary)', marginTop:'1.5rem' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color:'var(--rose-accent)', fontWeight:600, textDecoration:'none' }}>Sign Up</Link>
          </p>
        </div>
        <p style={{ textAlign:'center', fontSize:'0.75rem', color:'var(--rose-secondary)', marginTop:'1.25rem' }}>
          <Link to="/" style={{ color:'var(--rose-secondary)', textDecoration:'none' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
