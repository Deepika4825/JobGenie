import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import Logo from '../components/Logo';
import Avatar from '../components/Avatar';

const inp = 'w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500';

const INTEREST_OPTIONS = [
  'Data Science', 'Machine Learning', 'Web Development', 'Mobile Development',
  'Cloud Computing', 'DevOps', 'Cybersecurity', 'UI/UX Design',
  'Blockchain', 'AI Research', 'Full Stack', 'Product Management',
];

const STEPS = ['Basic Info', 'Education & Career', 'Interests'];

export default function ProfileSetup() {
  const { profile, saveProfile } = useProfile();
  const navigate = useNavigate();
  const avatarRef = useRef();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name:           profile.name || '',
    username:       profile.username || '',
    phone:          '',
    location:       '',
    bio:            '',
    degree:         '',
    college:        '',
    graduationYear: '',
    jobTitle:       '',
    experience:     '',
    interests:      [],
    avatar:         '',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleInterest = (item) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(item)
        ? f.interests.filter((i) => i !== item)
        : [...f.interests, item],
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
    const name = form.name.trim() || user.name || user.email || 'User';
    saveProfile({ ...form, name });
    navigate('/analyze', { replace: true });
  };

  const initials = (form.name || 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex justify-center mb-6"><Logo size={50} /></div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100">
            <div
              className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          <div className="p-8">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Set Up Your Profile</h2>
                <p className="text-sm text-gray-500 mt-0.5">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
              </div>
              <button onClick={handleSkip} className="text-xs text-gray-400 hover:text-gray-600 underline">
                Skip for now
              </button>
            </div>

            {/* ── Step 0: Basic Info ── */}
            {step === 0 && (
              <div className="space-y-4">
                {/* Avatar picker */}
                <div className="flex flex-col items-center gap-3 mb-2">
                  <div className="relative">
                    <Avatar avatar={form.avatar} name={form.name} size="lg" />
                    <button type="button" onClick={() => avatarRef.current.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors text-sm">
                      📷
                    </button>
                    <input ref={avatarRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => handleAvatar(e.target.files[0])} />
                  </div>
                  <p className="text-xs text-gray-400">Click 📷 to upload a photo</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Full Name *</label>
                  <input value={form.name} onChange={(e) => set('name', e.target.value)}
                    placeholder="John Doe" className={inp} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">@</span>
                    <input value={form.username}
                      onChange={(e) => set('username', e.target.value.toLowerCase().replace(/\s/g, '_'))}
                      placeholder="john_doe" className={`${inp} pl-8`} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Phone</label>
                  <input value={form.phone} onChange={(e) => set('phone', e.target.value)}
                    placeholder="+91 98765 43210" className={inp} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Location</label>
                  <input value={form.location} onChange={(e) => set('location', e.target.value)}
                    placeholder="Bangalore, India" className={inp} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Bio</label>
                  <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)}
                    placeholder="A short intro about yourself..." rows={2}
                    className={`${inp} resize-none`} />
                </div>
              </div>
            )}

            {/* ── Step 1: Education & Career ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Degree</label>
                  <select value={form.degree} onChange={(e) => set('degree', e.target.value)} className={inp}>
                    <option value="">Select degree</option>
                    {["High School", "Diploma", "Bachelor's", "Master's", "PhD", "Other"].map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">College / University</label>
                  <input value={form.college} onChange={(e) => set('college', e.target.value)}
                    placeholder="e.g. IIT Madras, VIT..." className={inp} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Graduation Year</label>
                  <select value={form.graduationYear} onChange={(e) => set('graduationYear', e.target.value)} className={inp}>
                    <option value="">Select year</option>
                    {Array.from({ length: 10 }, (_, i) => String(2020 + i)).map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Desired Job Title</label>
                  <input value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)}
                    placeholder="e.g. Data Scientist, Frontend Developer" className={inp} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Experience Level</label>
                  <select value={form.experience} onChange={(e) => set('experience', e.target.value)} className={inp}>
                    <option value="">Select level</option>
                    {['Fresher', 'Intern', '1-2 years', '3-5 years', '5+ years'].map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* ── Step 2: Interests ── */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Select your areas of interest — used for job matching</p>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((item) => (
                    <button key={item} type="button" onClick={() => toggleInterest(item)}
                      className={`text-sm px-4 py-2 rounded-full border font-medium transition-all ${
                        form.interests.includes(item)
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
                      }`}>
                      {item}
                    </button>
                  ))}
                </div>
                {form.interests.length > 0 && (
                  <p className="text-xs text-indigo-600 font-medium">{form.interests.length} selected</p>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button onClick={() => setStep((s) => s - 1)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  ← Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button onClick={nextStep}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg">
                  Continue →
                </button>
              ) : (
                <button onClick={handleFinish}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg">
                  ✓ Complete Setup
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
