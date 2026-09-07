import { useState, useRef } from 'react';
import { useResume } from '../context/ResumeContext';
import { useProfile } from '../context/ProfileContext';

const LOCATIONS = [
  'India','Bangalore, Karnataka','Mumbai, Maharashtra','Hyderabad, Telangana',
  'Chennai, Tamil Nadu','Pune, Maharashtra','Delhi, Delhi',
  'Noida, Uttar Pradesh','Gurgaon, Haryana','Kolkata, West Bengal',
  'Ahmedabad, Gujarat','Jaipur, Rajasthan','Kochi, Kerala',
  'Coimbatore, Tamil Nadu','Indore, Madhya Pradesh','Remote',
];
const EXPERIENCE = ['Fresher','Intern','1-2 years','3-5 years','5+ years'];
const DOMAINS = [
  '','Data Science','Machine Learning','Web Development','Mobile Development',
  'Cloud Computing','DevOps','Cybersecurity','UI/UX Design','Full Stack',
  'Backend','Frontend','AI/ML','Product Management',
];

function matchStyle(pct) {
  if (pct >= 80) return { bar:'#22c55e', text:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' };
  if (pct >= 70) return { bar:'#f59e0b', text:'#d97706', bg:'#fffbeb', border:'#fde68a' };
  return               { bar:'#ef4444', text:'#dc2626', bg:'#fef2f2', border:'#fecaca' };
}

function getMatch(baseScore, index) {
  const offsets = [7, 0, -6, -10, -14, -18];
  return Math.min(99, Math.max(40, (parseInt(baseScore) || 70) + (offsets[index] ?? -18)));
}

/* SVG upload icon — themed rose */
function UploadIcon({ size = 40, color = 'var(--er-purple)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill="var(--er-purple-tint)" />
      <path d="M24 30V18M24 18l-5 5M24 18l5 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 34h20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M34 26a8 8 0 10-15.31-3.2" stroke="var(--er-rose)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function CheckIcon({ color = 'var(--er-mauve)' }) {
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
      <rect width="42" height="42" rx="10" fill="var(--er-warm-tint)" />
      <path d="M13 21l6 6 10-12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function Jobs() {
  const { jobsData, jobsLoading, jobsAnalyzed, analyzeForJobs, jobsError } = useResume();
  const { addNotification, profile } = useProfile();
  const notifiedRef = useRef(false);

  const [file, setFile]         = useState(null);
  const [drag, setDrag]         = useState(false);
  const [location, setLocation] = useState('India');
  const [experience, setExp]    = useState('');
  const [domain, setDomain]     = useState('');
  const fileRef = useRef();

  const pick = (f) => { if (f?.type === 'application/pdf') setFile(f); else alert('PDF only'); };

  const handleSubmit = async () => {
    if (!file) return alert('Please select a PDF resume first.');
    await analyzeForJobs(file, { location, experience, domain });
  };

  if (jobsAnalyzed && jobsData && !notifiedRef.current) {
    notifiedRef.current = true;
    const name = profile.name ? `, ${profile.name.split(' ')[0]}` : '';
    (jobsData.recommended_jobs || []).slice(0, 3).forEach((job, i) => {
      const match = getMatch(jobsData.resume_score, i);
      setTimeout(() => addNotification(`${match}% match${name} — ${job.role} at ${job.company}!`), i * 400);
    });
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }} className="space-y-6">

      {/* ── Preferences Card ───────────────────────────────────── */}
      <div className="rose-card-premium space-y-6">

        {/* Card heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'var(--er-purple-tint)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', flexShrink: 0,
          }}>🎯</div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--er-dark)', margin: 0 }}>Job Preferences</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--er-mauve)', margin: 0 }}>Tell us what you're looking for</p>
          </div>
        </div>

        <hr className="er-divider" />

        {/* Three dropdowns */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1.25rem' }}>
          {/* Location */}
          <div>
            <label className="rose-label">
              <span style={{ color: 'var(--er-purple)', marginRight: '4px' }}>◉</span> Location
            </label>
            <select className="rose-select" value={location} onChange={(e) => setLocation(e.target.value)}>
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="rose-label">
              <span style={{ color: 'var(--er-purple)', marginRight: '4px' }}>◉</span> Experience
            </label>
            <select className="rose-select" value={experience} onChange={(e) => setExp(e.target.value)}>
              <option value="">Any level</option>
              {EXPERIENCE.map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>

          {/* Domain */}
          <div>
            <label className="rose-label">
              <span style={{ color: 'var(--er-purple)', marginRight: '4px' }}>◉</span> Domain
            </label>
            <select className="rose-select" value={domain} onChange={(e) => setDomain(e.target.value)}>
              <option value="">Auto-detect</option>
              {DOMAINS.filter(Boolean).map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Upload zone */}
        <div>
          <label className="rose-label">
            <span style={{ color: 'var(--er-purple)', marginRight: '4px' }}>◉</span> Resume (PDF)
          </label>
          <div
            className={`upload-zone${drag ? ' drag-over' : ''}${file ? ' has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current.click()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem', position: 'relative', zIndex: 1 }}>
              {file ? <CheckIcon /> : <UploadIcon />}
              {file ? (
                <>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--er-mauve)', margin: 0 }}>{file.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--er-mauve)', opacity: 0.7, margin: 0 }}>Click to change file</p>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--er-dark)', margin: 0 }}>Drop your resume here</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--er-mauve)', margin: 0 }}>or click to browse · PDF only</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf" className="hidden"
              onChange={(e) => pick(e.target.files[0])} />
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleSubmit}
          disabled={jobsLoading || !file}
          className="btn-primary"
          style={{ width: '100%', fontSize: '0.95rem', padding: '0.875rem' }}>
          {jobsLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg className="animate-spin" style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Searching jobs in {location}…
            </span>
          ) : (
            <span>🔍 Find Jobs in {location}</span>
          )}
        </button>
      </div>

      {/* Error */}
      {jobsError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '1rem', padding: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>
          ⚠️ {jobsError}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────── */}
      {jobsAnalyzed && jobsData && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.25rem' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--er-mauve)', margin: 0 }}>
              <strong style={{ color: 'var(--er-purple)' }}>{(jobsData.recommended_jobs || []).length}</strong> positions found
              &nbsp;·&nbsp;{location}&nbsp;·&nbsp;{experience || 'All levels'}
            </p>
          </div>

          <div className="space-y-4">
            {(jobsData.recommended_jobs || []).map((job, i) => {
              const match = getMatch(jobsData.resume_score, i);
              const mc = matchStyle(match);
              return (
                <div key={i} className="er-job-card">
                  {/* Top row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.875rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--er-purple)', margin: 0 }}>{job.role}</h3>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 700,
                          padding: '0.2rem 0.65rem', borderRadius: '9999px',
                          color: mc.text, background: mc.bg, border: `1px solid ${mc.border}`,
                        }}>{match}% Match</span>
                      </div>
                      {job.company && (
                        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--er-mauve)', margin: '0.2rem 0 0' }}>
                          🏢 {job.company}
                        </p>
                      )}
                    </div>
                    {job.source && <span className="er-source-badge">via {job.source}</span>}
                  </div>

                  <hr className="er-divider" />

                  {/* Meta info */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.5rem', margin: '0.625rem 0' }}>
                    {job.location      && <span style={{ fontSize: '0.8rem', color: 'var(--er-mauve)' }}>📍 {job.location}</span>}
                    {job.work_type     && <span style={{ fontSize: '0.8rem', color: 'var(--er-mauve)' }}>{job.work_type === 'Remote' ? '🏠' : job.work_type === 'Hybrid' ? '🔄' : '🏢'} {job.work_type}</span>}
                    {job.employment_type && <span style={{ fontSize: '0.8rem', color: 'var(--er-mauve)' }}>⏰ {job.employment_type}</span>}
                    {job.posted        && <span style={{ fontSize: '0.8rem', color: 'var(--er-mauve)' }}>📅 {job.posted}</span>}
                  </div>

                  {/* Match bar */}
                  <div style={{ margin: '0.625rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--er-mauve)', fontWeight: 500 }}>Resume Match</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: mc.text }}>{match}%</span>
                    </div>
                    <div style={{ height: '5px', borderRadius: '99px', background: 'var(--er-border)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '99px', width: `${match}%`, background: mc.bar, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>

                  {/* Description */}
                  {job.description && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--er-mauve)', margin: '0.5rem 0 0.75rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {job.description}
                    </p>
                  )}

                  <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="btn-primary"
                    style={{ fontSize: '0.825rem', padding: '0.55rem 1.25rem', textDecoration: 'none' }}>
                    Apply Now →
                  </a>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Empty State ──────────────────────────────────────────── */}
      {!jobsAnalyzed && (
        <div style={{
          background: 'linear-gradient(145deg, var(--er-surface) 0%, var(--er-rose-tint) 100%)',
          borderRadius: '1.25rem',
          border: '1px solid var(--er-border)',
          padding: '4rem 2rem',
          textAlign: 'center',
          boxShadow: '0 2px 12px rgba(220,161,161,0.1)',
        }}>
          {/* Icon */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'var(--er-purple-tint)',
            border: '1.5px solid rgba(142,69,133,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem', fontSize: '2rem',
          }}>💼</div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--er-dark)', margin: '0 0 0.5rem' }}>
            Set your preferences and upload your resume
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--er-mauve)', margin: 0, maxWidth: '380px', marginInline: 'auto', lineHeight: 1.6 }}>
            We'll match your skills to real job openings based on your location and experience level.
          </p>
        </div>
      )}
    </div>
  );
}
