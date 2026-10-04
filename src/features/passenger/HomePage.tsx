import type { CSSProperties } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, ShieldCheck } from 'lucide-react';
import { SEED_CIRCUITS } from '../../data/seed';
import { GUARANTEE_CARD_TEXT } from '../../data/constants';
import { fitsReturnGuarantee } from '../../lib/returnGuarantee';
import { formatTime } from '../../lib/format';
import SectionTitle from '../../components/SectionTitle';
import OrnamentDivider from '../../components/Ornament';
import CinematicScene from '../../components/CinematicScene';
import TiltCard from '../../components/TiltCard';
import Marquee from '../../components/Marquee';
import CursorGlow from '../../components/CursorGlow';
import Reveal from '../../components/Reveal';
import CircuitCard from './components/CircuitCard';

const SCAM_SHIELD = ['Verified drivers', 'One fixed fare', 'Digital receipt'];

const rise = (d: string) => ({ '--d': d }) as CSSProperties;

function isHHMM(v: string | null): v is string {
  return v !== null && /^\d{2}:\d{2}$/.test(v);
}

export default function HomePage() {
  const [params] = useSearchParams();
  const rawDep = params.get('departure');
  const departure = isHHMM(rawDep) ? rawDep : null;

  const fitMark = (circuitId: string): 'fits' | 'unfit' | null => {
    if (!departure) return null;
    const c = SEED_CIRCUITS.find((x) => x.id === circuitId);
    if (!c) return null;
    const fits = c.slots.some((s) => fitsReturnGuarantee(s, c.durationMin, departure).fits);
    return fits ? 'fits' : 'unfit';
  };

  return (
    <div className="bg-jaali-dark">
      <CursorGlow />

      {/* cinematic chapter band */}
      <div className="relative overflow-hidden md:rounded-[24px]">
        <CinematicScene className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-night/30" />
        <div className="relative px-4 pb-8 pt-10 md:px-8 md:pb-12 md:pt-16">
          <p className="rise text-[11px] font-bold uppercase tracking-[0.26em] text-saffron text-ember" style={rise('0s')}>
            Yatra Mitra presents
          </p>
          <h2
            className="rise text-ember mt-2 font-display text-[2.4rem] font-bold leading-[1.05] text-cream md:text-6xl"
            style={rise('0.1s')}
          >
            Choose your
            <br />
            chapter
          </h2>
          <p className="rise mt-3 max-w-xs text-sm leading-relaxed text-cream/80 md:max-w-md md:text-base" style={rise('0.2s')}>
            Three story-led circuits across Jammu. Fixed fares, verified drivers, no bargaining —
            land in Jammu, and a verified friend is waiting.
          </p>
        </div>
      </div>

      {/* the promise, rolling */}
      <Marquee
        className="border-y border-white/10 bg-maroon/40 text-cream/85 backdrop-blur-sm"
        items={['No bargaining', 'No surprise stops', 'No commission shopping']}
      />

      <div className="px-4 py-6 md:px-2">
        <div className="rise glass flex items-center justify-between gap-2 rounded-card px-3 py-3" style={rise('0.28s')}>
          {SCAM_SHIELD.map((t) => (
            <span key={t} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <ShieldCheck size={15} aria-hidden="true" className="text-verified" />
              {t}
            </span>
          ))}
        </div>

        <div className="mt-8">
          <SectionTitle title="Heritage circuits" subtitle="Fixed fares. Verified drivers." />
          {departure ? (
            <div className="rise mb-4 rounded-card border border-verified/40 bg-verified/10 px-4 py-3" style={rise('0.05s')}>
              <p className="text-sm font-semibold text-emerald-300">
                Showing circuits that fit your departure
              </p>
              <p className="mt-0.5 text-xs text-cream/60">
                Departure {formatTime(departure)} — circuits marked Fits have at least one slot
                that gets you back 45 minutes before.
              </p>
            </div>
          ) : null}
          <div className="md:grid md:grid-cols-2 md:gap-6 xl:grid-cols-3">
            {SEED_CIRCUITS.map((c, i) => (
              <Reveal key={c.id} delay={0.08 + i * 0.12}>
                <TiltCard className="h-full" max={8}>
                  <CircuitCard circuit={c} index={i} fitMark={fitMark(c.id)} />
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>

        <OrnamentDivider light className="my-8 opacity-70" />

        <Reveal delay={0.1}>
        <div className="grad-ring relative mt-6 rounded-card p-6 pt-7 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-card" aria-hidden="true">
            <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-saffron/20 blur-3xl" />
          </div>
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-0 flex h-9 w-9 -translate-x-1/2 translate-y-[-50%] items-center justify-center rounded-full bg-gradient-to-br from-saffron to-[#c96f06] text-sm font-bold text-ink shadow-glow"
          >
            <Check size={18} aria-hidden="true" />
          </span>
          <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-saffron/90">
            Printed in every vehicle
          </p>
          <p className="mt-3 text-center font-display text-[19px] italic leading-relaxed text-cream">
            “{GUARANTEE_CARD_TEXT}”
          </p>
        </div>
        </Reveal>

        <div className="h-4" />
      </div>
    </div>
  );
}
