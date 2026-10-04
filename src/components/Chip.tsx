import type { ReactNode } from 'react';

export default function Chip({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-medium text-cream/85 backdrop-blur-sm ${className}`}
    >
      {children}
    </span>
  );
}
