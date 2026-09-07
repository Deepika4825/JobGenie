import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import Logo from '../components/Logo';
import Avatar from '../components/Avatar';

const INTEREST_OPTIONS = [
  'Data Science','Machine Learning','Web Development','Mobile Development',
  'Cloud Computing','DevOps','Cybersecurity','UI/UX Design',
  'Blockchain','AI Research','Full Stack','Product Management',
];
const STEPS = ['Basic Info', 'Education & Career', 'Interests'];

export default function ProfileSetup() {
  const { profile, saveProfile } = useProfile();
  const nav = useNavigate();
  const avatarRef = useRef();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: profile.name || '', username: profile.username || '',
    phone:'', location:'', bio:'',
    degree:'', college:'', graduationYear:'',
    jobTitle:'', experience:'', interests:[], avatar:'',
  });

  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  const toggleInterest = item => setForm(f => ({
    ...f,
    interests: f.interests.includes(item)
      ? f.interests.filter(i => i !== item)
      : [...f.interests, item],
  }));
  const handleAvatar = file => {
    if (!file?.type.startsWith('image/')) return alert('Please upload an image.');
    const reader = new FileReader();
    reader.onload = e => set('avatar', e.target.result);
    reader.readAsDataURL(file);
  };
  const nextStep = () => {
    if (step === 0 && !form.name.trim()) return alert('Full name is required.');
    if (step < STEPS.length - 1) setStep(s => s + 1);
  };
  const handleFinish = () => {
    if (!form.name.trim()) return alert('Full name is required.');
    saveProfile(form);
    nav('/analyze', { replace:true });
  };
  const handleSkip = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    saveProfile({ ...form, name: form.name.trim() || user.name || user.email || 'User' });
    nav('/analyze', { replace:true });
  };

  const pct = ((step + 1) / STEPS.length) * 100;

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', background:'var(--rose-background)' }}>
      <div style={{ width:'100%', maxWidth:'480px' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:'1.5rem' }}><Logo size={50} /></div>

        <div className="rose-card" style={{ padding:0, overflow:'hidden' }}>
          {/* Progress bar */}
          <div style={{ height:'4px', background:'var(--rose-border)' }}>
            <div style={{ height:'100%', width:`${pct}%`, background:'var(--rose-accent)', transition:'width 0.4s ease' }} />
          </div>

          <div style={{ padding:'2rem' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.75rem' }}>
              <div>
                <h2 style={{ fontSize:'1.25rem', fontWeight:700, color:'var(--rose-dark)', marginBottom:'4px' }}>Set Up Your Profile</h2>
                <p style={{ fontSize:'0.8125rem', color:'var(--rose-secondary)' }}>Step {step+1} of {STEPS.length} — {STEPS[step]}</p>
              </div>
              <button onClick={handleSkip} style={{ fontSize:'0.75rem', color:'var(--rose-secondary)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>
                Skip for now
              </button>
            </div>

            {/* Step 0 — Basic Info */}
            {step === 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem' }}>
                  <div style={{ position:'relative' }}>
                    <Avatar avatar={form.avatar} name={form.name} size="lg" />
                    <button type="button" onClick={() => avatarRef.current.click()}
                      style={{ position:'absolute', bottom:0, right:0, width:'28px', height:'28px', borderRadius:'50%', background:'var(--rose-accent)', color:'white', border:'2px solid white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'0.75rem' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                    </button>
                    <input ref={avatarRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleAvatar(e.target.files[0])} />
                  </div>
                  <p style={{ fontSize:'0.72rem', color:'var(--rose-secondary)' }}>Click to upload a photo</p>
                </div>
                {[['Full Name *','name','Jane Doe','text'],['Phone','phone','+91 98765 43210','text'],['Location','location','Bangalore, India','text']].map(([label,key,ph,type]) => (
                  <div key={key}>
                    <label className="rose-label">{label}</label>
                    <input type={type} value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={ph} className="rose-input" />
                  </div>
                ))}
                <div>
                  <label className="rose-label">Username</label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'var(--rose-secondary)', fontSize:'0.875rem' }}>@</span>
                    <input value={form.username} onChange={e=>set('username',e.target.value.toLowerCase().replace(/\s/g,'_'))} placeholder="jane_doe" className="rose-input" style={{ paddingLeft:'2rem' }} />
                  </div>
                </div>
                <div>
                  <label className="rose-label">Bio</label>
                  <textarea value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="A short intro about yourself..." rows={2} className="rose-input" style={{ resize:'none' }} />
                </div>
              </div>
            )}

            {/* Step 1 — Education & Career */}
            {step === 1 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <div>
                  <label className="rose-label">Degree</label>
                  <select value={form.degree} onChange={e=>set('degree',e.target.value)} className="rose-select">
                    <option value="">Select degree</option>
                    {["High School","Diploma","Bachelor's","Master's","PhD","Other"].map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="rose-label">College / University</label>
                  <input value={form.college} onChange={e=>set('college',e.target.value)} placeholder="e.g. IIT Madras, VIT..." className="rose-input" />
                </div>
                <div>
                  <label className="rose-label">Graduation Year</label>
                  <select value={form.graduationYear} onChange={e=>set('graduationYear',e.target.value)} className="rose-select">
                    <option value="">Select year</option>
                    {Array.from({length:10},(_,i)=>String(2020+i)).map(y=><option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="rose-label">Desired Job Title</label>
                  <input value={form.jobTitle} onChange={e=>set('jobTitle',e.target.value)} placeholder="e.g. Data Scientist, Frontend Developer" className="rose-input" />
                </div>
                <div>
                  <label className="rose-label">Experience Level</label>
                  <select value={form.experience} onChange={e=>set('experience',e.target.value)} className="rose-select">
                    <option value="">Select level</option>
                    {['Fresher','Intern','1-2 years','3-5 years','5+ years'].map(l=><option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Step 2 — Interests */}
            {step === 2 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <p style={{ fontSize:'0.8125rem', color:'var(--rose-secondary)' }}>Select your areas of interest — used for job matching</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
                  {INTEREST_OPTIONS.map(item => (
                    <button key={item} type="button" onClick={() => toggleInterest(item)}
                      style={{
                        fontSize:'0.8125rem', padding:'0.5rem 1rem', borderRadius:'999px',
                        fontWeight:500, cursor:'pointer', border:'1.5px solid', transition:'all 0.15s',
                        background: form.interests.includes(item) ? 'var(--rose-accent)' : 'transparent',
                        color:      form.interests.includes(item) ? 'white' : 'var(--rose-dark)',
                        borderColor:form.interests.includes(item) ? 'var(--rose-accent)' : 'var(--rose-border)',
                      }}>
                      {item}
                    </button>
                  ))}
                </div>
                {form.interests.length > 0 && (
                  <p style={{ fontSize:'0.72rem', color:'var(--rose-accent)', fontWeight:600 }}>{form.interests.length} selected</p>
                )}
              </div>
            )}

            {/* Nav buttons */}
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'2rem' }}>
              {step > 0 && (
                <button onClick={() => setStep(s=>s-1)} className="btn-secondary" style={{ flex:1 }}>← Back</button>
              )}
              {step < STEPS.length - 1 ? (
                <button onClick={nextStep} className="btn-primary" style={{ flex:1, padding:'0.875rem' }}>Continue →</button>
              ) : (
                <button onClick={handleFinish} className="btn-primary" style={{ flex:1, padding:'0.875rem' }}>✓ Complete Setup</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
