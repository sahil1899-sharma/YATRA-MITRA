import type { CSSProperties, ReactNode } from 'react';

export default function Card({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`glass rounded-card p-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
