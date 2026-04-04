import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';

export default function Dashboard() {
  const { data, analyzed } = useResume();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const stats = [
    { label: 'ATS Score',    value: `${data.resume_score}/100`, icon: '🎯', color: 'text-indigo-600', bg: 'bg-indigo-50',  route: '/analyze' },
    { label: 'Skills Found', value: data.skills.length,         icon: '⚡', color: 'text-green-600',  bg: 'bg-green-50',   route: '/skills' },
    { label: 'Job Matches',  value: data.recommended_jobs.length, icon: '💼', color: 'text-blue-600', bg: 'bg-blue-50',    route: '/jobs' },
    { label: 'Skill Gaps',   value: data.skill_gaps.length,     icon: '🔍', color: 'text-red-500',   bg: 'bg-red-50',     route: '/skills' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">
          Welcome back, {user.name || 'there'} 👋
        </h2>
        <p className="text-indigo-100 text-sm">
          {analyzed
            ? 'Your resume has been analyzed. Check your results below.'
            : 'Upload your resume to get AI-powered insights and job recommendations.'}
        </p>
        {!analyzed && (
          <button
            onClick={() => navigate('/analyze')}
            className="mt-4 bg-white text-indigo-600 text-sm font-semibold px-5 py-2 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Analyze Resume →
          </button>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => navigate(s.route)}
            className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2 hover:shadow-md transition-shadow text-left"
          >
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-xl`}>
              {s.icon}
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 font-medium">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Quick sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top jobs */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><span>💼</span> Top Jobs</h3>
            <button onClick={() => navigate('/jobs')} className="text-xs text-indigo-600 hover:underline">View all</button>
          </div>
          <ul className="space-y-2">
            {data.recommended_jobs.slice(0, 3).map((job, i) => (
              <li key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-sm">💼</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">{job.role}</p>
                  <p className="text-xs text-gray-400 truncate max-w-xs">{job.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Skill gaps */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><span>🔍</span> Skill Gaps</h3>
            <button onClick={() => navigate('/skills')} className="text-xs text-indigo-600 hover:underline">View all</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.skill_gaps.map((s, i) => (
              <span key={i} className="bg-red-50 text-red-600 text-xs font-medium px-3 py-1 rounded-full border border-red-200">
                ✗ {s}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.skills.map((s, i) => (
              <span key={i} className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full border border-indigo-200">
                ✓ {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
