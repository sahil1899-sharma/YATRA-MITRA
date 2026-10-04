import { useEffect, useRef } from 'react';

// Animated cinematic backdrop — a living valley scene in two moods:
// dawn (maroon-to-saffron sunrise, birds, sun glitter) and dusk (deep indigo
// dusk, moon, flickering diyas on the water, fireflies). Pure canvas 2D, no
// assets, no dependencies. Respects prefers-reduced-motion (one still frame).
export type SceneMood = 'dawn' | 'dusk';

interface Palette {
  sky: [string, string, string, string];
  hill: string;
  fort: string;
  river: [string, string, string];
  celestial: string;
  celestialGlow: string;
  mote: string;
  bird: string;
}

const PALETTES: Record<SceneMood, Palette> = {
  dawn: {
    sky: ['#260e17', '#7A1F2B', '#c25a1e', '#E8890C'],
    hill: 'rgba(43, 16, 25, 0.6)',
    fort: 'rgba(24, 9, 14, 0.88)',
    river: ['#431824', '#5c1f2a', '#180a10'],
    celestial: '#ffdfae',
    celestialGlow: '255, 200, 120',
    mote: '255, 216, 155',
    bird: 'rgba(22, 8, 13, 0.75)',
  },
  dusk: {
    sky: ['#0b0612', '#2c1020', '#6e2a1e', '#b45a24'],
    hill: 'rgba(16, 7, 14, 0.75)',
    fort: 'rgba(10, 4, 9, 0.94)',
    river: ['#1d0d18', '#2a1220', '#0b060d'],
    celestial: '#f2e6cf',
    celestialGlow: '220, 210, 190',
    mote: '255, 200, 130',
    bird: 'rgba(10, 5, 10, 0.6)',
  },
};

interface Mote {
  x: number;
  y: number;
  r: number;
  speed: number;
  alpha: number;
  twinkle: number;
}

