import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { apiSignup } from '../services/auth';
import { useProfile } from '../context/ProfileContext';

export default function Signup() {
  const nav = useNavigate();
  const { reloadProfile } = useProfile();
  const [form, setForm] = useState({ name:'', username:'', email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name||!form.username||!form.email||!form.password) return setError('Please fill in all fields.');
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) return setError('Username: 3–20 chars, letters/numbers/underscores.');
    if (!/\S+@\S+\.\S+/.test(form.email)) return setError('Enter a valid email address.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true); setError('');
    try {
      const user = await apiSignup(form);
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
          <h2 style={{ fontSize:'1.4rem', fontWeight:700, color:'var(--rose-dark)', marginBottom:'0.375rem' }}>Create account</h2>
          <p style={{ fontSize:'0.875rem', color:'var(--rose-secondary)', marginBottom:'1.5rem' }}>Join JobGenie and supercharge your job search</p>
          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'10px', padding:'0.75rem 1rem', color:'#dc2626', fontSize:'0.8125rem', marginBottom:'1rem' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div>
              <label className="rose-label">Full Name</label>
              <input type="text" className="rose-input" placeholder="Jane Doe" value={form.name} onChange={e=>set('name',e.target.value)} />
            </div>
            <div>
              <label className="rose-label">Username</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', fontSize:'0.875rem', fontWeight:500, color:'var(--rose-secondary)', pointerEvents:'none' }}>@</span>
                <input type="text" className="rose-input" style={{ paddingLeft:'2rem' }} placeholder="jane_doe" value={form.username} onChange={e=>set('username',e.target.value.toLowerCase().replace(/\s/g,'_'))} />
              </div>
              <p style={{ fontSize:'0.7rem', color:'var(--rose-secondary)', marginTop:'4px', opacity:0.75 }}>Letters, numbers, underscores — 3 to 20 chars</p>
            </div>
            <div>
              <label className="rose-label">Email</label>
              <input type="email" className="rose-input" placeholder="you@example.com" value={form.email} onChange={e=>set('email',e.target.value)} />
            </div>
            <div>
              <label className="rose-label">Password</label>
              <input type="password" className="rose-input" placeholder="Min. 6 characters" value={form.password} onChange={e=>set('password',e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop:'0.5rem', padding:'0.875rem' }}>
              {loading ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>
          <p style={{ textAlign:'center', fontSize:'0.8125rem', color:'var(--rose-secondary)', marginTop:'1.5rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--rose-accent)', fontWeight:600, textDecoration:'none' }}>Login</Link>
          </p>
        </div>
        <p style={{ textAlign:'center', fontSize:'0.75rem', color:'var(--rose-secondary)', marginTop:'1.25rem' }}>
          <Link to="/" style={{ color:'var(--rose-secondary)', textDecoration:'none' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
