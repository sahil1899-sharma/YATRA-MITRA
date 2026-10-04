export default function OrnamentDivider({
  className = '',
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  const line = light ? 'to-cream/50' : 'to-maroon/40';
  return (
    <div aria-hidden="true" className={`flex items-center gap-3 ${className}`}>
      <span className={`h-px flex-1 bg-gradient-to-r from-transparent ${line}`} />
      <svg width="20" height="20" viewBox="0 0 20 20" className="shrink-0">
        <path
          d="M10 1l2.6 6.4L19 10l-6.4 2.6L10 19l-2.6-6.4L1 10l6.4-2.6z"
          fill="#E8890C"
          opacity="0.9"
        />
        <circle cx="10" cy="10" r="2.2" fill={light ? '#FFF8EC' : '#7A1F2B'} />
      </svg>
      <span className={`h-px flex-1 bg-gradient-to-l from-transparent ${line}`} />
    </div>
  );
}
