export default function Avatar({ avatar, name, size = 'md', className = '' }) {
  const dim = { sm: 36, md: 44, lg: 96 }[size] || 44;
  const fs  = { sm: 12, md: 14, lg: 32 }[size] || 14;

  const initials = (name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const isPhoto  = avatar?.startsWith('data:');

  return (
    <div className={className} style={{
      width: dim, height: dim, borderRadius: '50%',
      overflow: 'hidden', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: fs, color: 'white',
      background: isPhoto ? 'transparent' : 'linear-gradient(135deg, var(--rose-accent), var(--rose-secondary))',
      boxShadow: `0 0 0 2px var(--rose-primary), 0 0 0 3.5px white`,
    }}>
      {isPhoto
        ? <img src={avatar} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        : <span>{initials}</span>
      }
    </div>
  );
}
