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

      {/* Profile completion banner */}
      {profileIncomplete && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👤</span>
            <div>
              <p className="text-sm font-semibold text-indigo-700">Complete your profile for better job matches</p>
              <p className="text-xs text-gray-500 mt-0.5">Add your education, interests, and experience to get personalized recommendations.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="flex-shrink-0 bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
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
            {/* Extracted Skills */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2"><span>⚡</span> Extracted Skills</span>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">{data.skills.length} found</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((s, i) => (
                  <span key={i} className="bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full border border-indigo-200">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center justify-between">
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
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{s}</span><span>Beginner</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${15 + i * 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>🤖</span> AI Resume Insights
              <span className="ml-auto text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-medium">AI Powered</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.suggestions.map((tip, i) => (
                <div key={i} className="flex gap-3 bg-purple-50 border border-purple-100 rounded-xl p-4">
                  <span className="text-purple-500 font-bold text-sm mt-0.5 flex-shrink-0">{i + 1}.</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!analyzed && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <p className="text-6xl mb-4">🤖</p>
          <p className="font-semibold text-gray-700 text-lg">Upload your resume to get started</p>
          <p className="text-sm text-gray-500 mt-2">ATS score, extracted skills, skill gaps, and AI feedback — all in one place.</p>
        </div>
      )}
    </div>
  );
}
