/**
 * JD-Based Resume Generator
 * User uploads resume PDF + JD PDF/text → AI extracts + tailors → downloads PDF
 */
import { useState, useRef } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function UploadSVG() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
      stroke="var(--rose-accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}

function CheckSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="var(--rose-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function DropZone({ label, sublabel, file, onFile }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef();

  const pick = f => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.pdf')) { alert('Please upload a PDF file.'); return; }
    onFile(f);
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
      onClick={() => ref.current.click()}
      style={{
        border: `2px dashed ${drag ? 'var(--rose-accent)' : file ? 'var(--rose-secondary)' : 'var(--rose-primary)'}`,
        borderRadius: '14px', padding: '1.75rem 1.5rem', textAlign: 'center',
        cursor: 'pointer',
        background: drag ? 'var(--rose-light)' : file ? 'var(--rose-warm)' : '#FFF3F3',
        transition: 'all 0.2s ease',
      }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width:'48px', height:'48px', borderRadius:'13px',
          background: file ? 'var(--rose-warm)' : 'rgba(142,69,133,0.08)',
          border:`1px solid ${file ? 'var(--rose-border)' : 'rgba(142,69,133,0.15)'}`,
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          {file ? <CheckSVG /> : <UploadSVG />}
        </div>
        <p style={{ fontSize:'0.9rem', fontWeight:600, color: file ? 'var(--rose-secondary)' : 'var(--rose-dark)', margin:0 }}>
          {file ? file.name : label}
        </p>
        <p style={{ fontSize:'0.72rem', color:'var(--rose-secondary)', margin:0, opacity:0.7 }}>
          {file ? 'Click to change' : sublabel}
        </p>
      </div>
      <input ref={ref} type="file" accept=".pdf" style={{ display:'none' }}
        onChange={e => pick(e.target.files[0])} />
    </div>
  );
}