export default function CinematicScene({
  className = '',
  mood = 'dawn',
}: {
  className?: string;
  mood?: SceneMood;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const g: CanvasRenderingContext2D = ctx;

    const pal = PALETTES[mood];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const motes: Mote[] = Array.from({ length: mood === 'dusk' ? 60 : 42 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.8 + Math.random() * 2.1,
      speed: 0.0004 + Math.random() * 0.0011,
      alpha: (mood === 'dusk' ? 0.4 : 0.25) + Math.random() * 0.5,
      twinkle: Math.random() * Math.PI * 2,
    }));

    const birds =
      mood === 'dawn'
        ? [
            { off: 0.1, y: 0.2, s: 1, sp: 0.016 },
            { off: 0.55, y: 0.14, s: 0.75, sp: 0.013 },
            { off: 0.8, y: 0.26, s: 0.9, sp: 0.019 },
          ]
        : [{ off: 0.35, y: 0.18, s: 0.8, sp: 0.011 }];

    const diyas = [0.07, 0.19, 0.31, 0.43, 0.55, 0.67, 0.79, 0.91];

    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove);

    const fract = (n: number) => n - Math.floor(n);

    function draw(t: number) {
      const time = t / 1000;
      mx += (tx - mx) * 0.045;
      my += (ty - my) * 0.045;
      const hz = h * 0.62;
      const u = Math.min(w, h) / 100;
      const breathe = 0.5 + 0.5 * Math.sin(time * 0.12);

      // sky
      const sky = g.createLinearGradient(0, 0, 0, hz);
      sky.addColorStop(0, pal.sky[0]);
      sky.addColorStop(0.45, pal.sky[1]);
      sky.addColorStop(0.78, pal.sky[2]);
      sky.addColorStop(1, pal.sky[3]);
      g.fillStyle = sky;
      g.fillRect(0, 0, w, hz + 1);

      // sun / moon + halo (slow breathing glow)
      const cx = mood === 'dawn' ? w * 0.68 + mx * 9 : w * 0.3 + mx * 7;
      const cy = mood === 'dawn' ? hz - h * 0.09 + my * 5 : h * 0.16 + my * 4;
      const cr = Math.min(w, h) * (mood === 'dawn' ? 0.07 : 0.05);
      const haloA = mood === 'dawn' ? 0.5 + breathe * 0.12 : 0.3 + breathe * 0.06;
      const halo = g.createRadialGradient(cx, cy, 0, cx, cy, cr * 5.5);
      halo.addColorStop(0, `rgba(${pal.celestialGlow}, ${haloA.toFixed(3)})`);
      halo.addColorStop(0.45, `rgba(${pal.celestialGlow}, ${(haloA * 0.45).toFixed(3)})`);
      halo.addColorStop(1, `rgba(${pal.celestialGlow}, 0)`);
      g.fillStyle = halo;
      g.fillRect(cx - cr * 5.5, cy - cr * 5.5, cr * 11, cr * 11);
      g.fillStyle = pal.celestial;
      g.beginPath();
      g.arc(cx, cy, cr, 0, Math.PI * 2);
      g.fill();

      // drifting mist
      const mistX = (0.32 + 0.08 * Math.sin(time * 0.06)) * w + mx * 14;
      const mist = g.createRadialGradient(mistX, hz - 8, 0, mistX, hz - 8, w * 0.32);
      mist.addColorStop(0, 'rgba(255, 222, 175, 0.12)');
      mist.addColorStop(1, 'rgba(255, 222, 175, 0)');
      g.fillStyle = mist;
      g.fillRect(0, 0, w, hz);

      // far hills
      g.fillStyle = pal.hill;
      g.beginPath();
      g.moveTo(0, hz);
      for (let x = 0; x <= w; x += 10) {
        const y =
          hz -
          h * 0.045 * (0.6 + 0.4 * Math.sin(x * 0.008 + 1.7)) -
          h * 0.018 * Math.sin(x * 0.021 + 0.5);
        g.lineTo(x + mx * 7, y);
      }
      g.lineTo(w, hz);
      g.closePath();
      g.fill();

      // distant fort silhouette (decorative)
      const fx = w * 0.2 + mx * 11;
      const fy = hz - h * 0.052;
      g.fillStyle = pal.fort;
      g.fillRect(fx - 20 * u, fy - 9 * u, 40 * u, 9 * u);
      for (let i = 0; i < 6; i++) {
        g.fillRect(fx - 20 * u + i * 7 * u, fy - 12 * u, 4 * u, 3 * u);
      }
      g.fillRect(fx - 5 * u, fy - 20 * u, 10 * u, 11 * u);
      g.beginPath();
      g.arc(fx, fy - 20 * u, 7 * u, Math.PI, 0);
      g.fill();
      g.fillRect(fx - 0.8 * u, fy - 32 * u, 1.6 * u, 6 * u);
      g.fillStyle = '#E8890C';
      g.globalAlpha = 0.85;
      g.beginPath();
      g.arc(fx + 14 * u, fy - 4.5 * u, 1.7 * u, 0, Math.PI * 2);
      g.arc(fx - 8 * u, fy - 4.5 * u, 1.7 * u, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;

      // river
      const rv = g.createLinearGradient(0, hz, 0, h);
      rv.addColorStop(0, pal.river[0]);
      rv.addColorStop(0.4, pal.river[1]);
      rv.addColorStop(1, pal.river[2]);
      g.fillStyle = rv;
      g.fillRect(0, hz, w, h - hz);

      // glitter path on water
      g.save();
      g.beginPath();
      g.rect(0, hz, w, h - hz);
      g.clip();
      const glitterCol = mood === 'dawn' ? '255, 206, 140' : '235, 225, 205';
      for (let i = 0; i < 24; i++) {
        const f = i / 24;
        const yy = hz + 5 + f * (h - hz - 10);
        const half = 4 + f * 52;
        const xx = cx + Math.sin(time * 0.85 + i * 2.1) * half * 0.32;
        const ww = (3 + f * 30) * (0.72 + 0.28 * Math.sin(time * 2.1 + i * 3.3));
        const glowA = 0.1 + f * 0.32;
        g.fillStyle = `rgba(${glitterCol}, ${glowA.toFixed(3)})`;
        g.fillRect(xx - ww / 2, yy, ww, 1.7);
      }

      // dusk diyas flickering on the water — sized to read as small lamps
      // at any canvas size, so the full-screen backdrop stays magical.
      if (mood === 'dusk') {
        const ds = Math.min(w / 400, 1.6);
        for (let i = 0; i < diyas.length; i++) {
          const dx = diyas[i] * w + Math.sin(time * 0.5 + i * 2.4) * 6;
          const dy = hz + 10 + (i % 3) * ((h - hz - 24) / 3);
          const flick = 0.7 + 0.3 * Math.sin(time * 7 + i * 2.8) * Math.sin(time * 3.1 + i);
          g.fillStyle = `rgba(255, 190, 110, ${(0.16 * flick).toFixed(3)})`;
          g.beginPath();
          g.ellipse(dx, dy + 4 * ds, 9 * ds, 16 * flick * ds, 0, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = '#c96a1c';
          g.beginPath();
          g.ellipse(dx, dy, 7 * ds, 3 * ds, 0, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = '#ffd166';
          g.beginPath();
          g.ellipse(dx, dy - 5 * ds * flick, 2.6 * ds, 4.6 * ds * flick, 0, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = `rgba(255, 180, 100, ${(0.22 * flick).toFixed(3)})`;
          g.fillRect(dx - 1.5 * ds, dy + 4 * ds, 3 * ds, (h - dy - 6) * 0.5);
        }
      }
      g.restore();

      // birds
      g.strokeStyle = pal.bird;
      g.lineWidth = Math.max(1.2, 1.6 * u);
      g.lineCap = 'round';
      for (const b of birds) {
        const bx = (fract(b.off + time * b.sp) * 1.4 - 0.2) * w;
        const by = h * b.y + Math.sin(time * 2 + b.off * 20) * 4;
        const s = 8 * b.s * u;
        const flap = Math.sin(time * 9 + b.off * 30) * s * 0.28;
        g.beginPath();
        g.moveTo(bx - s, by);
        g.quadraticCurveTo(bx - s * 0.45, by - s * 0.75 - flap, bx, by);
        g.quadraticCurveTo(bx + s * 0.45, by - s * 0.75 - flap, bx + s, by);
        g.stroke();
      }

      // fireflies / dust motes
      for (const p of motes) {
        let yy = (p.y - time * p.speed) % 1;
        if (yy < 0) yy += 1;
        const tw = 0.5 + 0.5 * Math.sin(time * 2.3 + p.twinkle);
        g.fillStyle = `rgba(${pal.mote}, ${(p.alpha * tw).toFixed(3)})`;
        g.beginPath();
        g.arc(p.x * w + mx * 13, yy * h + my * 8, p.r, 0, Math.PI * 2);
        g.fill();
      }

      // cinematic vignette
      const vg = g.createRadialGradient(
        w / 2,
        h / 2,
        Math.min(w, h) * 0.35,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.78,
      );
      vg.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vg.addColorStop(1, 'rgba(12, 4, 8, 0.44)');
      g.fillStyle = vg;
      g.fillRect(0, 0, w, h);
    }

    if (reduced) {
      draw(9000);
    } else {
      const loop = (t: number) => {
        draw(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, [mood]);

  return <canvas ref={ref} className={`block ${className}`} aria-hidden="true" />;
}
