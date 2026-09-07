export default function Avatar({ avatar, name, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-24 h-24 text-3xl',
  };

  const initials = (name || 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const isPhoto  = avatar?.startsWith('data:');

  return (
    <div
      className={`${sizes[size]} rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-white ${className}`}
      style={{
        background: isPhoto ? 'transparent' : 'linear-gradient(135deg, var(--rose-purple), var(--rose-secondary))',
        boxShadow: '0 0 0 2px var(--rose-primary), 0 0 0 3px white',
      }}>
      {isPhoto
        ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
        : <span>{initials}</span>
      }
    </div>
  );
}
