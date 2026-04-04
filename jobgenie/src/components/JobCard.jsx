export default function JobCard({ job }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md hover:border-indigo-200 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl flex-shrink-0">
          💼
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-sm leading-tight">{job.role}</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{job.description}</p>
        </div>
      </div>
      <a
        href={job.apply_link || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="text-center text-xs font-semibold bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Apply Now →
      </a>
    </div>
  );
}
