export default function ScoreCard({ score }) {
  const num   = parseInt(score) || 0;
  const color = num >= 75 ? '#22c55e' : num >= 50 ? '#f59e0b' : '#ef4444';
  const label = num >= 75 ? 'Excellent' : num >= 50 ? 'Needs Improvement' : 'Low Compatibility';
  const r = 52, circ = 2 * Math.PI * r;
  const offset = circ - (num / 100) * circ;

  return (
    <div className="rose-card" style={{ padding:'1.5rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.25rem' }}>
        <div className="er-icon-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <h2 style={{ fontSize:'0.9375rem', fontWeight:700, color:'var(--rose-dark)' }}>ATS Score</h2>
      </div>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'1.25rem' }}>
        <div style={{ position:'relative', width:'144px', height:'144px' }}>
          <svg style={{ width:'100%', height:'100%', transform:'rotate(-90deg)' }} viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="var(--rose-border)" strokeWidth="10" />
            <circle cx="60" cy="60" r={r} fill="none" stroke={color}
              strokeWidth="10" strokeDasharray={circ} strokeDashoffset={offset}
              strokeLinecap="round" style={{ transition:'stroke-dashoffset 1s ease' }} />
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:'2rem', fontWeight:800, color, lineHeight:1 }}>{num}</span>
            <span style={{ fontSize:'0.72rem', color:'var(--rose-secondary)', fontWeight:500 }}>/ 100</span>
          </div>
        </div>
        <span style={{ marginTop:'0.625rem', fontSize:'0.875rem', fontWeight:600, color }}>{label}</span>
      </div>
      <div style={{ height:'6px', borderRadius:'99px', background:'var(--rose-border)', overflow:'hidden' }}>
        <div style={{ height:'100%', borderRadius:'99px', width:`${num}%`, background:color, transition:'width 1s ease' }} />
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.7rem', color:'var(--rose-secondary)', marginTop:'0.375rem' }}>
        <span>0</span><span>50</span><span>100</span>
      </div>
    </div>
  );
}
