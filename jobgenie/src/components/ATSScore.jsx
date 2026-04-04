import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Card from './Card';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ATSScore({ score }) {
  const numScore = parseInt(score) || 0;

  const data = {
    datasets: [{
      data: [numScore, 100 - numScore],
      backgroundColor: ['#6366f1', '#e5e7eb'],
      borderWidth: 0,
      cutout: '75%',
    }],
  };

  const options = {
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    maintainAspectRatio: false,
  };

  const color = numScore >= 75 ? 'text-green-600' : numScore >= 50 ? 'text-yellow-500' : 'text-red-500';

  return (
    <Card title="ATS Score" icon="🎯">
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40">
          <Doughnut data={data} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${color}`}>{numScore}</span>
            <span className="text-xs text-gray-400">/ 100</span>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          {numScore >= 75 ? 'Great match!' : numScore >= 50 ? 'Needs improvement' : 'Low ATS compatibility'}
        </p>
      </div>
    </Card>
  );
}
