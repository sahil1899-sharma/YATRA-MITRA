import type { CircuitId } from '../types';

// Cinematic banner art per circuit — pure inline SVG, no external assets.
// Decorative scenes only; no factual claims beyond what the circuit contains
// (ropeway cable for C1, temple silhouettes for C2, river diyas for C6).
function DawnRopeway() {
  return (
    <g>
      <defs>
        <linearGradient id="c1sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3d1220" />
          <stop offset="0.55" stopColor="#b34a1f" />
          <stop offset="1" stopColor="#E8890C" />
        </linearGradient>
      </defs>
      <rect width="400" height="190" fill="url(#c1sky)" />
      <circle cx="292" cy="118" r="46" fill="#ffce8c" opacity="0.35" />
      <circle cx="292" cy="118" r="24" fill="#ffe3ae" />
      <path d="M0 190 L0 140 Q100 108 200 132 T400 128 L400 190 Z" fill="#3a0f18" opacity="0.55" />
      {/* ropeway cable + gliding cabins */}
      <line x1="0" y1="46" x2="400" y2="76" stroke="#200a12" strokeWidth="3.5" />
      <line x1="0" y1="58" x2="400" y2="88" stroke="#200a12" strokeWidth="2" opacity="0.55" />
      <rect x="120" y="52" width="7" height="34" fill="#200a12" opacity="0.8" />
      <rect x="318" y="66" width="7" height="40" fill="#200a12" opacity="0.8" />
      <g className="animate-cabin-a">
        <line x1="0" y1="0" x2="0" y2="16" stroke="#200a12" strokeWidth="2.5" />
        <rect x="-20" y="16" width="40" height="24" rx="5" fill="#200a12" />
        <rect x="-14" y="21" width="28" height="10" rx="2" fill="#ffd9a0" opacity="0.85" />
      </g>
      <g className="animate-cabin-b" style={{ animationDelay: '-8s' }}>
        <line x1="0" y1="0" x2="0" y2="16" stroke="#200a12" strokeWidth="2.5" />
        <rect x="-20" y="16" width="40" height="24" rx="5" fill="#2c101a" />
        <rect x="-14" y="21" width="28" height="10" rx="2" fill="#ffd9a0" opacity="0.7" />
      </g>
      <path d="M0 190 L0 168 Q140 150 260 164 T400 162 L400 190 Z" fill="#200a12" opacity="0.85" />
      <g stroke="#200a12" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.8">
        <path d="M52 44 q7 -8 14 0 q7 -8 14 0" />
        <path d="M96 30 q6 -7 12 0 q6 -7 12 0" />
      </g>
    </g>
  );
}

function HeritageNoon() {
  return (
    <g>
      <defs>
        <linearGradient id="c2sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5c1a28" />
          <stop offset="0.6" stopColor="#c96a1c" />
          <stop offset="1" stopColor="#f0b44e" />
        </linearGradient>
      </defs>
      <rect width="400" height="190" fill="url(#c2sky)" />
      <circle cx="84" cy="52" r="20" fill="#ffe9c4" opacity="0.95" />
      <g fill="#33101b" opacity="0.9">
        <path d="M52 160 L52 118 L60 118 L60 102 L68 102 L68 84 L76 84 L76 62 L84 62 L84 84 L92 84 L92 102 L100 102 L100 118 L108 118 L108 160 Z" />
        <rect x="80" y="46" width="8" height="18" />
        <path d="M196 160 L196 128 L204 128 L204 114 L212 114 L212 96 L220 96 L220 78 L228 78 L228 96 L236 96 L236 114 L244 114 L244 128 L252 128 L252 160 Z" />
        <path d="M300 160 L300 134 L308 134 L308 122 L316 122 L316 106 L324 106 L324 122 L332 122 L332 134 L340 134 L340 160 Z" />
      </g>
      {/* bazaar awnings */}
      <g>
        <path d="M0 160 q20 -16 40 0 q20 -16 40 0 q20 -16 40 0 q20 -16 40 0 q20 -16 40 0 q20 -16 40 0 q20 -16 40 0 q20 -16 40 0 q20 -16 40 0 q20 -16 40 0 L400 190 L0 190 Z" fill="#E8890C" />
        <path d="M0 160 q20 -16 40 0 q20 -16 40 0 q20 -16 40 0 q20 -16 40 0 q20 -16 40 0 L200 176 L200 190 L0 190 Z" fill="#FFF8EC" opacity="0.85" />
        <path d="M200 160 q20 -16 40 0 q20 -16 40 0 q20 -16 40 0 q20 -16 40 0 q20 -16 40 0 L400 176 L400 190 L200 190 Z" fill="#7A1F2B" opacity="0.9" />
      </g>
      <g stroke="#33101b" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.7">
        <path d="M300 44 q7 -8 14 0 q7 -8 14 0" />
      </g>
      {/* light sweep drifting across the bazaar */}
      <rect x="0" y="0" width="46" height="190" fill="#fff3d9" opacity="0.10" className="animate-shimmer" />
    </g>
  );
}

function DuskAarti() {
  const diyas = [
    { x: 60, y: 132 },
    { x: 128, y: 144 },
    { x: 196, y: 130 },
    { x: 262, y: 146 },
    { x: 328, y: 134 },
  ];
  return (
    <g>
      <defs>
        <linearGradient id="c6sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#150810" />
          <stop offset="0.55" stopColor="#4a1626" />
          <stop offset="1" stopColor="#a03d1c" />
        </linearGradient>
        <linearGradient id="c6water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#33141f" />
          <stop offset="1" stopColor="#120710" />
        </linearGradient>
      </defs>
      <rect width="400" height="190" fill="url(#c6sky)" />
      <circle cx="330" cy="42" r="14" fill="#f5e8d0" opacity="0.85" />
      <path d="M0 190 L0 128 Q120 112 220 124 T400 122 L400 190 Z" fill="#2a0e18" opacity="0.7" />
      <rect y="120" width="400" height="70" fill="url(#c6water)" />
      {diyas.map((d, i) => (
        <g key={i}>
          <ellipse cx={d.x} cy={d.y + 16} rx="5" ry="14" fill="#E8890C" opacity="0.22" />
          <ellipse cx={d.x} cy={d.y} rx="8" ry="3.4" fill="#c96a1c" />
          <ellipse cx={d.x} cy={d.y - 1} rx="6" ry="2.4" fill="#E8890C" />
          <circle cx={d.x} cy={d.y - 8} r="7" fill="#ffce7a" opacity="0.35" />
          <path
            d={`M${d.x} ${d.y - 14} q4.5 6 0 11 q-4.5 -5 0 -11`}
            fill="#ffd166"
            className="animate-flicker"
            style={{ animationDelay: `${(i * 0.33).toFixed(2)}s`, transformOrigin: `${d.x}px ${d.y - 3}px`, transformBox: 'view-box' }}
          />
        </g>
      ))}
      <g stroke="#E8890C" strokeWidth="2" opacity="0.4" strokeLinecap="round">
        <path d="M40 168 q20 -6 40 0" />
        <path d="M220 176 q20 -6 40 0" />
      </g>
    </g>
  );
}

export default function CircuitBanner({
  circuitId,
  className = '',
}: {
  circuitId: CircuitId;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 190"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label="Circuit artwork"
    >
      {circuitId === 'C1' ? <DawnRopeway /> : circuitId === 'C2' ? <HeritageNoon /> : <DuskAarti />}
    </svg>
  );
}
