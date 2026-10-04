import { useEffect, useRef } from 'react';

// Living dusk sky for the launcher: distant bird flocks with real flap-glide
// flight, faint twinkling stars overhead, and — every so often — an
// illuminated ropeway cabin gliding across on its cable. Everything is drawn
// as small dark silhouettes with tiny warm lights, so it reads as real at a
// distance. Canvas 2D, no assets. One still frame under prefers-reduced-motion.

interface Bird {
  x: number;
  y: number;
  vx: number;
  size: number; // wingspan px
  phase: number;
  flapHz: number;
  gliding: boolean;
  modeT: number;
  bobP: number;
  alpha: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  tw: number;
}

interface Cabin {
  active: boolean;
  x: number;
  y: number;
  t: number;
  nextIn: number; // seconds until next run
}

const TAU = Math.PI * 2;

export default function SkyLife({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let flockTimer = 6; // seconds until next flock
    const birds: Bird[] = [];
    const stars: Star[] = [];
    const cabin: Cabin = { active: false, x: 0, y: 0, t: 0, nextIn: 12 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seedStars = () => {
      stars.length = 0;
      const n = Math.floor((w * h) / 26000);
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.36,
          r: 0.6 + Math.random() * 0.9,
          a: 0.08 + Math.random() * 0.3,
          tw: Math.random() * TAU,
        });
      }
    };

    const makeBird = (x: number, y: number, vx: number, depth: number): Bird => ({
      x,
      y,
      vx,
      size: 6 + depth * 11 + Math.random() * 3,
      phase: Math.random() * TAU,
      flapHz: 5 + Math.random() * 3,
      gliding: Math.random() < 0.35,
      modeT: 1 + Math.random() * 2.5,
      bobP: Math.random() * TAU,
      alpha: 0.5 + depth * 0.35,
    });

    const spawnFlock = () => {
      const dir = Math.random() < 0.6 ? 1 : -1; // mostly left-to-right
      const n = 5 + Math.floor(Math.random() * 5);
      const baseY = h * (0.1 + Math.random() * 0.26);
      const speed = (22 + Math.random() * 16) * dir;
      const depth = 0.25 + Math.random() * 0.55;
      const startX = dir === 1 ? -60 : w + 60;
      for (let i = 0; i < n; i++) {
        birds.push(
          makeBird(
            startX - dir * i * (20 + Math.random() * 34) - dir * Math.random() * 50,
            baseY + (Math.random() - 0.5) * 60,
            speed * (0.92 + Math.random() * 0.16),
            depth,
          ),
        );
      }
    };

    const spawnLoner = () => {
      const dir = Math.random() < 0.5 ? 1 : -1;
      birds.push(
        makeBird(dir === 1 ? -40 : w + 40, h * (0.08 + Math.random() * 0.3), (46 + Math.random() * 22) * dir, 0.85 + Math.random() * 0.15),
      );
    };

    const drawBird = (b: Bird) => {
      // Flap-glide cycle: wings beat in bursts, then lock nearly flat.
      const wingOpen = b.gliding ? 0.14 : 0.3 + 0.7 * Math.abs(Math.sin(b.phase));
      const s = b.size;
      const lift = (wingOpen - 0.28) * s * 0.42;
      ctx.strokeStyle = `rgba(10, 6, 9, ${b.alpha.toFixed(3)})`;
      ctx.lineWidth = Math.max(1, s * 0.085);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(b.x - s / 2, b.y - lift);
      ctx.quadraticCurveTo(b.x - s * 0.22, b.y + s * 0.07, b.x, b.y);
      ctx.quadraticCurveTo(b.x + s * 0.22, b.y + s * 0.07, b.x + s / 2, b.y - lift);
      ctx.stroke();
      ctx.fillStyle = `rgba(10, 6, 9, ${b.alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, s * 0.085, s * 0.05, 0, 0, TAU);
      ctx.fill();
    };

    const drawCabin = (t: number) => {
      if (!cabin.active) return;
      const sway = Math.sin(t / 900 + cabin.t) * 2.5;
      const y = cabin.y + sway;
      // Faint cable across the sky.
      ctx.strokeStyle = 'rgba(255, 244, 230, 0.09)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cabin.y - 26);
      ctx.lineTo(w, cabin.y - 26);
      ctx.stroke();
      // Hanger.
      ctx.strokeStyle = 'rgba(10, 6, 9, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cabin.x, cabin.y - 26);
      ctx.lineTo(cabin.x, y - 10);
      ctx.stroke();
      // Cabin body — dark silhouette.
      ctx.fillStyle = 'rgba(12, 7, 6, 0.92)';
      const bw = 30;
      const bh = 22;
      ctx.fillRect(cabin.x - bw / 2, y - 10, bw, bh);
      // Warm lit windows.
      ctx.save();
      ctx.shadowColor = 'rgba(255, 170, 80, 0.9)';
      ctx.shadowBlur = 7;
      ctx.fillStyle = '#ffc978';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(cabin.x - bw / 2 + 4 + i * 9, y - 6, 6, 9);
      }
      ctx.restore();
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const tw = 0.55 + 0.45 * Math.sin(t / 1400 + s.tw);
        ctx.fillStyle = `rgba(255, 246, 230, ${(s.a * tw).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, TAU);
        ctx.fill();
      }
      drawCabin(t);
      for (const b of birds) drawBird(b);
    };

    const step = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
      last = t;
      flockTimer -= dt;
      if (flockTimer <= 0) {
        if (Math.random() < 0.75) spawnFlock();
        else spawnLoner();
        flockTimer = 16 + Math.random() * 20;
      }
      cabin.nextIn -= dt;
      if (!cabin.active && cabin.nextIn <= 0) {
        cabin.active = true;
        cabin.x = -50;
        cabin.y = h * 0.16;
        cabin.t = t / 1000;
      }
      if (cabin.active) {
        cabin.x += 15 * dt;
        if (cabin.x > w + 60) {
          cabin.active = false;
          cabin.nextIn = 42 + Math.random() * 30;
        }
      }
      for (let i = birds.length - 1; i >= 0; i--) {
        const b = birds[i];
        b.modeT -= dt;
        if (b.modeT <= 0) {
          b.gliding = !b.gliding;
          b.modeT = b.gliding ? 1.4 + Math.random() * 2.4 : 1 + Math.random() * 2;
        }
        if (!b.gliding) b.phase += dt * b.flapHz * TAU;
        b.x += b.vx * dt;
        b.y += Math.sin(t / 1100 + b.bobP) * 7 * dt;
        if ((b.vx > 0 && b.x > w + 80) || (b.vx < 0 && b.x < -80)) birds.splice(i, 1);
      }
      draw(t);
      raf = requestAnimationFrame(step);
    };

    const onResize = () => {
      resize();
      seedStars();
    };

    resize();
    seedStars();
    spawnFlock(); // the sky is alive on first paint
    if (Math.random() < 0.7) spawnLoner();
    if (reduced) {
      draw(1200);
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
