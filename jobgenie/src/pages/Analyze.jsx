import { useResume } from '../context/ResumeContext';
import { useProfile } from '../context/ProfileContext';
import { useNavigate } from 'react-router-dom';
import UploadSection from '../components/UploadSection';
import ScoreCard from '../components/ScoreCard';

export default function Analyze() {
  const { data, loading, analyzed, analyze, error } = useResume();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const profileIncomplete = !profile.phone || !profile.college || !profile.jobTitle || profile.interests.length === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {profileIncomplete && (
        <div className="rounded-2xl p-4 flex items-center justify-between gap-4"
          style={{ background: 'var(--rose-light)', border: '1px solid var(--rose-primary)' }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">👤</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--rose-purple)' }}>Complete your profile for better job matches</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--rose-secondary)' }}>Add your education, interests, and experience to get personalized recommendations.</p>
            </div>
          </div>
          <button onClick={() => navigate('/profile')}
            className="btn-primary flex-shrink-0 text-xs px-4 py-2 whitespace-nowrap">
            Set Up Profile →
          </button>
        </div>
      )}

      <UploadSection onAnalyze={analyze} loading={loading} />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm">⚠️ {error}</div>
      )}

      {analyzed && (
        <>
          <ScoreCard score={data.resume_score} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rose-card">
              <h2 className="text-base font-semibold mb-4 flex items-center justify-between" style={{ color: 'var(--rose-dark)' }}>
                <span className="flex items-center gap-2"><span>⚡</span> Extracted Skills</span>
                <span className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ background: 'var(--rose-light)', color: 'var(--rose-purple)' }}>{data.skills.length} found</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((s, i) => (
                  <span key={i} className="rose-tag">✓ {s}</span>
                ))}
              </div>
            </div>

            <div className="rose-card">
              <h2 className="text-base font-semibold mb-4 flex items-center justify-between" style={{ color: 'var(--rose-dark)' }}>
                <span className="flex items-center gap-2"><span>🔍</span> Missing Skills</span>
                <span className="text-xs bg-red-100 text-red-500 px-2 py-1 rounded-full font-medium">{data.skill_gaps.length} gaps</span>
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {data.skill_gaps.map((s, i) => (
                  <span key={i} className="bg-red-50 text-red-600 text-sm font-medium px-4 py-1.5 rounded-full border border-red-200">
                    ✗ {s}
                  </span>
                ))}
              </div>
              <div className="space-y-3">
                {data.skill_gaps.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--rose-secondary)' }}>
                      <span>{s}</span><span>Beginner</span>
                    </div>
                    <div className="w-full rounded-full h-1.5" style={{ background: 'var(--rose-border)' }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${15 + i * 10}%`, background: 'var(--rose-primary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rose-card">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--rose-dark)' }}>
              <span>💡</span> Resume Insights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.suggestions.map((tip, i) => (
                <div key={i} className="flex gap-3 rounded-xl p-4"
                  style={{ background: 'var(--rose-warm)', border: '1px solid var(--rose-border)' }}>
                  <span className="font-bold text-sm mt-0.5 flex-shrink-0" style={{ color: 'var(--rose-secondary)' }}>{i + 1}.</span>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--rose-dark)' }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!analyzed && (
        <div className="rose-card p-12 text-center">
          <p className="text-6xl mb-4">📋</p>
          <p className="font-semibold text-lg" style={{ color: 'var(--rose-dark)' }}>Upload your resume to get started</p>
          <p className="text-sm mt-2" style={{ color: 'var(--rose-secondary)' }}>ATS score, extracted skills, skill gaps, and feedback — all in one place.</p>
        </div>
      )}
    </div>
  );
}
