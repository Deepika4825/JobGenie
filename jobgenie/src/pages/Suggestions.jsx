import { useResume } from '../context/ResumeContext';

const ICONS = ['✍️', '🎨', '📜', '🎯'];

export default function Suggestions() {
  const { data } = useResume();

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <p className="text-sm text-gray-500">{data.suggestions.length} personalized tips to improve your resume</p>

      {data.suggestions.map((tip, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm p-5 flex gap-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            {ICONS[i % ICONS.length]}
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Tip {i + 1}</p>
            <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
          </div>
        </div>
      ))}

      {/* CTA */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white text-center">
        <p className="text-lg font-bold mb-1">Ready to improve?</p>
        <p className="text-indigo-100 text-sm mb-4">Apply these suggestions and re-analyze your resume to see your score improve.</p>
        <a
          href="/analyze"
          className="inline-block bg-white text-indigo-600 text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
        >
          Re-analyze Resume →
        </a>
      </div>
    </div>
  );
}
