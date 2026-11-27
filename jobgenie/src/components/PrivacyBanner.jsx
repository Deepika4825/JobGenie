/**
 * PrivacyBanner — Reviewer-requested privacy/consent disclosure
 * Shows once per session. Dismissed state stored in sessionStorage.
 * Uses existing rose design system. Does NOT modify any other component.
 */
import { useState } from 'react';

export default function PrivacyBanner() {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('jg_privacy_ok') === '1'
  );

  if (dismissed) return null;

  const accept = () => {
    sessionStorage.setItem('jg_privacy_ok', '1');
    setDismissed(true);
  };

  return (
    <div style={{
      background: 'var(--rose-warm)',
      border: '1px solid var(--rose-border)',
      borderRadius: '14px',
      padding: '0.875rem 1.25rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      marginBottom: '0.5rem',
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="var(--rose-secondary)" strokeWidth="2" strokeLinecap="round"
        strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--rose-dark)', margin: '0 0 3px' }}>
          Resume Data & Privacy Notice
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--rose-secondary)', margin: 0, lineHeight: 1.55 }}>
          Your uploaded resume is processed by a third-party AI service (Groq) to extract skills and generate scores.
          Resume text is <strong>not permanently stored</strong> — only the analysis result (score, skills, suggestions) is saved to your account.
          By uploading, you consent to this processing. Do not upload resumes containing highly sensitive personal information.
        </p>
      </div>
      <button onClick={accept}
        style={{ background: 'var(--rose-accent)', color: 'white', border: 'none',
                 borderRadius: '8px', padding: '0.375rem 0.875rem', fontSize: '0.75rem',
                 fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
        Got it
      </button>
    </div>
  );
}
