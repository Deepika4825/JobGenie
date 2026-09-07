import { useState, useRef } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const emptyEducation  = () => ({ degree:'', college:'', location:'', startYear:'', endYear:'', cgpa:'' });
const emptyProject    = () => ({ name:'', technologies:'', description:'', link:'' });
const emptyExperience = () => ({ company:'', role:'', duration:'', description:'' });
const emptyCert       = () => ({ name:'', organization:'', year:'' });

const initialForm = () => ({
  personal: { fullName:'', phone:'', email:'', linkedin:'', github:'', leetcode:'', codechef:'', medium:'', location:'' },
  summary: '',
  education: [emptyEducation()],
  skills: { programmingLanguages:'', technicalSkills:'', tools:'' },
  projects: [emptyProject()],
  experience: [],
  certifications: [emptyCert()],
  achievements: [''],
  coursework: '',
});

const Field = ({ label, required, ...props }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
    <label className="rose-label">
      {label}{required && <span style={{ color:'var(--rose-accent)', marginLeft:'2px' }}>*</span>}
    </label>
    <input {...props} className="rose-input" />
  </div>
);

const TextArea = ({ label, required, ...props }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
    <label className="rose-label">
      {label}{required && <span style={{ color:'var(--rose-accent)', marginLeft:'2px' }}>*</span>}
    </label>
    <textarea rows={3} {...props} className="rose-input" style={{ resize:'vertical' }} />
  </div>
);

const SectionCard = ({ title, icon, children }) => (
  <div className="rose-card" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
    <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
      <div className="er-icon-box" style={{ fontSize:'0.9rem' }}>{icon}</div>
      <h2 style={{ fontSize:'0.9375rem', fontWeight:700, color:'var(--rose-dark)' }}>{title}</h2>
    </div>
    {children}
  </div>
);

const AddBtn = ({ onClick, label }) => (
  <button onClick={onClick} className="text-sm font-semibold hover:underline" style={{ color: 'var(--rose-purple)' }}>
    + {label}
  </button>
);

