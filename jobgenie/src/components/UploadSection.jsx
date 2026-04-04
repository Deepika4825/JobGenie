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
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>📄</span> Upload Resume
      </h2>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
        onClick={() => ref.current.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          drag ? 'border-indigo-500 bg-indigo-50'
          : file ? 'border-green-400 bg-green-50'
          : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
        }`}
      >
        <p className="text-4xl mb-2">{file ? '✅' : '📁'}</p>
        {file
          ? <p className="text-sm font-semibold text-green-600">{file.name}</p>
          : <p className="text-sm text-gray-500">Drag & drop your PDF here, or click to browse</p>}
        <input ref={ref} type="file" accept=".pdf" className="hidden"
          onChange={(e) => pick(e.target.files[0])} />
      </div>
      <button
        onClick={() => { if (!file) return alert('Select a PDF first.'); onAnalyze(file); }}
        disabled={loading || !file}
        className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg transition-all flex items-center justify-center gap-2"
      >
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
