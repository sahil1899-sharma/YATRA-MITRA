import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  /** final numeric value */
  value: number;
  /** format the animated value for display */
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}

/**
 * Animated number that counts up from 0 to `value` when first rendered.
 * Respects prefers-reduced-motion (jumps straight to the value).
 */
export default function CountUp({ value, format, duration = 1100, className = '' }: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return <span className={className}>{format ? format(display) : Math.round(display).toString()}</span>;
}
