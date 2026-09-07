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
    <div className="rose-card space-y-4">
      <h3 className="rose-section-title flex items-center gap-2">
        <span>{icon}</span>{title}
      </h3>
      {children}
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium block mb-1" style={{ color: 'var(--rose-secondary)' }}>{label}</label>
      {children}
    </div>
  );
}
function Row({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

export default function Profile() {
  const { profile, saveProfile } = useProfile();
  const navigate = useNavigate();
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);
  const resumeRef = useRef();
  const avatarRef = useRef();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleInterest = (item) => setForm((f) => ({
    ...f,
    interests: f.interests.includes(item) ? f.interests.filter((i) => i !== item) : [...f.interests, item],
  }));
  const handleResume = (file) => {
    if (file?.type === 'application/pdf') set('resumeName', file.name);
    else alert('Please upload a PDF file.');
  };
  const handleAvatar = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Please upload an image file.');
    const reader = new FileReader();
    reader.onload = (e) => set('avatar', e.target.result);
    reader.readAsDataURL(file);
  };
  const handleSave = () => {
    if (!form.name.trim()) return alert('Full name is required.');
    saveProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header banner */}
      <div className="rounded-2xl p-6 flex items-center gap-5"
        style={{ background: 'linear-gradient(135deg, var(--rose-purple) 0%, var(--rose-secondary) 100%)' }}>
        <div className="relative flex-shrink-0">
          <div className="p-1 rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }}>
            <Avatar avatar={form.avatar} name={form.name} size="lg" />
          </div>
          <button type="button" onClick={() => avatarRef.current.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors border"
            style={{ borderColor: 'var(--rose-border)' }}>
            <span className="text-sm">📷</span>
          </button>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatar(e.target.files[0])} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{form.name || 'Your Name'}</h1>
          {form.username && <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>@{form.username}</p>}
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{form.email || 'your@email.com'}</p>
          {form.jobTitle && (
            <span className="mt-2 inline-block text-xs px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
              {form.jobTitle}
            </span>
          )}
        </div>
      </div>

      <Section title="Profile Picture" icon="🖼️">
        <div onClick={() => avatarRef.current.click()}
          className="border-2 border-dashed rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all"
          style={{
            borderColor: form.avatar?.startsWith('data:') ? 'var(--rose-secondary)' : 'var(--rose-primary)',
            background: form.avatar?.startsWith('data:') ? 'var(--rose-warm)' : 'transparent',
          }}>
          <Avatar avatar={form.avatar} name={form.name} size="md" />
          <div className="flex-1">
            {form.avatar?.startsWith('data:')
              ? <p className="text-sm font-semibold" style={{ color: 'var(--rose-secondary)' }}>Photo uploaded ✓</p>
              : <p className="text-sm font-medium" style={{ color: 'var(--rose-secondary)' }}>Click to upload your photo</p>}
            <p className="text-xs mt-0.5" style={{ color: 'var(--rose-secondary)', opacity: 0.6 }}>JPG, PNG, GIF</p>
          </div>
          {form.avatar?.startsWith('data:') && (
            <button type="button" onClick={(e) => { e.stopPropagation(); set('avatar', ''); }}
              className="text-xs text-red-400 hover:text-red-500 flex-shrink-0">Remove</button>
          )}
          <input ref={avatarRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => handleAvatar(e.target.files[0])} />
        </div>
      </Section>

      <Section title="Personal Information" icon="👤">
        <Row>
          <Field label="Full Name *"><input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="John Doe" className="rose-input" /></Field>
          <Field label="Username">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--rose-secondary)' }}>@</span>
              <input value={form.username} onChange={(e) => set('username', e.target.value.toLowerCase().replace(/\s/g, '_'))} placeholder="john_doe" className="rose-input" style={{ paddingLeft: '2rem' }} />
            </div>
          </Field>
        </Row>
        <Row>
          <Field label="Email"><input value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" type="email" className="rose-input" /></Field>
          <Field label="Phone"><input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 234 567 8900" className="rose-input" /></Field>
        </Row>
        <Row>
          <Field label="Location"><input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="City, Country" className="rose-input" /></Field>
        </Row>
        <Field label="Bio"><textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="A short intro about yourself..." rows={3} className="rose-input resize-none" /></Field>
      </Section>

      <Section title="Education" icon="🎓">
        <Row>
          <Field label="Degree">
            <select value={form.degree} onChange={(e) => set('degree', e.target.value)} className="rose-input">
              <option value="">Select degree</option>
              {["High School","Diploma","Bachelor's","Master's","PhD","Other"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Graduation Year">
            <select value={form.graduationYear} onChange={(e) => set('graduationYear', e.target.value)} className="rose-input">
              <option value="">Select year</option>
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
          </Field>
        </Row>
        <Field label="College / University"><input value={form.college} onChange={(e) => set('college', e.target.value)} placeholder="e.g. MIT, Stanford, IIT..." className="rose-input" /></Field>
      </Section>

      <Section title="Career" icon="💼">
        <Row>
          <Field label="Desired Job Title"><input value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} placeholder="e.g. Data Scientist" className="rose-input" /></Field>
          <Field label="Experience Level">
            <select value={form.experience} onChange={(e) => set('experience', e.target.value)} className="rose-input">
              <option value="">Select level</option>
              {['Fresher','Intern','1-2 years','3-5 years','5+ years'].map((l) => <option key={l}>{l}</option>)}
            </select>
          </Field>
        </Row>
      </Section>

      <Section title="Interests" icon="🎯">
        <p className="text-xs" style={{ color: 'var(--rose-secondary)' }}>Select all that apply — used for job matching</p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((item) => (
            <button key={item} type="button" onClick={() => toggleInterest(item)}
              className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all"
              style={form.interests.includes(item)
                ? { background: 'var(--rose-purple)', color: 'white', borderColor: 'var(--rose-purple)' }
                : { background: 'transparent', color: 'var(--rose-dark)', borderColor: 'var(--rose-border)' }}>
              {item}
            </button>
          ))}
        </div>
        {form.interests.length > 0 && <p className="text-xs" style={{ color: 'var(--rose-purple)' }}>{form.interests.length} selected</p>}
      </Section>

      <Section title="Resume" icon="📄">
        <div onClick={() => resumeRef.current.click()}
          className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
          style={{
            borderColor: form.resumeName ? 'var(--rose-secondary)' : 'var(--rose-primary)',
            background: form.resumeName ? 'var(--rose-warm)' : 'transparent',
          }}>
          <p className="text-4xl mb-2">{form.resumeName ? '✅' : '📁'}</p>
          {form.resumeName
            ? <p className="text-sm font-semibold" style={{ color: 'var(--rose-secondary)' }}>{form.resumeName}</p>
            : <p className="text-sm" style={{ color: 'var(--rose-secondary)' }}>Click to upload your resume (PDF only)</p>}
          <input ref={resumeRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleResume(e.target.files[0])} />
        </div>
      </Section>

      <div className="flex gap-3 pb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary flex-1 py-3">← Back</button>
        <button onClick={handleSave}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{ background: saved ? '#22c55e' : 'var(--rose-purple)', color: 'white' }}>
          {saved ? '✓ Profile Saved!' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
