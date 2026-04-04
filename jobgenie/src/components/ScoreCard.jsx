export default function ScoreCard({ score }) {
  const num = parseInt(score) || 0;
  const color    = num >= 75 ? '#10B981' : num >= 50 ? '#F59E0B' : '#EF4444';
  const label    = num >= 75 ? 'Excellent' : num >= 50 ? 'Needs Improvement' : 'Low Compatibility';
  const textCls  = num >= 75 ? 'text-green-500' : num >= 50 ? 'text-amber-500' : 'text-red-500';
  const barCls   = num >= 75 ? 'bg-green-500'   : num >= 50 ? 'bg-amber-400'   : 'bg-red-400';

  const r = 52, circ = 2 * Math.PI * r;
  const offset = circ - (num / 100) * circ;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>🎯</span> ATS Score
      </h2>
      <div className="flex flex-col items-center mb-4">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="#E5E7EB" strokeWidth="10" />
            <circle cx="60" cy="60" r={r} fill="none" stroke={color}
              strokeWidth="10" strokeDasharray={circ} strokeDashoffset={offset}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-extrabold ${textCls}`}>{num}</span>
            <span className="text-xs text-gray-400 font-medium">/ 100</span>
          </div>
        </div>
        <span className={`mt-2 text-sm font-semibold ${textCls}`}>{label}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-700 ${barCls}`} style={{ width: `${num}%` }} />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>0</span><span>50</span><span>100</span>
      </div>
    </div>
  );
}
