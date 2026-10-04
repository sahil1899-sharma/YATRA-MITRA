import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** stagger delay in seconds */
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li';
}

/**
 * Scroll-triggered reveal: fades + rises content into view the first time it
 * enters the viewport. Respects prefers-reduced-motion (shows immediately).
 */
export default function Reveal({ children, delay = 0, className = '', as = 'div' }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as as 'div';
  const style = { '--d': `${delay}s` } as CSSProperties;
  return (
    <Tag ref={ref} style={style} className={`reveal${visible ? ' reveal-in' : ''} ${className}`}>
      {children}
    </Tag>
  );
}
