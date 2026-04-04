export default function SuggestionCard({ suggestions }) {
  return (
    <div id="suggestions" className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>💡</span> Suggestions
      </h2>
      <ul className="space-y-3">
        {suggestions.map((tip, i) => (
          <li key={i} className="flex gap-3 items-start bg-amber-50 border border-amber-100 rounded-xl p-3">
            <span className="text-amber-500 font-bold text-sm mt-0.5">{i + 1}.</span>
            <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