export default function JdResume() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile,     setJdFile]     = useState(null);
  const [jdText,     setJdText]     = useState('');
  const [jdMode,     setJdMode]     = useState('upload');
  const [links,      setLinks]      = useState({ linkedin:'', github:'', leetcode:'', codechef:'', medium:'' });
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [pdfUrl,     setPdfUrl]     = useState('');
  const [success,    setSuccess]    = useState(false);
  const pdfRef = useRef(null);

  const setLink = (k, v) => setLinks(l => ({ ...l, [k]: v }));

  const validate = () => {
    if (!resumeFile)                          return 'Please upload your resume PDF.';
    if (jdMode === 'upload' && !jdFile)       return 'Please upload the job description PDF.';
    if (jdMode === 'paste' && !jdText.trim()) return 'Please paste the job description text.';
    return '';
  };

  const handleGenerate = async () => {
    setError('');
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('resume_pdf', resumeFile);
      if (jdMode === 'upload' && jdFile) fd.append('jd_pdf', jdFile);
      else fd.append('jd_text', jdText.trim());

      // Send manual link overrides
      Object.entries(links).forEach(([k, v]) => { if (v.trim()) fd.append(k, v.trim()); });

      const res = await fetch(`${API}/generate-resume-jd-upload`, { method:'POST', body: fd });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || 'Failed to generate resume');
      }
      const blob = await res.blob();
      setPdfUrl(URL.createObjectURL(blob));
      setSuccess(true);
      setTimeout(() => pdfRef.current?.scrollIntoView({ behavior:'smooth' }), 100);
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResumeFile(null); setJdFile(null); setJdText('');
    setLinks({ linkedin:'', github:'', leetcode:'', codechef:'', medium:'' });
    setPdfUrl(''); setSuccess(false); setError('');
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl; a.download = 'jd_tailored_resume.pdf'; a.click();
  };

  const ILink = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );

  return (
    <div style={{ maxWidth:'860px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'1.5rem', paddingBottom:'3rem' }}>

      {/* Header */}
      <div className="er-page-header">
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize:'1.5rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:'4px' }}>JD Resume Generator</h1>
            <p style={{ fontSize:'0.875rem', color:'rgba(255,255,255,0.78)', lineHeight:1.5 }}>
              Upload your resume + job description — AI extracts your profile, tailors it to the role, and generates a clean one-page PDF.
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
        {[
          { n:'1', title:'Upload Resume', desc:'Upload your current resume PDF' },
          { n:'2', title:'Add Job Description', desc:'Upload JD as PDF or paste text' },
          { n:'3', title:'Download Result', desc:'AI tailors your resume and builds PDF' },
        ].map(({ n, title, desc }) => (
          <div key={n} style={{ background:'var(--rose-surface)', border:'1px solid var(--rose-border)', borderRadius:'14px', padding:'1rem', display:'flex', alignItems:'flex-start', gap:'0.75rem' }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:'var(--rose-light)', color:'var(--rose-accent)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.8rem', flexShrink:0 }}>
              {n}
            </div>
            <div>
              <p style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--rose-dark)', margin:'0 0 2px' }}>{title}</p>
              <p style={{ fontSize:'0.72rem', color:'var(--rose-secondary)', margin:0, lineHeight:1.4 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Step 1 — Resume */}
      <div className="rose-card">
        <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', paddingBottom:'0.875rem', borderBottom:'1px solid var(--rose-border)', marginBottom:'1rem' }}>
          <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'var(--rose-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize:'0.9375rem', fontWeight:700, color:'var(--rose-dark)', margin:0 }}>Step 1 — Upload Your Resume</h2>
            <p style={{ fontSize:'0.72rem', color:'var(--rose-secondary)', margin:0 }}>AI will extract your name, contact, education, skills, projects, and experience automatically.</p>
          </div>
        </div>
        <DropZone label="Drop your resume here" sublabel="or click to browse · PDF only"
          file={resumeFile} onFile={setResumeFile} />
      </div>

      {/* Step 2 — JD */}
      <div className="rose-card">
        <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', paddingBottom:'0.875rem', borderBottom:'1px solid var(--rose-border)', marginBottom:'1rem' }}>
          <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'var(--rose-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize:'0.9375rem', fontWeight:700, color:'var(--rose-dark)', margin:0 }}>Step 2 — Job Description</h2>
            <p style={{ fontSize:'0.72rem', color:'var(--rose-secondary)', margin:0 }}>Upload the JD as a PDF or paste the text directly.</p>
          </div>
        </div>

        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1rem' }}>
          {['upload','paste'].map(mode => (
            <button key={mode} onClick={() => setJdMode(mode)}
              style={{ padding:'0.45rem 1.25rem', borderRadius:'999px', border:'1.5px solid', fontSize:'0.8125rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                background:  jdMode===mode ? 'var(--rose-accent)' : 'transparent',
                color:       jdMode===mode ? 'white'              : 'var(--rose-dark)',
                borderColor: jdMode===mode ? 'var(--rose-accent)' : 'var(--rose-border)' }}>
              {mode === 'upload' ? '📄 Upload PDF' : '✏️ Paste Text'}
            </button>
          ))}
        </div>

        {jdMode === 'upload' ? (
          <DropZone label="Drop job description PDF" sublabel="or click to browse · PDF only"
            file={jdFile} onFile={setJdFile} />
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
            <label style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--rose-secondary)' }}>
              Job Description Text <span style={{ color:'var(--rose-accent)' }}>*</span>
            </label>
            <textarea rows={8} value={jdText} onChange={e => setJdText(e.target.value)}
              className="rose-input" style={{ resize:'vertical' }}
              placeholder="Paste the full job description here — title, responsibilities, required skills, qualifications..." />
          </div>
        )}
      </div>

      {/* Step 3 — Optional Link Overrides */}
      <div className="rose-card">
        <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', paddingBottom:'0.875rem', borderBottom:'1px solid var(--rose-border)', marginBottom:'1rem' }}>
          <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'var(--rose-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ILink />
          </div>
          <div>
            <h2 style={{ fontSize:'0.9375rem', fontWeight:700, color:'var(--rose-dark)', margin:0 }}>Step 3 — Profile Links (Optional)</h2>
            <p style={{ fontSize:'0.72rem', color:'var(--rose-secondary)', margin:0 }}>
              These override or add links in your generated resume. Leave blank to use links found in your uploaded resume.
            </p>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          {[
            ['linkedin', 'LinkedIn URL', 'linkedin.com/in/yourprofile'],
            ['github',   'GitHub URL',   'github.com/yourusername'],
            ['leetcode', 'LeetCode URL', 'leetcode.com/yourprofile'],
            ['codechef', 'CodeChef URL', 'codechef.com/users/yourusername'],
            ['medium',   'Medium URL',   'medium.com/@yourprofile'],
          ].map(([key, label, ph]) => (
            <div key={key} style={{ display:'flex', flexDirection:'column', gap:'0.375rem' }}>
              <label style={{ fontSize:'0.72rem', fontWeight:600, color:'var(--rose-secondary)' }}>{label}</label>
              <input value={links[key]} onChange={e => setLink(key, e.target.value)}
                placeholder={ph} className="rose-input" />
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'12px', padding:'1rem', color:'#dc2626', fontSize:'0.875rem' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display:'flex', gap:'0.875rem', alignItems:'center' }}>
        <button onClick={handleGenerate} disabled={loading} className="btn-primary"
          style={{ padding:'0.9rem 2.5rem', fontSize:'0.95rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          {loading ? (
            <>
              <svg style={{ width:16, height:16 }} className="animate-spin" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity:0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path  style={{ opacity:0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Generating Tailored Resume…
            </>
          ) : (
            <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> Generate Tailored Resume</>
          )}
        </button>
        <button onClick={handleReset} className="btn-secondary" style={{ padding:'0.9rem 1.75rem' }}>Reset</button>
      </div>

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
              <p style={{ fontSize:'0.78rem', color:'var(--rose-secondary)' }}>Your resume is tailored for the target role. Preview below or download.</p>
            </div>
            <button onClick={handleDownload} className="btn-primary" style={{ padding:'0.6rem 1.5rem', fontSize:'0.875rem', flexShrink:0 }}>
              ⬇ Download PDF
            </button>
          </div>

          <div className="rose-card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'0.875rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--rose-warm)', borderBottom:'1px solid var(--rose-border)' }}>
              <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--rose-dark)' }}>Resume Preview — JD Tailored</span>
              <button onClick={handleDownload} style={{ fontSize:'0.78rem', color:'var(--rose-accent)', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>Download →</button>
            </div>
            <iframe src={pdfUrl} title="JD Resume Preview" style={{ width:'100%', height:'85vh', border:'none', display:'block' }} />
          </div>
        </div>
      )}
    </div>
  );
}
