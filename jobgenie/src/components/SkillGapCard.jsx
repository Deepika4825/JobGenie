export default function SkillGapCard({ skills, detectedSkills }) {
  return (
    <div id="skills" className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>🔍</span> Skill Analysis
      </h2>

      {detectedSkills?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Detected Skills</p>
          <div className="flex flex-wrap gap-2">
            {detectedSkills.map((skill, i) => (
              <span key={i} className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full border border-indigo-200">
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Missing Skills</p>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span key={i} className="bg-red-50 text-red-600 text-xs font-medium px-3 py-1 rounded-full border border-red-200">
              ✗ {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
