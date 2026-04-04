import { createContext, useContext, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function callAPI(file, prefs = {}) {
  const formData = new FormData();
  formData.append('file', file);
  if (prefs.location)   formData.append('location',   prefs.location);
  if (prefs.experience) formData.append('experience', prefs.experience);
  if (prefs.domain)     formData.append('domain',     prefs.domain);
  // Pass user_id so analysis gets saved to DB
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.id) formData.append('user_id', user.id);
  const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Server error');
  return json;
}

const ResumeContext = createContext(null);

export function ResumeProvider({ children }) {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [error, setError]       = useState('');

  const [jobsData, setJobsData]         = useState(null);
  const [jobsLoading, setJobsLoading]   = useState(false);
  const [jobsAnalyzed, setJobsAnalyzed] = useState(false);
  const [jobsError, setJobsError]       = useState('');

  const analyze = async (file) => {
    setLoading(true);
    setError('');
    try {
      const json = await callAPI(file);
      setData(json);
      setAnalyzed(true);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeForJobs = async (file, prefs = {}) => {
    setJobsLoading(true);
    setJobsError('');
    try {
      const json = await callAPI(file, prefs);
      setJobsData(json);
      setJobsAnalyzed(true);
    } catch (e) {
      console.error(e);
      setJobsError(e.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setJobsLoading(false);
    }
  };

  return (
    <ResumeContext.Provider value={{
      data, loading, analyzed, analyze, error,
      jobsData, jobsLoading, jobsAnalyzed, analyzeForJobs, jobsError,
    }}>
      {children}
    </ResumeContext.Provider>
  );
}

export const useResume = () => useContext(ResumeContext);
