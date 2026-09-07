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
  const navigate = useNavigate();
  const avatarRef = useRef();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: profile.name || '', username: profile.username || '',
    phone: '', location: '', bio: '',
    degree: '', college: '', graduationYear: '',
    jobTitle: '', experience: '', interests: [], avatar: '',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleInterest = (item) => setForm((f) => ({
    ...f,
    interests: f.interests.includes(item) ? f.interests.filter((i) => i !== item) : [...f.interests, item],
  }));
  const handleAvatar = (file) => {
    if (!file?.type.startsWith('image/')) return alert('Please upload an image.');
    const reader = new FileReader();
    reader.onload = (e) => set('avatar', e.target.result);
    reader.readAsDataURL(file);
  };
  const nextStep = () => {
    if (step === 0 && !form.name.trim()) return alert('Full name is required.');
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };
  const handleFinish = () => {
    if (!form.name.trim()) return alert('Full name is required.');
    saveProfile(form);
    navigate('/analyze', { replace: true });
  };
  const handleSkip = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    saveProfile({ ...form, name: form.name.trim() || user.name || user.email || 'User' });
    navigate('/analyze', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'var(--rose-bg)' }}>
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-6"><Logo size={50} /></div>
        <div className="rose-card overflow-hidden p-0">
          {/* Progress bar */}
          <div className="h-1.5" style={{ background: 'var(--rose-border)' }}>
            <div className="h-1.5 transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: 'var(--rose-purple)' }} />
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--rose-dark)' }}>Set Up Your Profile</h2>
                <p className="text-sm mt-0.5" style={{ color: 'var(--rose-secondary)' }}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
              </div>
              <button onClick={handleSkip} className="text-xs hover:underline" style={{ color: 'var(--rose-secondary)' }}>
                Skip for now
              </button>
            </div>

            {/* Step 0 */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3 mb-2">
                  <div className="relative">
                    <Avatar avatar={form.avatar} name={form.name} size="lg" />
                    <button type="button" onClick={() => avatarRef.current.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 text-white rounded-full flex items-center justify-center shadow-lg text-sm transition-colors"
                      style={{ background: 'var(--rose-purple)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--rose-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--rose-purple)'}>
                      📷
                    </button>
                    <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatar(e.target.files[0])} />
                  </div>
                  <p className="text-xs" style={{ color: 'var(--rose-secondary)' }}>Click 📷 to upload a photo</p>
                </div>
                {[['Full Name *','name','John Doe','text'],['Phone','phone','+91 98765 43210','text'],['Location','location','Bangalore, India','text']].map(([label, key, ph, type]) => (
                  <div key={key}>
                    <label className="text-sm font-medium block mb-1" style={{ color: 'var(--rose-dark)' }}>{label}</label>
                    <input type={type} value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={ph} className="rose-input" />
                  </div>
                ))}
                <div>
                  <label className="text-sm font-medium block mb-1" style={{ color: 'var(--rose-dark)' }}>Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--rose-secondary)' }}>@</span>
                    <input value={form.username} onChange={(e) => set('username', e.target.value.toLowerCase().replace(/\s/g, '_'))} placeholder="john_doe" className="rose-input" style={{ paddingLeft: '2rem' }} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1" style={{ color: 'var(--rose-dark)' }}>Bio</label>
                  <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="A short intro..." rows={2} className="rose-input resize-none" />
                </div>
              </div>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                {[['Degree','degree','select'],['College / University','college','text'],['Graduation Year','graduationYear','select'],['Desired Job Title','jobTitle','text'],['Experience Level','experience','select']].map(([label, key, type]) => (
                  <div key={key}>
                    <label className="text-sm font-medium block mb-1" style={{ color: 'var(--rose-dark)' }}>{label}</label>
                    {type === 'select' ? (
                      <select value={form[key]} onChange={(e) => set(key, e.target.value)} className="rose-input">
                        <option value="">Select...</option>
                        {key === 'degree' && ["High School","Diploma","Bachelor's","Master's","PhD","Other"].map(d => <option key={d}>{d}</option>)}
                        {key === 'graduationYear' && Array.from({length:10},(_,i)=>String(2020+i)).map(y => <option key={y}>{y}</option>)}
                        {key === 'experience' && ['Fresher','Intern','1-2 years','3-5 years','5+ years'].map(l => <option key={l}>{l}</option>)}
                      </select>
                    ) : (
                      <input value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={label} className="rose-input" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm" style={{ color: 'var(--rose-secondary)' }}>Select your areas of interest — used for job matching</p>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((item) => (
                    <button key={item} type="button" onClick={() => toggleInterest(item)}
                      className="text-sm px-4 py-2 rounded-full border font-medium transition-all"
                      style={form.interests.includes(item)
                        ? { background: 'var(--rose-purple)', color: 'white', borderColor: 'var(--rose-purple)' }
                        : { background: 'transparent', color: 'var(--rose-dark)', borderColor: 'var(--rose-border)' }}>
                      {item}
                    </button>
                  ))}
                </div>
                {form.interests.length > 0 && <p className="text-xs font-medium" style={{ color: 'var(--rose-purple)' }}>{form.interests.length} selected</p>}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button onClick={() => setStep((s) => s - 1)} className="btn-secondary flex-1 py-3">← Back</button>
              )}
              {step < STEPS.length - 1 ? (
                <button onClick={nextStep} className="btn-primary flex-1 py-3">Continue →</button>
              ) : (
                <button onClick={handleFinish} className="btn-primary flex-1 py-3">✓ Complete Setup</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