export default function ResumeGenerator() {
  const [form, setForm]       = useState(initialForm());
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [pdfUrl, setPdfUrl]   = useState('');
  const [success, setSuccess] = useState(false);
  const pdfRef = useRef(null);

  const setPersonal = (k, v) => setForm(f => ({ ...f, personal: { ...f.personal, [k]: v } }));
  const setSkills   = (k, v) => setForm(f => ({ ...f, skills:   { ...f.skills,   [k]: v } }));

  const updateList = (key, i, field, value) =>
    setForm(f => { const arr = [...f[key]]; arr[i] = { ...arr[i], [field]: value }; return { ...f, [key]: arr }; });

  const addItem    = (key, empty) => setForm(f => ({ ...f, [key]: [...f[key], empty()] }));
  const removeItem = (key, i)     => setForm(f => ({ ...f, [key]: f[key].filter((_, idx) => idx !== i) }));

  const validate = () => {
    if (!form.personal.fullName.trim()) return 'Full name is required.';
    if (!form.personal.email.trim())    return 'Email is required.';
    if (!form.personal.phone.trim())    return 'Phone number is required.';
    if (!form.education.some(e => e.degree.trim() || e.college.trim())) return 'At least one education entry is required.';
    return '';
  };

  const handleGenerate = async () => {
    setError('');
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        education:      form.education.filter(e => e.degree.trim() || e.college.trim()),
        projects:       form.projects.filter(p => p.name.trim()),
        experience:     form.experience.filter(e => e.company.trim() || e.role.trim()),
        certifications: form.certifications.filter(c => c.name.trim()),
        achievements:   form.achievements.filter(a => a.trim()),
      };
      const res = await fetch(`${API}/generate-resume`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed to generate resume'); }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      setPdfUrl(url); setSuccess(true);
      setTimeout(() => pdfRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) { setError(e.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  const handleReset = () => { setForm(initialForm()); setPdfUrl(''); setSuccess(false); setError(''); };
  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${form.personal.fullName.trim().replace(/\s+/g, '_') || 'resume'}_resume.pdf`;
    a.click();
  };

  const subCardStyle = { border: '1px solid var(--rose-border)', borderRadius: '0.75rem', padding: '1rem', position: 'relative' };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">

      <div className="er-page-header">
        <h1 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:'0.375rem', letterSpacing:'-0.01em' }}>📄 Fresher Resume Generator</h1>
        <p style={{ fontSize:'0.875rem', color:'rgba(255,255,255,0.82)', lineHeight:1.6 }}>
          Fill in your details below. We'll generate a professional, ATS-friendly PDF resume for you.
        </p>
      </div>

      {/* Personal Information */}
      <SectionCard title="Personal Information" icon="👤">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name"     required value={form.personal.fullName}  onChange={e => setPersonal('fullName',  e.target.value)} placeholder="Deepika R" />
          <Field label="Phone Number"  required value={form.personal.phone}     onChange={e => setPersonal('phone',     e.target.value)} placeholder="+91 9876543210" />
          <Field label="Email"         required value={form.personal.email}     onChange={e => setPersonal('email',     e.target.value)} placeholder="you@example.com" type="email" />
          <Field label="Location"               value={form.personal.location}  onChange={e => setPersonal('location',  e.target.value)} placeholder="Bangalore, India" />
          <Field label="LinkedIn URL"           value={form.personal.linkedin}  onChange={e => setPersonal('linkedin',  e.target.value)} placeholder="linkedin.com/in/yourprofile" />
          <Field label="GitHub URL"             value={form.personal.github}    onChange={e => setPersonal('github',    e.target.value)} placeholder="github.com/yourusername" />
          <Field label="LeetCode URL"           value={form.personal.leetcode}  onChange={e => setPersonal('leetcode',  e.target.value)} placeholder="leetcode.com/yourprofile" />
          <Field label="CodeChef URL"           value={form.personal.codechef}  onChange={e => setPersonal('codechef',  e.target.value)} placeholder="codechef.com/users/yourprofile" />
          <Field label="Medium URL"             value={form.personal.medium}    onChange={e => setPersonal('medium',    e.target.value)} placeholder="medium.com/@yourprofile" />
        </div>
      </SectionCard>

      {/* Summary */}
      <SectionCard title="Professional Summary" icon="📝">
        <TextArea label="Career Objective / Professional Summary" value={form.summary}
          onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} rows={4}
          placeholder="A motivated Computer Science graduate with expertise in full-stack development..." />
      </SectionCard>

      {/* Education */}
      <SectionCard title="Education" icon="🎓">
        {form.education.map((edu, i) => (
          <div key={i} style={subCardStyle}>
            {form.education.length > 1 && (
              <button onClick={() => removeItem('education', i)}
                className="absolute top-3 right-3 text-xs font-semibold text-red-400 hover:text-red-600">✕ Remove</button>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Degree / Course" required value={edu.degree}    onChange={e => updateList('education', i, 'degree',    e.target.value)} placeholder="B.Tech Computer Science" />
              <Field label="College / University"      value={edu.college}   onChange={e => updateList('education', i, 'college',   e.target.value)} placeholder="XYZ University" />
              <Field label="Location"                  value={edu.location}  onChange={e => updateList('education', i, 'location',  e.target.value)} placeholder="Bangalore" />
              <Field label="CGPA / Percentage"         value={edu.cgpa}      onChange={e => updateList('education', i, 'cgpa',      e.target.value)} placeholder="8.5 / 85%" />
              <Field label="Start Year"                value={edu.startYear} onChange={e => updateList('education', i, 'startYear', e.target.value)} placeholder="2020" />
              <Field label="End Year"                  value={edu.endYear}   onChange={e => updateList('education', i, 'endYear',   e.target.value)} placeholder="2024" />
            </div>
          </div>
        ))}
        <AddBtn onClick={() => addItem('education', emptyEducation)} label="Add Education" />
      </SectionCard>

      {/* Skills */}
      <SectionCard title="Skills" icon="⚡">
        <div className="space-y-3">
          <Field label="Programming Languages" value={form.skills.programmingLanguages} onChange={e => setSkills('programmingLanguages', e.target.value)} placeholder="Python, Java, JavaScript, C++" />
          <Field label="Technical Skills"      value={form.skills.technicalSkills}      onChange={e => setSkills('technicalSkills',      e.target.value)} placeholder="React, Node.js, Flask, REST APIs, SQL" />
          <Field label="Tools & Technologies"  value={form.skills.tools}               onChange={e => setSkills('tools',               e.target.value)} placeholder="Git, Docker, AWS, VS Code, Postman" />
        </div>
      </SectionCard>

      {/* Projects */}
      <SectionCard title="Projects" icon="🛠️">
        {form.projects.map((proj, i) => (
          <div key={i} style={subCardStyle}>
            {form.projects.length > 1 && (
              <button onClick={() => removeItem('projects', i)}
                className="absolute top-3 right-3 text-xs font-semibold text-red-400 hover:text-red-600">✕ Remove</button>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <Field label="Project Name"            value={proj.name}         onChange={e => updateList('projects', i, 'name',         e.target.value)} placeholder="JobGenie AI" />
              <Field label="Technologies Used"       value={proj.technologies} onChange={e => updateList('projects', i, 'technologies', e.target.value)} placeholder="React, Flask, Python, SQLite" />
              <Field label="Project Link (optional)" value={proj.link}         onChange={e => updateList('projects', i, 'link',         e.target.value)} placeholder="https://github.com/..." />
            </div>
            <TextArea label="Project Description" value={proj.description} onChange={e => updateList('projects', i, 'description', e.target.value)} placeholder="Describe what the project does, your role, and impact..." rows={3} />
          </div>
        ))}
        <AddBtn onClick={() => addItem('projects', emptyProject)} label="Add Project" />
      </SectionCard>

      {/* Experience */}
      <SectionCard title="Internship / Experience" icon="💼">
        <p className="text-xs -mt-2" style={{ color: 'var(--rose-secondary)' }}>Optional — leave empty if you have no experience yet.</p>
        {form.experience.map((exp, i) => (
          <div key={i} style={subCardStyle}>
            <button onClick={() => removeItem('experience', i)}
              className="absolute top-3 right-3 text-xs font-semibold text-red-400 hover:text-red-600">✕ Remove</button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <Field label="Company Name" value={exp.company}  onChange={e => updateList('experience', i, 'company',  e.target.value)} placeholder="ABC Technologies" />
              <Field label="Role"         value={exp.role}     onChange={e => updateList('experience', i, 'role',     e.target.value)} placeholder="Frontend Intern" />
              <Field label="Duration"     value={exp.duration} onChange={e => updateList('experience', i, 'duration', e.target.value)} placeholder="Jun 2023 – Aug 2023" />
            </div>
            <TextArea label="Description" value={exp.description} onChange={e => updateList('experience', i, 'description', e.target.value)} placeholder="Describe your responsibilities..." rows={3} />
          </div>
        ))}
        <AddBtn onClick={() => addItem('experience', emptyExperience)} label="Add Experience" />
      </SectionCard>

      {/* Certifications */}
      <SectionCard title="Certifications" icon="🏆">
        {form.certifications.map((cert, i) => (
          <div key={i} className="flex flex-wrap gap-3 items-end" style={{ ...subCardStyle }}>
            {form.certifications.length > 1 && (
              <button onClick={() => removeItem('certifications', i)}
                className="absolute top-3 right-3 text-xs font-semibold text-red-400 hover:text-red-600">✕</button>
            )}
            <div className="flex-1 min-w-[150px]"><Field label="Certification Name"   value={cert.name}         onChange={e => updateList('certifications', i, 'name',         e.target.value)} placeholder="AWS Cloud Practitioner" /></div>
            <div className="flex-1 min-w-[150px]"><Field label="Issuing Organization" value={cert.organization} onChange={e => updateList('certifications', i, 'organization', e.target.value)} placeholder="Amazon Web Services" /></div>
            <div className="w-24">                <Field label="Year"                 value={cert.year}         onChange={e => updateList('certifications', i, 'year',         e.target.value)} placeholder="2023" /></div>
          </div>
        ))}
        <AddBtn onClick={() => addItem('certifications', emptyCert)} label="Add Certification" />
      </SectionCard>

      {/* Achievements */}
      <SectionCard title="Achievements" icon="🌟">
        {form.achievements.map((ach, i) => (
          <div key={i} style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
            <input value={ach} onChange={e => { const arr=[...form.achievements]; arr[i]=e.target.value; setForm(f=>({...f,achievements:arr})); }}
              placeholder="Won 1st place in National Hackathon 2023" className="rose-input" style={{ flex:1 }} />
            {form.achievements.length > 1 && (
              <button onClick={() => setForm(f => ({ ...f, achievements: f.achievements.filter((_, idx) => idx !== i) }))}
                style={{ color:'#ef4444', background:'none', border:'none', cursor:'pointer', fontSize:'1.1rem', fontWeight:700 }}>✕</button>
            )}
          </div>
        ))}
        <AddBtn onClick={() => setForm(f => ({ ...f, achievements: [...f.achievements, ''] }))} label="Add Achievement" />
      </SectionCard>

      {/* Coursework */}
      <SectionCard title="Relevant Coursework" icon="📚">
        <p className="text-xs -mt-2" style={{ color: 'var(--rose-secondary)' }}>Optional</p>
        <Field label="Courses (comma separated)" value={form.coursework}
          onChange={e => setForm(f => ({ ...f, coursework: e.target.value }))}
          placeholder="Data Structures, Algorithms, Operating Systems, DBMS, Machine Learning" />
      </SectionCard>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm">⚠️ {error}</div>
      )}

      <div className="flex flex-wrap gap-3">
        <button onClick={handleGenerate} disabled={loading} className="btn-primary flex-1 sm:flex-none px-8 py-3 flex items-center justify-center gap-2">
          {loading ? (
            <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg> Generating...</>
          ) : '🚀 Generate Resume'}
        </button>
        <button onClick={handleReset} className="btn-secondary px-6 py-3">🔄 Reset</button>
      </div>

      {success && pdfUrl && (
        <div ref={pdfRef} className="space-y-4">
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'var(--rose-light)', border: '1px solid var(--rose-primary)' }}>
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--rose-purple)' }}>Your resume has been generated successfully!</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--rose-secondary)' }}>Preview it below or download it to your device.</p>
            </div>
            <button onClick={handleDownload} className="btn-primary ml-auto flex-shrink-0 text-sm px-5 py-2 whitespace-nowrap">
              ⬇️ Download PDF
            </button>
          </div>

          <div className="rose-card overflow-hidden p-0">
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'var(--rose-warm)', borderBottom: '1px solid var(--rose-border)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--rose-dark)' }}>📄 Resume Preview</span>
              <button onClick={handleDownload} className="text-xs font-semibold hover:underline" style={{ color: 'var(--rose-purple)' }}>Download</button>
            </div>
            <iframe src={pdfUrl} title="Resume Preview" className="w-full" style={{ height: '80vh' }} />
          </div>
        </div>
      )}
    </div>
  );
}
