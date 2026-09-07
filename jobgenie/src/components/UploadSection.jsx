import { useState, useRef } from 'react';

export default function UploadSection({ onAnalyze, loading }) {
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const ref = useRef();

  const pick = f => {
    if (f?.type === 'application/pdf') setFile(f);
    else alert('Please upload a PDF file.');
  };

  return (
    <div className="rose-card">
      <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'1rem' }}>
        <div className="er-icon-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <h2 style={{ fontSize:'1rem', fontWeight:700, color:'var(--rose-dark)' }}>Upload Resume</h2>
      </div>

      <div className={`upload-zone${drag?' drag-over':''}${file?' has-file':''}`}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
        onClick={() => ref.current.click()}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.625rem' }}>
          {file ? (
            <>
              <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:'var(--rose-warm)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--rose-border)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--rose-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--rose-secondary)' }}>{file.name}</p>
              <p style={{ fontSize:'0.72rem', color:'var(--rose-secondary)', opacity:0.65 }}>Click to change</p>
            </>
          ) : (
            <>
              <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:'rgba(142,69,133,0.08)', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(142,69,133,0.15)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--rose-accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p style={{ fontSize:'0.9rem', fontWeight:600, color:'var(--rose-dark)' }}>Drop your resume here</p>
              <p style={{ fontSize:'0.75rem', color:'var(--rose-secondary)' }}>or click to browse &nbsp;·&nbsp; PDF only</p>
            </>
          )}
        </div>
        <input ref={ref} type="file" accept=".pdf" style={{ display:'none' }} onChange={e => pick(e.target.files[0])} />
      </div>

      <button onClick={() => { if (!file) return alert('Select a PDF first.'); onAnalyze(file); }}
        disabled={loading || !file} className="btn-primary"
        style={{ width:'100%', marginTop:'1rem', padding:'0.875rem' }}>
        {loading ? (
          <>
            <svg className="animate-spin" style={{ width:16,height:16 }} fill="none" viewBox="0 0 24 24">
              <circle style={{opacity:0.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path style={{opacity:0.8}} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Analyzing…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Analyze Resume
          </>
        )}
      </button>
    </div>
  );
}
