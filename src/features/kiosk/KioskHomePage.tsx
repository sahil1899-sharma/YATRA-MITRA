import { useEffect, useState, type CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SEED_CIRCUITS } from '../../data/seed';
import { GUARANTEE_CARD_TEXT } from '../../data/constants';
import { formatINR } from '../../lib/format';
import { formatDuration } from '../../lib/kiosk';

const KIOSK_CIRCUITS = ['C1', 'C2', 'C6'];

const SERVICES = ['Lockers', 'Drinking water', 'Phone charging', 'First aid', 'Lost & found'];

export default function KioskHomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [started, setStarted] = useState(false);

  const resetToken = (location.state as { kioskIdleReset?: number } | null)?.kioskIdleReset;
  useEffect(() => {
    if (resetToken) setStarted(false);
  }, [resetToken]);

  if (!started) {
    return (
      <button
        type="button"
        onClick={() => setStarted(true)}
        className="flex min-h-[62dvh] w-full flex-col items-center justify-center rounded-card text-center"
        aria-label="Tap to begin"
      >
        <p className="font-display text-5xl font-bold leading-tight text-cream md:text-6xl">
          Welcome to Jammu.
          <br />
          <span className="text-saffron">A verified friend is waiting.</span>
        </p>
        <p className="mt-8 text-3xl text-cream/85">नमस्ते — शुरू करने के लिए कृपया टैप करें</p>
        <p className="mt-3 text-2xl text-cream/60">Namaste — please tap to begin</p>
        <span className="btn-shine animate-pulse-soft mt-10 inline-flex items-center gap-2 rounded-full border border-saffron/60 bg-saffron/15 px-8 py-4 text-xl font-bold text-saffron shadow-glow">
          Tap anywhere <ChevronRight size={22} aria-hidden="true" />
        </span>
      </button>
    );
  }

  const circuits = KIOSK_CIRCUITS.map((id) => SEED_CIRCUITS.find((c) => c.id === id)!).filter(Boolean);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-cream">Choose your circuit</h1>
        <p className="font-display text-xl font-bold text-saffron">One price. No bargaining.</p>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {circuits.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => navigate(`/k/book/${c.id}`)}
            className="rise flex items-center justify-between gap-6 rounded-card border border-white/12 bg-white/[0.05] px-6 py-4 text-left transition duration-300 hover:border-saffron/60 hover:bg-saffron/[0.07] hover:shadow-[0_14px_44px_rgba(0,0,0,0.45),0_0_24px_rgba(232,137,12,0.14)] active:scale-[0.99]"
            style={{ '--d': `${0.08 + i * 0.1}s` } as CSSProperties}
          >
            <span className="min-w-0">
              <span className="block truncate font-display text-2xl font-bold text-cream">
                {c.name}
              </span>
              <span className="mt-1 block text-base text-cream/60">
                {formatDuration(c.durationMin)} · {c.stopIds.length} stops
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-4">
              <span className="text-right">
                <span className="block font-display text-3xl font-bold text-saffron">
                  {formatINR(c.farePerPerson)}
                </span>
                <span className="block text-sm text-cream/55">per person · fixed</span>
              </span>
              <ChevronRight size={28} aria-hidden="true" className="text-cream/40" />
            </span>
          </button>
        ))}
      </div>

      <p className="mt-4 border-t border-white/10 pt-3 text-center text-sm italic leading-relaxed text-cream/55">
        “{GUARANTEE_CARD_TEXT}”
      </p>

      <div className="mt-3 flex items-center justify-center gap-3 rounded-card border border-white/10 bg-white/[0.03] px-4 py-2.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-saffron">
          Services at the Kendra
        </span>
        <span className="text-sm text-cream/65">{SERVICES.join(' · ')}</span>
      </div>
    </div>
  );
}
