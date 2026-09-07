import { useResume } from '../context/ResumeContext';
import { useProfile } from '../context/ProfileContext';
import { useNavigate } from 'react-router-dom';
import UploadSection from '../components/UploadSection';
import ScoreCard from '../components/ScoreCard';

export default function Analyze() {
  const { data, loading, analyzed, analyze, error } = useResume();
  const { profile } = useProfile();
  const nav = useNavigate();

  const profileIncomplete = !profile.phone || !profile.college || !profile.jobTitle || profile.interests.length === 0;

  return (
    <div style={{ maxWidth:'900px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'1.5rem' }}>

      {profileIncomplete && (
        <div style={{ background:'rgba(142,69,133,0.06)', border:'1px solid rgba(142,69,133,0.2)', borderRadius:'16px', padding:'1rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <div className="er-icon-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--rose-accent)', margin:0 }}>Complete your profile for better job matches</p>
              <p style={{ fontSize:'0.75rem', color:'var(--rose-secondary)', margin:0, marginTop:'2px' }}>Add your education, interests, and experience to get personalized recommendations.</p>
            </div>
          </div>
          <button onClick={() => nav('/profile')} className="btn-primary" style={{ fontSize:'0.8rem', padding:'0.5rem 1.25rem', flexShrink:0 }}>
            Set Up Profile →
          </button>
        </div>
      )}

      <UploadSection onAnalyze={analyze} loading={loading} />

      {error && (
        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'12px', padding:'1rem', color:'#dc2626', fontSize:'0.875rem' }}>⚠️ {error}</div>
      )}

      {analyzed && (
        <>
          <ScoreCard score={data.resume_score} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
            {/* Extracted Skills */}
            <div className="rose-card">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <div className="er-icon-box">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                  </div>
                  <h2 style={{ fontSize:'0.9375rem', fontWeight:700, color:'var(--rose-dark)' }}>Extracted Skills</h2>
                </div>
                <span style={{ fontSize:'0.72rem', padding:'0.2rem 0.625rem', borderRadius:'999px', background:'rgba(142,69,133,0.08)', color:'var(--rose-accent)', fontWeight:600 }}>{data.skills.length} found</span>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
                {data.skills.map((s,i) => (
                  <span key={i} className="rose-tag">✓ {s}</span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="rose-card">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <div className="er-icon-box">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </div>
                  <h2 style={{ fontSize:'0.9375rem', fontWeight:700, color:'var(--rose-dark)' }}>Missing Skills</h2>
                </div>
                <span style={{ fontSize:'0.72rem', padding:'0.2rem 0.625rem', borderRadius:'999px', background:'#fef2f2', color:'#dc2626', fontWeight:600, border:'1px solid #fecaca' }}>{data.skill_gaps.length} gaps</span>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginBottom:'1rem' }}>
                {data.skill_gaps.map((s,i) => (
                  <span key={i} style={{ fontSize:'0.8rem', padding:'0.25rem 0.75rem', borderRadius:'999px', background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', fontWeight:500 }}>✗ {s}</span>
                ))}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
                {data.skill_gaps.map((s,i) => (
                  <div key={i}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', color:'var(--rose-secondary)', marginBottom:'4px' }}>
                      <span>{s}</span><span>Beginner</span>
                    </div>
                    <div style={{ height:'4px', borderRadius:'99px', background:'var(--rose-border)', overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:'99px', width:`${15+i*10}%`, background:'var(--rose-primary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resume Insights */}
          <div className="rose-card">
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem' }}>
              <div className="er-icon-box">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h2 style={{ fontSize:'0.9375rem', fontWeight:700, color:'var(--rose-dark)' }}>Resume Insights</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem' }}>
              {data.suggestions.map((tip,i) => (
                <div key={i} style={{ display:'flex', gap:'0.625rem', background:'var(--rose-warm)', border:'1px solid var(--rose-border)', borderRadius:'12px', padding:'1rem' }}>
                  <span style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--rose-secondary)', flexShrink:0, marginTop:'1px' }}>{i+1}.</span>
                  <p style={{ fontSize:'0.8125rem', color:'var(--rose-dark)', lineHeight:1.55 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!analyzed && (
        <div style={{ background:'linear-gradient(145deg, var(--rose-surface) 0%, #FFF3F3 100%)', borderRadius:'20px', border:'1px solid var(--rose-border)', padding:'4rem 2rem', textAlign:'center' }}>
          <div style={{ width:'64px', height:'64px', borderRadius:'18px', background:'rgba(142,69,133,0.08)', border:'1px solid rgba(142,69,133,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h3 style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--rose-dark)', marginBottom:'0.5rem' }}>Upload your resume to get started</h3>
          <p style={{ fontSize:'0.875rem', color:'var(--rose-secondary)', lineHeight:1.6 }}>ATS score, extracted skills, skill gaps, and feedback — all in one place.</p>
        </div>
      )}
    </div>
  );
}
