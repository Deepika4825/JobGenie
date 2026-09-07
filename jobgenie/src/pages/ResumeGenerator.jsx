import { useState, useRef } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/* ── Empty state factories ─────────────────────────────────────── */
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

/* ── Reusable field components ─────────────────────────────────── */
const Field = ({ label, required, textarea, rows = 3, ...props }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
    <label style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--rose-secondary)', display:'block' }}>
      {label}{required && <span style={{ color:'var(--rose-accent)', marginLeft:'2px' }}>*</span>}
    </label>
    {textarea
      ? <textarea rows={rows} {...props} className="rose-input" style={{ resize:'vertical', ...props.style }} />
      : <input {...props} className="rose-input" />
    }
  </div>
);

/* Two-column desktop grid */
const Grid2 = ({ children, style }) => (
  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', ...style }}>
    {children}
  </div>
);

/* Three-column desktop grid */
const Grid3 = ({ children }) => (
  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
    {children}
  </div>
);

/* Section card with icon header */
const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="rose-card" style={{ display:'flex', flexDirection:'column', gap:'1.125rem' }}>
    <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', paddingBottom:'0.875rem', borderBottom:'1px solid var(--rose-border)' }}>
      <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'var(--rose-light)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon />
      </div>
      <h2 style={{ fontSize:'0.9375rem', fontWeight:700, color:'var(--rose-dark)' }}>{title}</h2>
    </div>
    {children}
  </div>
);

/* Add button */
const AddBtn = ({ onClick, label }) => (
  <button onClick={onClick} style={{ fontSize:'0.8125rem', fontWeight:600, color:'var(--rose-accent)', background:'none', border:'1px dashed var(--rose-primary)', borderRadius:'8px', padding:'0.5rem 1rem', cursor:'pointer', transition:'all 0.15s', display:'inline-flex', alignItems:'center', gap:'4px' }}
    onMouseEnter={e => { e.currentTarget.style.background='var(--rose-light)'; e.currentTarget.style.borderStyle='solid'; }}
    onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderStyle='dashed'; }}>
    + {label}
  </button>
);

/* Remove button (absolute top-right) */
const RemoveBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ position:'absolute', top:'0.75rem', right:'0.75rem', fontSize:'0.72rem', fontWeight:600, color:'#ef4444', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'6px', padding:'2px 8px', cursor:'pointer' }}>
    Remove
  </button>
);

/* Sub-entry card */
const EntryCard = ({ children, style }) => (
  <div style={{ position:'relative', border:'1px solid var(--rose-border)', borderRadius:'12px', padding:'1.125rem', background:'var(--er-rose-tint, #FFF3F3)', ...style }}>
    {children}
  </div>
);

