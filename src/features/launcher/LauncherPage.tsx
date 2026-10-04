import { useEffect, useRef } from 'react';
import StorageGuard from '../../components/StorageGuard';
import type { CSSProperties, RefObject } from 'react';
import { Link } from 'react-router-dom';
import { CarFront, ChevronRight, Compass, Landmark, MonitorSmartphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import CinematicScene from '../../components/CinematicScene';
import EmberField from '../../components/EmberField';
import FilmGrain from '../../components/FilmGrain';
import TiltCard from '../../components/TiltCard';
import CursorGlow from '../../components/CursorGlow';
import OrnamentDivider from '../../components/Ornament';

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
      {/* living dusk backdrop, oversized so parallax never reveals edges */}
      <div ref={sceneRef} className="absolute -inset-8" aria-hidden="true">
        <CinematicScene mood="dusk" className="h-full w-full" />
      </div>
      {/* drifting ember dust above the photograph */}
      <EmberField />
      <div className="absolute inset-0 bg-gradient-to-b from-night/70 via-transparent to-night/85" aria-hidden="true" />
      <FilmGrain />
      <CursorGlow />

      <div className="relative mx-auto flex min-h-dvh max-w-3xl flex-col px-5 pb-12 pt-14 md:pt-20">
        <div ref={headRef}>
          <div className="rise" style={rise('0s')}>
            <h1 className="sheen-text text-ember mt-4 text-center font-display text-[3.6rem] font-bold leading-none md:text-7xl">
              Yatra Mitra
            </h1>
            <OrnamentDivider light className="mx-auto mt-8 w-56" />
          </div>
        </div>

        <div ref={cardsRef} className="mt-8">
          <div className="rise grid grid-cols-1 gap-4 sm:grid-cols-2" style={rise('0.3s')}>
            {ENTRIES.map((e) => {
              const Icon = e.icon;
              return (
                <TiltCard key={e.to} className="h-full" max={7}>
                  <Link
                    to={e.to}
                    className="glass group flex h-full items-center gap-4 rounded-card p-4 transition-colors duration-300 hover:border-saffron/60"
                  >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-gradient-to-br from-saffron to-[#c96f06] text-ink shadow-glow transition group-hover:scale-105">
                      <Icon size={26} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-xl font-bold text-cream">{e.title}</span>
                      <span className="mt-0.5 block truncate text-sm text-cream/60">{e.desc}</span>
                    </span>
                    <ChevronRight
                      size={20}
                      aria-hidden="true"
                      className="shrink-0 text-cream/40 transition group-hover:translate-x-1 group-hover:text-saffron"
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
