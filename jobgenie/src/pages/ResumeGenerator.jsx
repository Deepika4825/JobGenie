import { useState, useRef } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── Empty state factories ────────────────────────────────────────────────────
const emptyEducation   = () => ({ degree:'', college:'', location:'', startYear:'', endYear:'', cgpa:'' });
const emptyProject     = () => ({ name:'', technologies:'', description:'', link:'' });
const emptyExperience  = () => ({ company:'', role:'', duration:'', description:'' });
const emptyCert        = () => ({ name:'', organization:'', year:'' });

const initialForm = () => ({
  personal: { fullName:'', phone:'', email:'', linkedin:'', github:'', location:'' },
  summary: '',
  education: [emptyEducation()],
  skills: { programmingLanguages:'', technicalSkills:'', tools:'' },
  projects: [emptyProject()],
  experience: [],
  certifications: [emptyCert()],
  achievements: [''],
  coursework: '',
});

// ── Reusable input components ────────────────────────────────────────────────
const Field = ({ label, required, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-600">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <input
      {...props}
      className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
    />
  </div>
);

const TextArea = ({ label, required, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-600">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <textarea
      rows={3}
      {...props}
      className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white resize-y"
    />
  </div>
);

const SectionCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
      <span>{icon}</span>{title}
    </h2>
    {children}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function ResumeGenerator() {
  const [form, setForm]       = useState(initialForm());
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [pdfUrl, setPdfUrl]   = useState('');
  const [success, setSuccess] = useState(false);
  const pdfRef = useRef(null);

  // ── Field updaters ──────────────────────────────────────────────────────
  const setPersonal  = (k, v) => setForm(f => ({ ...f, personal: { ...f.personal, [k]: v } }));
  const setSkills    = (k, v) => setForm(f => ({ ...f, skills:   { ...f.skills,   [k]: v } }));

  const updateList = (key, i, field, value) =>
    setForm(f => {
      const arr = [...f[key]];
      arr[i] = { ...arr[i], [field]: value };
      return { ...f, [key]: arr };
    });

  const addItem    = (key, empty) => setForm(f => ({ ...f, [key]: [...f[key], empty()] }));
  const removeItem = (key, i)     => setForm(f => ({ ...f, [key]: f[key].filter((_, idx) => idx !== i) }));

  const updateAchievement = (i, v) =>
    setForm(f => {
      const arr = [...f.achievements];
      arr[i] = v;
      return { ...f, achievements: arr };
    });

  // ── Validation ──────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.personal.fullName.trim()) return 'Full name is required.';
    if (!form.personal.email.trim())    return 'Email is required.';
    if (!form.personal.phone.trim())    return 'Phone number is required.';
    const hasEdu = form.education.some(e => e.degree.trim() || e.college.trim());
    if (!hasEdu) return 'At least one education entry is required.';
    return '';
  };

  // ── Generate ────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      // Clean empty entries
      const payload = {
        ...form,
        education:      form.education.filter(e => e.degree.trim() || e.college.trim()),
        projects:       form.projects.filter(p => p.name.trim()),
        experience:     form.experience.filter(e => e.company.trim() || e.role.trim()),
        certifications: form.certifications.filter(c => c.name.trim()),
        achievements:   form.achievements.filter(a => a.trim()),
      };

      const res = await fetch(`${API}/generate-resume`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate resume');
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      setPdfUrl(url);
      setSuccess(true);
      setTimeout(() => pdfRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm());
    setPdfUrl('');
    setSuccess(false);
    setError('');
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${form.personal.fullName.trim().replace(/\s+/g, '_') || 'resume'}_resume.pdf`;
    a.click();
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">📄 Fresher Resume Generator</h1>
        <p className="text-indigo-100 text-sm">
          Fill in your details below. We'll generate a professional, ATS-friendly PDF resume for you.
        </p>
      </div>

      {/* ── Personal Information ─────────────────────────────────────────── */}
      <SectionCard title="Personal Information" icon="👤">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name"     required value={form.personal.fullName}  onChange={e => setPersonal('fullName',  e.target.value)} placeholder="Deepika R" />
          <Field label="Phone Number"  required value={form.personal.phone}     onChange={e => setPersonal('phone',     e.target.value)} placeholder="+91 9876543210" />
          <Field label="Email"         required value={form.personal.email}     onChange={e => setPersonal('email',     e.target.value)} placeholder="you@example.com" type="email" />
          <Field label="Location"               value={form.personal.location}  onChange={e => setPersonal('location',  e.target.value)} placeholder="Bangalore, India" />
          <Field label="LinkedIn URL"           value={form.personal.linkedin}  onChange={e => setPersonal('linkedin',  e.target.value)} placeholder="linkedin.com/in/yourprofile" />
          <Field label="GitHub URL"             value={form.personal.github}    onChange={e => setPersonal('github',    e.target.value)} placeholder="github.com/yourusername" />
        </div>
      </SectionCard>

      {/* ── Professional Summary ─────────────────────────────────────────── */}
      <SectionCard title="Professional Summary" icon="📝">
        <TextArea
          label="Career Objective / Professional Summary"
          value={form.summary}
          onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
          placeholder="A motivated Computer Science graduate with expertise in full-stack development..."
          rows={4}
        />
      </SectionCard>

      {/* ── Education ────────────────────────────────────────────────────── */}
      <SectionCard title="Education" icon="🎓">
        {form.education.map((edu, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 relative">
            {form.education.length > 1 && (
              <button onClick={() => removeItem('education', i)}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-xs font-semibold">
                ✕ Remove
              </button>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Degree / Course" required value={edu.degree}   onChange={e => updateList('education', i, 'degree',    e.target.value)} placeholder="B.Tech Computer Science" />
              <Field label="College / University"      value={edu.college}  onChange={e => updateList('education', i, 'college',   e.target.value)} placeholder="XYZ University" />
              <Field label="Location"                  value={edu.location} onChange={e => updateList('education', i, 'location',  e.target.value)} placeholder="Bangalore" />
              <Field label="CGPA / Percentage"         value={edu.cgpa}     onChange={e => updateList('education', i, 'cgpa',      e.target.value)} placeholder="8.5 / 85%" />
              <Field label="Start Year"                value={edu.startYear}onChange={e => updateList('education', i, 'startYear', e.target.value)} placeholder="2020" />
              <Field label="End Year"                  value={edu.endYear}  onChange={e => updateList('education', i, 'endYear',   e.target.value)} placeholder="2024" />
            </div>
          </div>
        ))}
        <button onClick={() => addItem('education', emptyEducation)}
          className="text-sm text-indigo-600 font-semibold hover:underline">
          + Add Education
        </button>
      </SectionCard>

      {/* ── Skills ────────────────────────────────────────────────────────── */}
      <SectionCard title="Skills" icon="⚡">
        <div className="space-y-3">
          <Field label="Programming Languages" value={form.skills.programmingLanguages} onChange={e => setSkills('programmingLanguages', e.target.value)} placeholder="Python, Java, JavaScript, C++" />
          <Field label="Technical Skills"      value={form.skills.technicalSkills}      onChange={e => setSkills('technicalSkills',      e.target.value)} placeholder="React, Node.js, Flask, REST APIs, SQL" />
          <Field label="Tools & Technologies"  value={form.skills.tools}               onChange={e => setSkills('tools',               e.target.value)} placeholder="Git, Docker, AWS, VS Code, Postman" />
        </div>
      </SectionCard>

      {/* ── Projects ──────────────────────────────────────────────────────── */}
      <SectionCard title="Projects" icon="🛠️">
        {form.projects.map((proj, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 relative">
            {form.projects.length > 1 && (
              <button onClick={() => removeItem('projects', i)}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-xs font-semibold">
                ✕ Remove
              </button>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Project Name"        value={proj.name}         onChange={e => updateList('projects', i, 'name',         e.target.value)} placeholder="JobGenie AI" />
              <Field label="Technologies Used"   value={proj.technologies} onChange={e => updateList('projects', i, 'technologies', e.target.value)} placeholder="React, Flask, Python, SQLite" />
              <Field label="Project Link (optional)" value={proj.link}     onChange={e => updateList('projects', i, 'link',         e.target.value)} placeholder="https://github.com/..." />
            </div>
            <TextArea label="Project Description" value={proj.description} onChange={e => updateList('projects', i, 'description', e.target.value)} placeholder="Describe what the project does, your role, and impact..." rows={3} />
          </div>
        ))}
        <button onClick={() => addItem('projects', emptyProject)}
          className="text-sm text-indigo-600 font-semibold hover:underline">
          + Add Project
        </button>
      </SectionCard>

      {/* ── Experience (optional) ─────────────────────────────────────────── */}
      <SectionCard title="Internship / Experience" icon="💼">
        <p className="text-xs text-gray-500 -mt-2">Optional — leave empty if you have no experience yet.</p>
        {form.experience.map((exp, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 relative">
            <button onClick={() => removeItem('experience', i)}
              className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-xs font-semibold">
              ✕ Remove
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Company Name" value={exp.company}  onChange={e => updateList('experience', i, 'company',  e.target.value)} placeholder="ABC Technologies" />
              <Field label="Role"         value={exp.role}     onChange={e => updateList('experience', i, 'role',     e.target.value)} placeholder="Frontend Intern" />
              <Field label="Duration"     value={exp.duration} onChange={e => updateList('experience', i, 'duration', e.target.value)} placeholder="Jun 2023 – Aug 2023" />
            </div>
            <TextArea label="Description" value={exp.description} onChange={e => updateList('experience', i, 'description', e.target.value)} placeholder="Describe your responsibilities and achievements..." rows={3} />
          </div>
        ))}
        <button onClick={() => addItem('experience', emptyExperience)}
          className="text-sm text-indigo-600 font-semibold hover:underline">
          + Add Experience
        </button>
      </SectionCard>

      {/* ── Certifications ────────────────────────────────────────────────── */}
      <SectionCard title="Certifications" icon="🏆">
        {form.certifications.map((cert, i) => (
          <div key={i} className="flex flex-wrap gap-3 items-end border border-gray-200 rounded-xl p-4 relative">
            {form.certifications.length > 1 && (
              <button onClick={() => removeItem('certifications', i)}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-xs font-semibold">
                ✕
              </button>
            )}
            <div className="flex-1 min-w-[150px]">
              <Field label="Certification Name"     value={cert.name}         onChange={e => updateList('certifications', i, 'name',         e.target.value)} placeholder="AWS Cloud Practitioner" />
            </div>
            <div className="flex-1 min-w-[150px]">
              <Field label="Issuing Organization"   value={cert.organization} onChange={e => updateList('certifications', i, 'organization', e.target.value)} placeholder="Amazon Web Services" />
            </div>
            <div className="w-24">
              <Field label="Year" value={cert.year} onChange={e => updateList('certifications', i, 'year', e.target.value)} placeholder="2023" />
            </div>
          </div>
        ))}
        <button onClick={() => addItem('certifications', emptyCert)}
          className="text-sm text-indigo-600 font-semibold hover:underline">
          + Add Certification
        </button>
      </SectionCard>

      {/* ── Achievements ──────────────────────────────────────────────────── */}
      <SectionCard title="Achievements" icon="🌟">
        {form.achievements.map((ach, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              value={ach}
              onChange={e => updateAchievement(i, e.target.value)}
              placeholder="Won 1st place in National Hackathon 2023"
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {form.achievements.length > 1 && (
              <button onClick={() => setForm(f => ({ ...f, achievements: f.achievements.filter((_, idx) => idx !== i) }))}
                className="text-red-400 hover:text-red-600 text-lg font-bold">✕</button>
            )}
          </div>
        ))}
        <button onClick={() => setForm(f => ({ ...f, achievements: [...f.achievements, ''] }))}
          className="text-sm text-indigo-600 font-semibold hover:underline">
          + Add Achievement
        </button>
      </SectionCard>

      {/* ── Coursework ────────────────────────────────────────────────────── */}
      <SectionCard title="Relevant Coursework" icon="📚">
        <p className="text-xs text-gray-500 -mt-2">Optional</p>
        <Field
          label="Courses (comma separated)"
          value={form.coursework}
          onChange={e => setForm(f => ({ ...f, coursework: e.target.value }))}
          placeholder="Data Structures, Algorithms, Operating Systems, DBMS, Machine Learning"
        />
      </SectionCard>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* ── Action Buttons ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <button onClick={handleGenerate} disabled={loading}
          className="flex-1 sm:flex-none bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all flex items-center justify-center gap-2">
          {loading ? (
            <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg> Generating...</>
          ) : '🚀 Generate Resume'}
        </button>
        <button onClick={handleReset}
          className="px-6 py-3 rounded-xl font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all">
          🔄 Reset
        </button>
      </div>

      {/* ── Success + PDF Preview ─────────────────────────────────────────── */}
      {success && pdfUrl && (
        <div ref={pdfRef} className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-sm font-semibold text-green-700">Your fresher resume has been generated successfully!</p>
              <p className="text-xs text-gray-500 mt-0.5">Preview it below or download it to your device.</p>
            </div>
            <button onClick={handleDownload}
              className="ml-auto flex-shrink-0 bg-green-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-green-700 transition-colors whitespace-nowrap">
              ⬇️ Download PDF
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">📄 Resume Preview</span>
              <button onClick={handleDownload}
                className="text-xs text-indigo-600 font-semibold hover:underline">
                Download
              </button>
            </div>
            <iframe
              src={pdfUrl}
              title="Resume Preview"
              className="w-full"
              style={{ height: '80vh' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
