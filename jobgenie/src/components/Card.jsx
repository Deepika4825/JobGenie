export default function Card({ title, icon, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-md p-6 ${className}`}>
      {title && (
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
