export default function ScoreCard({ score }) {
  const num    = parseInt(score) || 0;
  const color  = num >= 75 ? '#22c55e' : num >= 50 ? '#f59e0b' : '#ef4444';
  const label  = num >= 75 ? 'Excellent' : num >= 50 ? 'Needs Improvement' : 'Low Compatibility';
  const r = 52, circ = 2 * Math.PI * r;
  const offset = circ - (num / 100) * circ;

  return (
    <div className="rose-card">
      <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--rose-dark)' }}>
        <span>🎯</span> ATS Score
      </h2>
      <div className="flex flex-col items-center mb-4">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="var(--rose-border)" strokeWidth="10" />
            <circle cx="60" cy="60" r={r} fill="none" stroke={color}
              strokeWidth="10" strokeDasharray={circ} strokeDashoffset={offset}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold" style={{ color }}>{num}</span>
            <span className="text-xs font-medium" style={{ color: 'var(--rose-secondary)' }}>/ 100</span>
          </div>
        </div>
        <span className="mt-2 text-sm font-semibold" style={{ color }}>{label}</span>
      </div>
      <div className="w-full rounded-full h-2" style={{ background: 'var(--rose-border)' }}>
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${num}%`, background: color }} />
      </div>
      <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--rose-secondary)' }}>
        <span>0</span><span>50</span><span>100</span>
      </div>
    </div>
  );
}
