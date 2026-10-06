import { useEffect, useRef } from 'react';
import StorageGuard from '../../components/StorageGuard';
import type { CSSProperties, RefObject } from 'react';
import { Link } from 'react-router-dom';
import { CarFront, ChevronRight, Compass, Landmark, MonitorSmartphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import EmberField from '../../components/EmberField';
import FilmGrain from '../../components/FilmGrain';
import TiltCard from '../../components/TiltCard';
import CursorGlow from '../../components/CursorGlow';
import OrnamentDivider from '../../components/Ornament';

// Video backgrounds respect reduced-motion: still poster frame instead.
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface Entry {
  to: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

const ENTRIES: Entry[] = [
  { to: '/p', title: "I'm a visitor", desc: 'Browse fixed-fare heritage circuits', icon: Compass },
  { to: '/d', title: "I'm a Mitra driver", desc: 'Trips, earnings and training', icon: CarFront },
  { to: '/k', title: 'Kiosk desk', desc: 'Assisted booking at Jammu Tawi', icon: MonitorSmartphone },
  { to: '/a', title: 'Tourism department', desc: 'Jammu Tourism Pulse dashboard', icon: Landmark },
];

const rise = (d: string) => ({ '--d': d }) as CSSProperties;

// Depth parallax: scene, headline and cards drift at different depths.
// Entrance (rise) animations live on inner wrappers so they never fight
// the parallax transform.
function useDepthParallax() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const place = (ref: RefObject<HTMLDivElement>, dx: number, dy: number) => {
      if (ref.current) {
        ref.current.style.transform = `translate3d(${(x * dx).toFixed(1)}px, ${(y * dy).toFixed(1)}px, 0)`;
      }
    };
    // The backdrop gets true 3D: it drifts like the rest, but also tips a few
    // degrees toward the pointer inside the page perspective.
    const placeScene = () => {
      if (sceneRef.current) {
        const rx = (-y * 2.4).toFixed(2);
        const ry = (x * 3.2).toFixed(2);
        sceneRef.current.style.transform =
          `translate3d(${(x * -18).toFixed(1)}px, ${(y * -12).toFixed(1)}px, 0) ` +
          `rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
    };
    const loop = () => {
      x += (tx - x) * 0.055;
      y += (ty - y) * 0.055;
      placeScene();
      place(headRef, 14, 10);
      place(cardsRef, -26, -18);
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return { sceneRef, headRef, cardsRef };
}

export default function LauncherPage() {
  const { sceneRef, headRef, cardsRef } = useDepthParallax();

  return (
    <main className="relative min-h-dvh overflow-hidden bg-night [perspective:1400px]">
      <StorageGuard />
      {/* living dusk backdrop — real motion, oversized so parallax never reveals edges */}
      <div ref={sceneRef} className="absolute -inset-8" aria-hidden="true">
        {prefersReducedMotion ? (
          <img src="/scenes/dusk.jpg" alt="" draggable={false} className="h-full w-full object-cover" />
        ) : (
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/scenes/dusk.jpg"
          >
            <source src="/video/launcher-bg.mp4" type="video/mp4" />
          </video>
        )}
      </div>
      {/* drifting ember dust above the photograph */}
      <EmberField />
      <div className="absolute inset-0 bg-gradient-to-b from-night/70 via-transparent to-night/85" aria-hidden="true" />
      <FilmGrain />
      <CursorGlow />

      <div className="relative mx-auto flex min-h-dvh max-w-3xl flex-col px-5 pb-12 pt-14 md:pt-20">
        <div ref={headRef}>
          <div className="rise" style={rise('0s')}>
            <p className="eyebrow mb-5 text-center">Jammu · Heritage circuits</p>
            <h1 className="sheen-text text-ember mt-4 text-center font-display text-[3.8rem] font-semibold leading-none tracking-tight md:text-8xl">
              Yatra Mitra
            </h1>
            <OrnamentDivider light className="mx-auto mt-8 w-56" />
          </div>
        </div>

        <div ref={cardsRef} className="mt-8">
          <div className="rise grid grid-cols-1 gap-4 sm:grid-cols-2" style={rise('0.3s')}>
            {ENTRIES.map((e, i) => {
              const Icon = e.icon;
              return (
                <TiltCard key={e.to} className="h-full" max={6}>
                  <Link
                    to={e.to}
                    className="glass group relative flex h-full items-center gap-5 overflow-hidden rounded-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-saffron/50 hover:shadow-[0_24px_60px_rgba(232,137,12,0.16)]"
                  >
                    <span
                      aria-hidden="true"
                      className="font-display pointer-events-none absolute -right-1 top-1 select-none text-[64px] font-semibold leading-none text-cream/[0.06] transition-colors duration-500 group-hover:text-saffron/10"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f2a63b] to-[#c96f06] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_20px_rgba(232,137,12,0.4)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[22px] font-semibold tracking-tight text-cream">
                        {e.title}
                      </span>
                      <span className="mt-1 block truncate text-sm text-cream/55">{e.desc}</span>
                    </span>
                    <ChevronRight
                      size={20}
                      aria-hidden="true"
                      className="shrink-0 text-cream/30 transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-saffron"
                    />
                  </Link>
                </TiltCard>
              );
            })}
          </div>
        </div>

        <footer className="rise mt-auto pt-10 text-center text-xs text-cream/50" style={rise('0.5s')}>
          Fixed fares · Verified drivers · No bargaining
        </footer>
      </div>
    </main>
  );
}
