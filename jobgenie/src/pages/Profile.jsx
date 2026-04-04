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
const inp = 'w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500';

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
        <span>{icon}</span>{title}
      </h3>
      {children}
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
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

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 flex items-center gap-5 shadow-lg">
        <div className="relative flex-shrink-0">
          <div className="p-1 rounded-full bg-white/30 shadow-lg">
            <Avatar avatar={form.avatar} name={form.name} size="lg" className="ring-4 ring-white" />
          </div>
          <button type="button" onClick={() => avatarRef.current.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors border border-gray-200">
            <span className="text-sm">📷</span>
          </button>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatar(e.target.files[0])} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{form.name || 'Your Name'}</h1>
          {form.username && (
            <p className="text-indigo-200 text-sm font-semibold">@{form.username}</p>
          )}
          <p className="text-white/60 text-xs mt-0.5">{form.email || 'your@email.com'}</p>
          {form.jobTitle && (
            <span className="mt-2 inline-block text-xs bg-white/20 text-white px-3 py-1 rounded-full border border-white/30">
              {form.jobTitle}
            </span>
          )}
        </div>
      </div>

      {/* Profile Picture */}
      <Section title="Profile Picture" icon="🖼️">
        <div onClick={() => avatarRef.current.click()}
          className={`border-2 border-dashed rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all ${
            form.avatar?.startsWith('data:') ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'
          }`}>
          <Avatar avatar={form.avatar} name={form.name} size="md" />
          <div className="flex-1">
            {form.avatar?.startsWith('data:')
              ? <p className="text-sm font-semibold text-green-600">Photo uploaded ✓</p>
              : <p className="text-sm font-medium text-gray-500">Click to upload your photo</p>}
            <p className="text-xs text-gray-500/50 mt-0.5">JPG, PNG, GIF</p>
          </div>
          {form.avatar?.startsWith('data:') && (
            <button type="button" onClick={(e) => { e.stopPropagation(); set('avatar', ''); }}
              className="text-xs text-red-400 hover:text-red-300 flex-shrink-0">
              Remove
            </button>
          )}
          <input ref={avatarRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => handleAvatar(e.target.files[0])} />
        </div>
      </Section>

      {/* Personal Info */}
      <Section title="Personal Information" icon="👤">
        <Row>
          <Field label="Full Name *"><input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="John Doe" className={inp} /></Field>
          <Field label="Username">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
              <input value={form.username} onChange={(e) => set('username', e.target.value.toLowerCase().replace(/\s/g, '_'))} placeholder="john_doe" className={`${inp} pl-8`} />
            </div>
          </Field>
        </Row>
        <Row>
          <Field label="Email"><input value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" type="email" className={inp} /></Field>
          <Field label="Phone"><input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 234 567 8900" className={inp} /></Field>
        </Row>
        <Row>
          <Field label="Location"><input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="City, Country" className={inp} /></Field>
        </Row>
        <Field label="Bio"><textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="A short intro about yourself..." rows={3} className={`${inp} resize-none`} /></Field>
      </Section>

      {/* Education */}
      <Section title="Education" icon="🎓">
        <Row>
          <Field label="Degree">
            <select value={form.degree} onChange={(e) => set('degree', e.target.value)} className={inp}>
              <option value="">Select degree</option>
              {["High School","Diploma","Bachelor's","Master's","PhD","Other"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Graduation Year">
            <select value={form.graduationYear} onChange={(e) => set('graduationYear', e.target.value)} className={inp}>
              <option value="">Select year</option>
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
          </Field>
        </Row>
        <Field label="College / University"><input value={form.college} onChange={(e) => set('college', e.target.value)} placeholder="e.g. MIT, Stanford, IIT..." className={inp} /></Field>
      </Section>

      {/* Career */}
      <Section title="Career" icon="💼">
        <Row>
          <Field label="Desired Job Title"><input value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} placeholder="e.g. Data Scientist" className={inp} /></Field>
          <Field label="Experience Level">
            <select value={form.experience} onChange={(e) => set('experience', e.target.value)} className={inp}>
              <option value="">Select level</option>
              {['Fresher','Intern','1-2 years','3-5 years','5+ years'].map((l) => <option key={l}>{l}</option>)}
            </select>
          </Field>
        </Row>
      </Section>

      {/* Interests */}
      <Section title="Interests" icon="🎯">
        <p className="text-xs text-gray-500">Select all that apply — used for job matching</p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((item) => (
            <button key={item} type="button" onClick={() => toggleInterest(item)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                form.interests.includes(item)
                  ? 'bg-indigo-600 text-white border-primary shadow-lg shadow-indigo-200'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
              }`}>
              {item}
            </button>
          ))}
        </div>
        {form.interests.length > 0 && <p className="text-xs text-indigo-600">{form.interests.length} selected</p>}
      </Section>

      {/* Resume */}
      <Section title="Resume" icon="📄">
        <div onClick={() => resumeRef.current.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            form.resumeName ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'
          }`}>
          <p className="text-4xl mb-2">{form.resumeName ? '✅' : '📁'}</p>
          {form.resumeName
            ? <p className="text-sm font-semibold text-green-600">{form.resumeName}</p>
            : <p className="text-sm text-gray-500">Click to upload your resume (PDF only)</p>}
          <input ref={resumeRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleResume(e.target.files[0])} />
        </div>
      </Section>

      {/* Actions */}
      <div className="flex gap-3 pb-6">
        <button onClick={() => navigate(-1)}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-white/5 transition-colors">
          ← Back
        </button>
        <button onClick={handleSave}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg ${
            saved ? 'bg-green-500 text-white shadow-green-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
          }`}>
          {saved ? '✓ Profile Saved!' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
