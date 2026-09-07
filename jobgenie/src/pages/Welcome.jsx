import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, var(--rose-light) 0%, var(--rose-bg) 50%, var(--rose-warm) 100%)' }}>
      <div className="text-center max-w-xl w-full">
        <div className="flex justify-center mb-8">
          <Logo size={90} />
        </div>
        <p className="text-lg leading-relaxed mb-2" style={{ color: 'var(--rose-dark)' }}>
          Your career assistant that analyzes resumes and provides smart job recommendations.
        </p>
        <p className="text-base mb-10" style={{ color: 'var(--rose-secondary)' }}>
          Get instant ATS scores, job matches, and personalized suggestions to land your ideal job.
        </p>
        <button onClick={() => navigate('/login')} className="btn-primary text-lg px-12">
          Get Started
        </button>
      </div>
    </div>
  );
}
