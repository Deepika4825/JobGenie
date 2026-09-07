import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import Avatar from '../components/Avatar';

const INTEREST_OPTIONS = [
  'Data Science','Machine Learning','Web Development','Mobile Development',
  'Cloud Computing','DevOps','Cybersecurity','UI/UX Design',
  'Blockchain','Game Development','AI Research','Product Management',
];
const YEARS = Array.from({ length: 10 }, (_, i) => String(2020 + i));

function Section({ title, icon, children }) {
  return (
    <div className="rose-card" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', paddingBottom:'0.75rem', borderBottom:'1px solid var(--rose-border)' }}>
        <div className="er-icon-box">{icon}</div>
        <h3 style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--rose-dark)', textTransform:'uppercase', letterSpacing:'0.06em', fontSize:'0.72rem', color:'var(--rose-accent)' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem' }}>{children}</div>;
}

function Field({ label, children }) {
  return (
    <div>
      <label className="rose-label">{label}</label>
      {children}
    </div>
  );
}

export default function Profile() {
  const { profile, saveProfile } = useProfile();
  const nav = useNavigate();
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);
  const resumeRef = useRef();
  const avatarRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleInterest = item => setForm(f => ({
    ...f,
    interests: f.interests.includes(item)
      ? f.interests.filter(i => i !== item)
      : [...f.interests, item],
  }));

  const handleResume = file => {
    if (file?.type === 'application/pdf') set('resumeName', file.name);
    else alert('Please upload a PDF file.');
  };

  const handleAvatar = file => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Please upload an image file.');
    const reader = new FileReader();
    reader.onload = e => set('avatar', e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.name.trim()) return alert('Full name is required.');
    saveProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth:'760px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'1.25rem' }}>

      {/* Header banner */}
      <div className="er-page-header" style={{ display:'flex', alignItems:'center', gap:'1.25rem' }}>
        <div style={{ position:'relative', flexShrink:0 }}>
          <div style={{ padding:'3px', borderRadius:'50%', background:'rgba(255,255,255,0.25)' }}>
            <Avatar avatar={form.avatar} name={form.name} size="lg" />
          </div>
          <button type="button" onClick={() => avatarRef.current.click()}
            style={{ position:'absolute', bottom:0, right:0, width:'30px', height:'30px', borderRadius:'50%', background:'white', border:'2px solid var(--rose-border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>
          <input ref={avatarRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleAvatar(e.target.files[0])} />
        </div>
        <div>
          <h1 style={{ fontSize:'1.25rem', fontWeight:800, color:'white', marginBottom:'2px' }}>{form.name || 'Your Name'}</h1>
          {form.username && <p style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.75)', fontWeight:600 }}>@{form.username}</p>}
          <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.55)', marginTop:'2px' }}>{form.email || 'your@email.com'}</p>
          {form.jobTitle && (
            <span style={{ marginTop:'6px', display:'inline-block', fontSize:'0.72rem', padding:'0.25rem 0.75rem', borderRadius:'999px', background:'rgba(255,255,255,0.18)', color:'white', border:'1px solid rgba(255,255,255,0.25)' }}>
              {form.jobTitle}
            </span>
          )}
        </div>
      </div>

      {/* Profile Picture */}
      <Section title="Profile Picture" icon={
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
        </svg>
      }>
        <div onClick={() => avatarRef.current.click()}
          style={{ border:`2px dashed ${form.avatar?.startsWith('data:') ? 'var(--rose-secondary)' : 'var(--rose-primary)'}`, borderRadius:'12px', padding:'1rem', display:'flex', alignItems:'center', gap:'1rem', cursor:'pointer', background: form.avatar?.startsWith('data:') ? 'var(--rose-warm)' : 'transparent', transition:'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background='var(--rose-warm)'}
          onMouseLeave={e => e.currentTarget.style.background=form.avatar?.startsWith('data:') ? 'var(--rose-warm)' : 'transparent'}>
          <Avatar avatar={form.avatar} name={form.name} size="md" />
          <div style={{ flex:1 }}>
            {form.avatar?.startsWith('data:')
              ? <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--rose-secondary)' }}>Photo uploaded ✓</p>
              : <p style={{ fontSize:'0.875rem', color:'var(--rose-secondary)' }}>Click to upload your photo</p>}
            <p style={{ fontSize:'0.72rem', color:'var(--rose-secondary)', opacity:0.6, marginTop:'2px' }}>JPG, PNG, GIF</p>
          </div>
          {form.avatar?.startsWith('data:') && (
            <button type="button" onClick={e => { e.stopPropagation(); set('avatar',''); }}
              style={{ fontSize:'0.72rem', color:'#ef4444', background:'none', border:'none', cursor:'pointer' }}>Remove</button>
          )}
          <input ref={avatarRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleAvatar(e.target.files[0])} />
        </div>
      </Section>

      {/* Personal Information */}
      <Section title="Personal Information" icon={
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      }>
        <Row>
          <Field label="Full Name *"><input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Jane Doe" className="rose-input" /></Field>
          <Field label="Username">
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'var(--rose-secondary)', fontSize:'0.875rem', fontWeight:500 }}>@</span>
              <input value={form.username} onChange={e=>set('username',e.target.value.toLowerCase().replace(/\s/g,'_'))} placeholder="jane_doe" className="rose-input" style={{ paddingLeft:'2rem' }} />
            </div>
          </Field>
        </Row>
        <Row>
          <Field label="Email"><input value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@example.com" type="email" className="rose-input" /></Field>
          <Field label="Phone"><input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+91 98765 43210" className="rose-input" /></Field>
        </Row>
        <Row>
          <Field label="Location"><input value={form.location} onChange={e=>set('location',e.target.value)} placeholder="City, Country" className="rose-input" /></Field>
        </Row>
        <Field label="Bio"><textarea value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="A short intro about yourself..." rows={3} className="rose-input" style={{ resize:'none' }} /></Field>
      </Section>

      {/* Education */}
      <Section title="Education" icon={
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      }>
        <Row>
          <Field label="Degree">
            <select value={form.degree} onChange={e=>set('degree',e.target.value)} className="rose-select">
              <option value="">Select degree</option>
              {["High School","Diploma","Bachelor's","Master's","PhD","Other"].map(d=><option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Graduation Year">
            <select value={form.graduationYear} onChange={e=>set('graduationYear',e.target.value)} className="rose-select">
              <option value="">Select year</option>
              {YEARS.map(y=><option key={y}>{y}</option>)}
            </select>
          </Field>
        </Row>
        <Field label="College / University"><input value={form.college} onChange={e=>set('college',e.target.value)} placeholder="e.g. MIT, Stanford, IIT..." className="rose-input" /></Field>
      </Section>

      {/* Career */}
      <Section title="Career" icon={
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      }>
        <Row>
          <Field label="Desired Job Title"><input value={form.jobTitle} onChange={e=>set('jobTitle',e.target.value)} placeholder="e.g. Data Scientist" className="rose-input" /></Field>
          <Field label="Experience Level">
            <select value={form.experience} onChange={e=>set('experience',e.target.value)} className="rose-select">
              <option value="">Select level</option>
              {['Fresher','Intern','1-2 years','3-5 years','5+ years'].map(l=><option key={l}>{l}</option>)}
            </select>
          </Field>
        </Row>
      </Section>

      {/* Interests */}
      <Section title="Interests" icon={
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      }>
        <p style={{ fontSize:'0.78rem', color:'var(--rose-secondary)' }}>Select all that apply — used for job matching</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
          {INTEREST_OPTIONS.map(item => (
            <button key={item} type="button" onClick={() => toggleInterest(item)}
              style={{
                fontSize:'0.78rem', padding:'0.375rem 0.875rem', borderRadius:'999px',
                fontWeight:500, cursor:'pointer', border:'1.5px solid', transition:'all 0.15s ease',
                background: form.interests.includes(item) ? 'var(--rose-accent)' : 'transparent',
                color:      form.interests.includes(item) ? 'white'             : 'var(--rose-dark)',
                borderColor:form.interests.includes(item) ? 'var(--rose-accent)' : 'var(--rose-border)',
              }}>
              {item}
            </button>
          ))}
        </div>
        {form.interests.length > 0 && (
          <p style={{ fontSize:'0.72rem', color:'var(--rose-accent)', fontWeight:600 }}>{form.interests.length} selected</p>
        )}
      </Section>

      {/* Resume */}
      <Section title="Resume" icon={
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
      }>
        <div onClick={() => resumeRef.current.click()}
          style={{ border:`2px dashed ${form.resumeName ? 'var(--rose-secondary)' : 'var(--rose-primary)'}`, borderRadius:'12px', padding:'1.5rem', textAlign:'center', cursor:'pointer', background: form.resumeName ? 'var(--rose-warm)' : 'transparent', transition:'all 0.2s' }}>
          <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>{form.resumeName ? '✅' : '📁'}</div>
          {form.resumeName
            ? <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--rose-secondary)' }}>{form.resumeName}</p>
            : <p style={{ fontSize:'0.875rem', color:'var(--rose-secondary)' }}>Click to upload your resume (PDF only)</p>}
          <input ref={resumeRef} type="file" accept=".pdf" style={{ display:'none' }} onChange={e => handleResume(e.target.files[0])} />
        </div>
      </Section>

      {/* Actions */}
      <div style={{ display:'flex', gap:'0.75rem', paddingBottom:'1.5rem' }}>
        <button onClick={() => nav(-1)} className="btn-secondary" style={{ flex:1 }}>← Back</button>
        <button onClick={handleSave}
          style={{ flex:1, padding:'0.75rem', borderRadius:'12px', fontSize:'0.9rem', fontWeight:600, border:'none', cursor:'pointer', transition:'all 0.18s', color:'white', background: saved ? '#22c55e' : 'var(--rose-accent)', boxShadow: saved ? '0 2px 8px rgba(34,197,94,0.3)' : '0 2px 8px rgba(142,69,133,0.28)' }}>
          {saved ? '✓ Profile Saved!' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
