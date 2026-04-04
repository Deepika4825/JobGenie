import { useResume } from '../context/ResumeContext';

export default function Skills() {
  const { data } = useResume();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Detected skills */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>⚡</span> Detected Skills
          <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">{data.skills.length} found</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, i) => (
            <span key={i} className="bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full border border-indigo-200">
              ✓ {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Skill gaps */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span>🔍</span> Missing Skills
          <span className="ml-auto text-xs bg-red-100 text-red-500 px-2 py-1 rounded-full">{data.skill_gaps.length} gaps</span>
        </h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {data.skill_gaps.map((skill, i) => (
            <span key={i} className="bg-red-50 text-red-600 text-sm font-medium px-4 py-1.5 rounded-full border border-red-200">
              ✗ {skill}
            </span>
          ))}
        </div>

        {/* Progress bars */}
        <div className="space-y-3">
          {data.skill_gaps.map((skill, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{skill}</span>
                <span>Beginner</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-red-400 h-2 rounded-full"
                  style={{ width: `${15 + i * 8}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
        <span className="text-2xl">💡</span>
        <p className="text-sm text-amber-800">
          Focus on closing these skill gaps through online courses, personal projects, or certifications to improve your ATS score and job match rate.
        </p>
      </div>
    </div>
  );
}
