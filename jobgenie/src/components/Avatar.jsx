export default function Avatar({ avatar, name, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-24 h-24 text-3xl',
  };
  const rings = {
    sm: 'ring-2 ring-indigo-400 ring-offset-1',
    md: 'ring-2 ring-indigo-400 ring-offset-1',
    lg: 'ring-4 ring-indigo-500 ring-offset-2',
  };

  const initials = (name || 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const isPhoto  = avatar?.startsWith('data:');

  return (
    <div className={`${sizes[size]} ${rings[size]} rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white ${className}`}>
      {isPhoto
        ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
        : <span>{initials}</span>
      }
    </div>
  );
}
