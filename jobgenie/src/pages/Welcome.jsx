import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Welcome() {
  const nav = useNavigate();
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem',
      background:'radial-gradient(ellipse 60% 50% at 20% 30%, rgba(220,161,161,0.2) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 80% 70%, rgba(142,69,133,0.1) 0%, transparent 60%), var(--rose-background)' }}>
      <div style={{ textAlign:'center', maxWidth:'520px', width:'100%' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:'2rem' }}><Logo size={88} /></div>
        <h1 style={{ fontSize:'2rem', fontWeight:800, color:'var(--rose-dark)', marginBottom:'0.75rem', letterSpacing:'-0.02em', lineHeight:1.2 }}>
          Your career,<br /><span style={{ color:'var(--rose-accent)' }}>reimagined.</span>
        </h1>
        <p style={{ fontSize:'1rem', color:'var(--rose-secondary)', marginBottom:'0.625rem', lineHeight:1.6 }}>
          Analyze your resume, discover skill gaps, and find jobs matched to your profile.
        </p>
        <p style={{ fontSize:'0.875rem', color:'var(--rose-secondary)', opacity:0.75, marginBottom:'2.5rem', lineHeight:1.6 }}>
          Instant ATS scores · Smart job matching · Personalized suggestions
        </p>
        <button onClick={() => nav('/login')} className="btn-primary" style={{ fontSize:'1rem', padding:'0.875rem 3rem' }}>
          Get Started
        </button>
      </div>
    </div>
  );
}