/* ── SVG Icons ─────────────────────────────────────────────────── */
const IUser    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IDoc     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IGrad    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
const IZap     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const ICode    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const IBriefcase=()=> <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const IAward   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IStar    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IBook    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
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
      setPdfUrl(URL.createObjectURL(blob));
      setSuccess(true);
      setTimeout(() => pdfRef.current?.scrollIntoView({ behavior:'smooth' }), 100);
    } catch (e) { setError(e.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  const handleReset    = () => { setForm(initialForm()); setPdfUrl(''); setSuccess(false); setError(''); };
  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${form.personal.fullName.trim().replace(/\s+/g,'_') || 'resume'}_resume.pdf`;
    a.click();
  };

  return (
    <div style={{ maxWidth:'960px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'1.5rem', paddingBottom:'3rem' }}>

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="er-page-header">
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize:'1.5rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:'4px' }}>Fresher Resume Generator</h1>
            <p style={{ fontSize:'0.875rem', color:'rgba(255,255,255,0.78)', lineHeight:1.5 }}>
              Fill in your details below — we'll generate a professional, ATS-friendly PDF resume.
            </p>
          </div>
        </div>
      </div>

      {/* ── Personal Information — strict 2-col desktop layout ── */}
      <SectionCard title="Personal Information" icon={IUser}>
        {/* LEFT: Full Name, Email, LinkedIn, LeetCode, Medium */}
        {/* RIGHT: Phone, Location, GitHub, CodeChef */}
        <Grid2>
          {/* Left column */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <Field label="Full Name"   required value={form.personal.fullName} onChange={e=>setPersonal('fullName', e.target.value)} placeholder="Deepika R" />
            <Field label="Email"       required value={form.personal.email}    onChange={e=>setPersonal('email',    e.target.value)} placeholder="you@example.com" type="email" />
            <Field label="LinkedIn URL"         value={form.personal.linkedin} onChange={e=>setPersonal('linkedin', e.target.value)} placeholder="linkedin.com/in/yourprofile" />
            <Field label="LeetCode URL"         value={form.personal.leetcode} onChange={e=>setPersonal('leetcode', e.target.value)} placeholder="leetcode.com/yourprofile" />
            <Field label="Medium URL"           value={form.personal.medium}   onChange={e=>setPersonal('medium',   e.target.value)} placeholder="medium.com/@yourprofile" />
          </div>
          {/* Right column */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <Field label="Phone Number" required value={form.personal.phone}    onChange={e=>setPersonal('phone',    e.target.value)} placeholder="+91 9876543210" />
            <Field label="Location"              value={form.personal.location} onChange={e=>setPersonal('location', e.target.value)} placeholder="Bangalore, India" />
            <Field label="GitHub URL"            value={form.personal.github}   onChange={e=>setPersonal('github',   e.target.value)} placeholder="github.com/yourusername" />
            <Field label="CodeChef URL"          value={form.personal.codechef} onChange={e=>setPersonal('codechef', e.target.value)} placeholder="codechef.com/users/yourprofile" />
          </div>
        </Grid2>
      </SectionCard>

      {/* ── Professional Summary ─────────────────────────────────── */}
      <SectionCard title="Professional Summary" icon={IDoc}>
        <Field textarea label="Career Objective / Professional Summary" value={form.summary}
          onChange={e=>setForm(f=>({...f,summary:e.target.value}))} rows={4}
          placeholder="A motivated Computer Science graduate with expertise in full-stack development, seeking opportunities to build impactful AI-driven solutions..." />
      </SectionCard>

      {/* ── Education ────────────────────────────────────────────── */}
      <SectionCard title="Education" icon={IGrad}>
        {form.education.map((edu, i) => (
          <EntryCard key={i}>
            {form.education.length > 1 && <RemoveBtn onClick={() => removeItem('education', i)} />}
            <Grid2>
              <Field label="Degree / Course" required value={edu.degree}    onChange={e=>updateList('education',i,'degree',   e.target.value)} placeholder="B.Tech Artificial Intelligence" />
              <Field label="College / University"      value={edu.college}   onChange={e=>updateList('education',i,'college',  e.target.value)} placeholder="KPR Institute of Engineering" />
              <Field label="Location"                  value={edu.location}  onChange={e=>updateList('education',i,'location', e.target.value)} placeholder="e.g. Coimbatore" />
              <Field label="CGPA / Percentage"         value={edu.cgpa}      onChange={e=>updateList('education',i,'cgpa',     e.target.value)} placeholder="e.g. 8.5 / 85%" />
            </Grid2>
            <Grid2 style={{ marginTop:'1rem' }}>
              <Field label="Start Year" value={edu.startYear} onChange={e=>updateList('education',i,'startYear',e.target.value)} placeholder="e.g. 2021" />
              <Field label="End Year"   value={edu.endYear}   onChange={e=>updateList('education',i,'endYear',  e.target.value)} placeholder="e.g. 2025" />
            </Grid2>
          </EntryCard>
        ))}
        <AddBtn onClick={() => addItem('education', emptyEducation)} label="Add Education Entry" />
      </SectionCard>

      {/* ── Skills ───────────────────────────────────────────────── */}
      <SectionCard title="Skills" icon={IZap}>
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <Field label="Programming Languages" value={form.skills.programmingLanguages} onChange={e=>setSkills('programmingLanguages',e.target.value)} placeholder="Python, Java, JavaScript, TypeScript, C++" />
          <Field label="Technical Skills"      value={form.skills.technicalSkills}      onChange={e=>setSkills('technicalSkills',      e.target.value)} placeholder="React.js, Node.js, Flask, FastAPI, REST APIs, SQL, MongoDB" />
          <Field label="Tools & Technologies"  value={form.skills.tools}               onChange={e=>setSkills('tools',               e.target.value)} placeholder="Git, GitHub, Docker, AWS (EC2, S3, Lambda), VS Code, Postman" />
        </div>
      </SectionCard>

      {/* ── Projects ─────────────────────────────────────────────── */}
      <SectionCard title="Projects" icon={ICode}>
        {form.projects.map((proj, i) => (
          <EntryCard key={i}>
            {form.projects.length > 1 && <RemoveBtn onClick={() => removeItem('projects', i)} />}
            <Grid2>
              <Field label="Project Name"            value={proj.name}         onChange={e=>updateList('projects',i,'name',        e.target.value)} placeholder="JobGenie AI" />
              <Field label="Technologies Used"       value={proj.technologies} onChange={e=>updateList('projects',i,'technologies',e.target.value)} placeholder="React, Flask, Python, SQLite" />
            </Grid2>
            <div style={{ marginTop:'1rem' }}>
              <Field label="Project Link (optional)" value={proj.link}         onChange={e=>updateList('projects',i,'link',        e.target.value)} placeholder="https://github.com/username/project" />
            </div>
            <div style={{ marginTop:'1rem' }}>
              <Field textarea label="Project Description" value={proj.description} onChange={e=>updateList('projects',i,'description',e.target.value)}
                placeholder="Developed an AI-powered career assistant that analyzes resumes using Groq LLaMA. Built with React frontend and Flask backend. Deployed on Vercel and Render." rows={3} />
            </div>
          </EntryCard>
        ))}
        <AddBtn onClick={() => addItem('projects', emptyProject)} label="Add Project" />
      </SectionCard>

      {/* ── Experience (optional) ────────────────────────────────── */}
      <SectionCard title="Internship / Experience" icon={IBriefcase}>
        <p style={{ fontSize:'0.78rem', color:'var(--rose-secondary)', marginTop:'-0.25rem' }}>Optional — leave empty if you are a fresher without work experience.</p>
        {form.experience.map((exp, i) => (
          <EntryCard key={i}>
            <RemoveBtn onClick={() => removeItem('experience', i)} />
            <Grid3>
              <Field label="Company Name" value={exp.company}  onChange={e=>updateList('experience',i,'company', e.target.value)} placeholder="ABC Technologies" />
              <Field label="Role"         value={exp.role}     onChange={e=>updateList('experience',i,'role',    e.target.value)} placeholder="Frontend Intern" />
              <Field label="Duration"     value={exp.duration} onChange={e=>updateList('experience',i,'duration',e.target.value)} placeholder="Jan 2025 – Mar 2025" />
            </Grid3>
            <div style={{ marginTop:'1rem' }}>
              <Field textarea label="Description" value={exp.description} onChange={e=>updateList('experience',i,'description',e.target.value)}
                placeholder="Developed and maintained React components. Collaborated with backend team on REST API integration. Reduced page load time by 30%." rows={3} />
            </div>
          </EntryCard>
        ))}
        <AddBtn onClick={() => addItem('experience', emptyExperience)} label="Add Experience" />
      </SectionCard>

      {/* ── Certifications ───────────────────────────────────────── */}
      <SectionCard title="Certifications" icon={IAward}>
        {form.certifications.map((cert, i) => (
          <EntryCard key={i}>
            {form.certifications.length > 1 && <RemoveBtn onClick={() => removeItem('certifications', i)} />}
            <Grid3>
              <Field label="Certification Name"   value={cert.name}         onChange={e=>updateList('certifications',i,'name',        e.target.value)} placeholder="AWS Cloud Practitioner" />
              <Field label="Issuing Organization" value={cert.organization} onChange={e=>updateList('certifications',i,'organization',e.target.value)} placeholder="Amazon Web Services" />
              <Field label="Year"                 value={cert.year}         onChange={e=>updateList('certifications',i,'year',        e.target.value)} placeholder="2024" />
            </Grid3>
          </EntryCard>
        ))}
        <AddBtn onClick={() => addItem('certifications', emptyCert)} label="Add Certification" />
      </SectionCard>

      {/* ── Achievements ─────────────────────────────────────────── */}
      <SectionCard title="Achievements" icon={IStar}>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
          {form.achievements.map((ach, i) => (
            <div key={i} style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
              <input value={ach}
                onChange={e => { const arr=[...form.achievements]; arr[i]=e.target.value; setForm(f=>({...f,achievements:arr})); }}
                placeholder="Won 1st place in National Hackathon 2024 — built AI resume analyzer in 24 hours"
                className="rose-input" style={{ flex:1 }} />
              {form.achievements.length > 1 && (
                <button onClick={() => setForm(f=>({...f,achievements:f.achievements.filter((_,idx)=>idx!==i)}))}
                  style={{ width:'30px', height:'30px', borderRadius:'8px', border:'1px solid #fecaca', background:'#fef2f2', color:'#ef4444', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1rem', flexShrink:0 }}>
                  ×
                </button>
              )}
            </div>
          ))}
          <AddBtn onClick={() => setForm(f=>({...f,achievements:[...f.achievements,'']}))} label="Add Achievement" />
        </div>
      </SectionCard>

      {/* ── Relevant Coursework ──────────────────────────────────── */}
      <SectionCard title="Relevant Coursework" icon={IBook}>
        <p style={{ fontSize:'0.78rem', color:'var(--rose-secondary)', marginTop:'-0.25rem' }}>Optional — list relevant courses separated by commas</p>
        <Field label="Courses" value={form.coursework}
          onChange={e=>setForm(f=>({...f,coursework:e.target.value}))}
          placeholder="Data Structures & Algorithms, Machine Learning, Operating Systems, DBMS, Computer Networks" />
      </SectionCard>

      {/* ── Error ────────────────────────────────────────────────── */}
      {error && (
        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'12px', padding:'1rem', color:'#dc2626', fontSize:'0.875rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Action Buttons ───────────────────────────────────────── */}
      <div style={{ display:'flex', gap:'0.875rem', alignItems:'center' }}>
        <button onClick={handleGenerate} disabled={loading} className="btn-primary"
          style={{ padding:'0.9rem 2.5rem', fontSize:'0.95rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          {loading ? (
            <>
              <svg style={{ width:16,height:16 }} className="animate-spin" fill="none" viewBox="0 0 24 24">
                <circle style={{opacity:0.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path style={{opacity:0.8}} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Generating…
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
              Generate Resume
            </>
          )}
        </button>
        <button onClick={handleReset} className="btn-secondary" style={{ padding:'0.9rem 1.75rem' }}>
          Reset Form
        </button>
      </div>

      {/* ── Success + PDF Preview ────────────────────────────────── */}
      {success && pdfUrl && (
        <div ref={pdfRef} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div style={{ background:'rgba(142,69,133,0.06)', border:'1px solid rgba(142,69,133,0.2)', borderRadius:'14px', padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'rgba(142,69,133,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:'0.9rem', fontWeight:700, color:'var(--rose-accent)', marginBottom:'2px' }}>Resume generated successfully!</p>
              <p style={{ fontSize:'0.78rem', color:'var(--rose-secondary)' }}>Preview it below or download the PDF to your device.</p>
            </div>
            <button onClick={handleDownload} className="btn-primary" style={{ padding:'0.6rem 1.5rem', fontSize:'0.875rem', flexShrink:0 }}>
              ⬇ Download PDF
            </button>
          </div>

          <div className="rose-card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'0.875rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--rose-warm)', borderBottom:'1px solid var(--rose-border)' }}>
              <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--rose-dark)' }}>Resume Preview</span>
              <button onClick={handleDownload} style={{ fontSize:'0.78rem', color:'var(--rose-accent)', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>
                Download →
              </button>
            </div>
            <iframe src={pdfUrl} title="Resume Preview" style={{ width:'100%', height:'85vh', border:'none', display:'block' }} />
          </div>
        </div>
      )}
    </div>
  );
}
