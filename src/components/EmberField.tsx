import { useEffect, useRef } from 'react';

interface Mote {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  tw: number;
  hue: number;
}

// A whisper of warm dust drifting up through the light — soft bokeh embers,
// deliberately subtle so the photographic backdrop stays the hero. Canvas 2D,
// no assets. Renders one still frame under prefers-reduced-motion.
export default function EmberField({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const motes: Mote[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      motes.length = 0;
      const n = Math.min(48, Math.floor((w * h) / 26000));
      for (let i = 0; i < n; i++) {
        motes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 1 + Math.random() * 2.6,
          vx: (Math.random() - 0.5) * 0.12,
          vy: -(0.08 + Math.random() * 0.22),
          a: 0.05 + Math.random() * 0.13,
          tw: Math.random() * Math.PI * 2,
          hue: 24 + Math.random() * 18,
        });
      }
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        const twinkle = 0.6 + 0.4 * Math.sin(t / 900 + m.tw);
        const alpha = m.a * twinkle;
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 4);
        g.addColorStop(0, `hsla(${m.hue}, 95%, 62%, ${alpha.toFixed(3)})`);
        g.addColorStop(1, `hsla(${m.hue}, 95%, 62%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (t: number) => {
      for (const m of motes) {
        m.x += m.vx;
        m.y += m.vy;
        if (m.y < -12) {
          m.y = h + 10;
          m.x = Math.random() * w;
        }
        if (m.x < -12) m.x = w + 10;
        else if (m.x > w + 12) m.x = -10;
      }
      draw(t);
      raf = requestAnimationFrame(step);
    };

    const onResize = () => {
      resize();
      seed();
    };

    resize();
    seed();
    if (reduced) {
      draw(0);
      return;
    }
    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}
