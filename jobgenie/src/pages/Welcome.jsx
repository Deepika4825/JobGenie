import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="text-center max-w-xl w-full">
        <div className="flex justify-center mb-8">
          <Logo size={90} />
        </div>
        <p className="text-gray-600 text-lg leading-relaxed mb-2">
          Your AI-powered career assistant that analyzes resumes and provides smart job recommendations.
        </p>
        <p className="text-gray-500 text-base mb-10">
          Get instant ATS scores, job matches, and personalized suggestions to land your ideal job.
        </p>
        <button onClick={() => navigate('/login')}
          className="px-12 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:bg-indigo-700 transition-all text-lg">
          Get Started
        </button>
      </div>
    </div>
  );
}
