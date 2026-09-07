import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #f5eef5 0%, #fff 50%, #f7f0ee 100%)' }}>
      <div className="text-center max-w-xl w-full">
        <div className="flex justify-center mb-8">
          <Logo size={90} />
        </div>
        <p className="text-lg leading-relaxed mb-2" style={{ color: '#4A4A4A' }}>
          Your career assistant that analyzes resumes and provides smart job recommendations.
        </p>
        <p className="text-base mb-10" style={{ color: '#996666' }}>
          Get instant ATS scores, job matches, and personalized suggestions to land your ideal job.
        </p>
        <button onClick={() => navigate('/login')}
          className="px-12 py-3 text-white rounded-xl font-semibold shadow-lg transition-all text-lg"
          style={{ background: '#8E4585' }}
          onMouseEnter={e => e.target.style.background = '#7a3a72'}
          onMouseLeave={e => e.target.style.background = '#8E4585'}>
          Get Started
        </button>
      </div>
    </div>
  );
}
