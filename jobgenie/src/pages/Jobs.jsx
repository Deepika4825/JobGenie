import { useState, useRef } from 'react';
import { useResume } from '../context/ResumeContext';
import { useProfile } from '../context/ProfileContext';

const LOCATIONS = [
  'India',
  'Bangalore, Karnataka', 'Mumbai, Maharashtra', 'Hyderabad, Telangana',
  'Chennai, Tamil Nadu', 'Pune, Maharashtra', 'Delhi, Delhi',
  'Noida, Uttar Pradesh', 'Gurgaon, Haryana', 'Kolkata, West Bengal',
  'Ahmedabad, Gujarat', 'Jaipur, Rajasthan', 'Kochi, Kerala',
  'Coimbatore, Tamil Nadu', 'Indore, Madhya Pradesh', 'Remote',
];
const EXPERIENCE = ['Fresher', 'Intern', '1-2 years', '3-5 years', '5+ years'];
const DOMAINS = [
  '', 'Data Science', 'Machine Learning', 'Web Development', 'Mobile Development',
  'Cloud Computing', 'DevOps', 'Cybersecurity', 'UI/UX Design', 'Full Stack',
  'Backend', 'Frontend', 'AI/ML', 'Product Management',
];

function matchColor(pct) {
  if (pct >= 80) return { bar: '#22c55e', text: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
  if (pct >= 70) return { bar: '#f59e0b', text: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  return           { bar: '#ef4444', text: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
}

function getMatch(baseScore, index) {
  const offsets = [7, 0, -6, -10, -14, -18];
  return Math.min(99, Math.max(40, (parseInt(baseScore) || 70) + (offsets[index] ?? -18)));
}

const sel = 'w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8E4585]';

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
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Preferences + Upload */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: '#4A4A4A' }}>
          <span>🎯</span> Job Preferences
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">📍 Location</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)} className={sel}>
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">⏰ Experience</label>
            <select value={experience} onChange={(e) => setExp(e.target.value)} className={sel}>
              <option value="">Any level</option>
              {EXPERIENCE.map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">💼 Domain</label>
            <select value={domain} onChange={(e) => setDomain(e.target.value)} className={sel}>
              <option value="">Auto-detect</option>
              {DOMAINS.filter(Boolean).map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">📄 Resume (PDF)</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current.click()}
            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
            style={{
              borderColor: drag ? '#8E4585' : file ? '#996666' : '#d1d5db',
              background:  drag ? '#f5eef5' : file ? '#f7f0ee' : 'white',
            }}>
            <p className="text-3xl mb-1">{file ? '✅' : '📁'}</p>
            {file
              ? <p className="text-sm font-semibold" style={{ color: '#996666' }}>{file.name}</p>
              : <p className="text-sm text-gray-500">Drag & drop or click to browse</p>}
            <input ref={fileRef} type="file" accept=".pdf" className="hidden"
              onChange={(e) => pick(e.target.files[0])} />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={jobsLoading || !file}
          className="w-full text-white py-3 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all flex items-center justify-center gap-2"
          style={{ background: '#8E4585' }}>
          {jobsLoading ? (
            <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg> Finding Jobs in {location}...</>
          ) : `🔍 Find Jobs in ${location}`}
        </button>
      </div>

      {jobsError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm">⚠️ {jobsError}</div>
      )}

      {/* Results */}
      {jobsAnalyzed && jobsData && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {(jobsData.recommended_jobs || []).length} jobs found · {location} · {experience || 'All levels'}
            </p>
          </div>

          <div className="space-y-4">
            {(jobsData.recommended_jobs || []).map((job, i) => {
              const match = getMatch(jobsData.resume_score, i);
              const color = matchColor(match);
              return (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold" style={{ color: '#4A4A4A' }}>{job.role}</h3>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
                          style={{ color: color.text, background: color.bg, borderColor: color.border }}>
                          {match}% Match
                        </span>
                      </div>
                      {job.company && (
                        <p className="text-sm font-medium mt-0.5" style={{ color: '#996666' }}>🏢 {job.company}</p>
                      )}
                    </div>
                    {job.source && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full border border-gray-200">
                        via {job.source}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 mb-3">
                    {job.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>📍</span><span>{job.location}</span>
                      </div>
                    )}
                    {job.work_type && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{job.work_type === 'Remote' ? '🏠' : job.work_type === 'Hybrid' ? '🔄' : '🏢'}</span>
                        <span>{job.work_type}</span>
                      </div>
                    )}
                    {job.employment_type && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>⏰</span><span>{job.employment_type}</span>
                      </div>
                    )}
                    {job.posted && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>📅</span><span>Posted: {job.posted}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Match Score</span>
                      <span className="font-semibold" style={{ color: color.text }}>{match}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${match}%`, background: color.bar }} />
                    </div>
                  </div>

                  {job.description && (
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-2">{job.description}</p>
                  )}

                  <a href={job.apply_link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all"
                    style={{ background: '#8E4585' }}>
                    Apply Now →
                  </a>
                </div>
              );
            })}
          </div>
        </>
      )}

      {!jobsAnalyzed && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-6xl mb-4">💼</p>
          <p className="font-semibold text-lg" style={{ color: '#4A4A4A' }}>Set your preferences and upload your resume</p>
          <p className="text-sm text-gray-500 mt-2">We'll find jobs matching your skills, location, and experience level.</p>
        </div>
      )}
    </div>
  );
}
