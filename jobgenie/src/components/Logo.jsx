export default function Logo({ size = 32, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cloud shape */}
        <path d="M75 38 C75 28 67 20 57 20 C54 20 51 21 49 23 C46 17 40 13 33 13 C22 13 13 22 13 33 C13 34 13 35 13 36 C8 38 5 43 5 48 C5 55 11 60 18 60 L75 60 C83 60 89 54 89 46 C89 41 83 38 75 38Z"
          fill="#4F46E5" />
        <path d="M55 32 C55 25 49 20 42 20 C35 20 29 25 29 32 C29 33 29 34 30 35 L68 35 C67 33 55 33 55 32Z"
          fill="#9333EA" />
        {/* Search circle */}
        <circle cx="44" cy="52" r="10" stroke="white" strokeWidth="4" fill="none" />
        {/* Search handle */}
        <line x1="51" y1="59" x2="60" y2="68" stroke="white" strokeWidth="4" strokeLinecap="round" />
        {/* Left lines */}
        <line x1="18" y1="52" x2="32" y2="52" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="18" y1="58" x2="30" y2="58" stroke="white" strokeWidth="3" strokeLinecap="round" />
        {/* Right lines */}
        <line x1="58" y1="52" x2="72" y2="52" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="62" y1="58" x2="72" y2="58" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-extrabold text-indigo-600 tracking-wide" style={{ fontSize: size * 0.45 }}>
            JOB GENIE
          </span>
          <span className="font-semibold text-purple-600 tracking-widest" style={{ fontSize: size * 0.22 }}>
            HIRE SMARTER
          </span>
        </div>
      )}
    </div>
  );
}
