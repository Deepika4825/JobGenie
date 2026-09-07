import { useState, useRef } from 'react';

export default function UploadSection({ onAnalyze, loading }) {
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const ref = useRef();

  const pick = (f) => {
    if (f?.type === 'application/pdf') setFile(f);
    else alert('Please upload a PDF file.');
  };

  return (
    <div className="rose-card">
      <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--rose-dark)' }}>
        <span>📄</span> Upload Resume
      </h2>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
        onClick={() => ref.current.click()}
        className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
        style={{
          borderColor: drag ? 'var(--rose-purple)' : file ? 'var(--rose-secondary)' : 'var(--rose-primary)',
          background:  drag ? 'var(--rose-light)' : file ? 'var(--rose-warm)' : 'transparent',
        }}>
        <p className="text-4xl mb-2">{file ? '✅' : '📁'}</p>
        {file
          ? <p className="text-sm font-semibold" style={{ color: 'var(--rose-secondary)' }}>{file.name}</p>
          : <p className="text-sm" style={{ color: 'var(--rose-secondary)' }}>Drag & drop your PDF here, or click to browse</p>}
        <input ref={ref} type="file" accept=".pdf" className="hidden"
          onChange={(e) => pick(e.target.files[0])} />
      </div>
      <button
        onClick={() => { if (!file) return alert('Select a PDF first.'); onAnalyze(file); }}
        disabled={loading || !file}
        className="btn-primary mt-4 w-full flex items-center justify-center gap-2">
        {loading ? (
          <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg> Analyzing...</>
        ) : '🔍 Analyze Resume'}
      </button>
    </div>
  );
}
