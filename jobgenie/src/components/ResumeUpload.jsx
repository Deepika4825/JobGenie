import { useState, useRef } from 'react';
import Card from './Card';

export default function ResumeUpload({ onAnalyze, loading }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') setFile(f);
    else alert('Please upload a PDF file.');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = () => {
    if (!file) return alert('Please select a PDF resume first.');
    onAnalyze(file);
  };

  return (
    <Card title="Upload Resume" icon="📄">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
        }`}
      >
        <p className="text-4xl mb-2">📁</p>
        {file ? (
          <p className="text-sm font-medium text-indigo-600">{file.name}</p>
        ) : (
          <p className="text-sm text-gray-500">Drag & drop your PDF here, or click to browse</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading || !file}
        className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Analyzing...' : 'Analyze Resume'}
      </button>
    </Card>
  );
}
