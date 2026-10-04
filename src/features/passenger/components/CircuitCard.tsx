import { Link } from 'react-router-dom';
import { Clapperboard } from 'lucide-react';
import type { Circuit, CircuitId } from '../../../types';
import { formatINR, formatTime } from '../../../lib/format';
import Button from '../../../components/Button';
import Chip from '../../../components/Chip';
import CircuitBanner from '../../../components/CircuitBanner';

export function formatDuration(min: number): string {
  return `about ${Math.round(min / 60)} hrs`;
}

const CHAPTER: Record<CircuitId, string> = { C1: 'I', C2: 'II', C6: 'III' };

export default function CircuitCard({
  circuit,
  index = 0,
  fitMark = null,
}: {
  circuit: Circuit;
  index?: number;
  fitMark?: 'fits' | 'unfit' | null;
}) {
  const numeral = CHAPTER[circuit.id];

  return (
    <div className="glass card-lift group mb-5 overflow-hidden rounded-card shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
      <div className="relative overflow-hidden">
        <CircuitBanner
          circuitId={circuit.id}
          className="h-40 w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent" />
        <span className="absolute bottom-2.5 left-4 text-[11px] font-bold uppercase tracking-[0.24em] text-cream/95">
          Chapter {numeral}
        </span>
        <span
          aria-hidden="true"
          className="absolute -bottom-4 right-3 font-display text-[5rem] font-bold leading-none text-cream/15"
        >
          {numeral}
        </span>
        <span className="absolute left-4 top-3 rounded-full border border-saffron/30 bg-night/55 px-3 py-1 text-xs font-bold text-cream shadow-glow backdrop-blur-md">
          {formatINR(circuit.farePerPerson)} per person
        </span>
      </div>
      <div className="p-5 pt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-saffron">
            Circuit {index + 1} of 3
          </p>
          {fitMark === 'fits' ? (
            <span className="rounded-full border border-verified/50 bg-verified/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
              Fits your departure
            </span>
          ) : fitMark === 'unfit' ? (
            <span className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[11px] font-bold text-cream/50">
              Doesn't fit
            </span>
          ) : null}
        </div>
        <h3 className="mt-1 font-display text-[22px] font-bold text-cream">{circuit.name}</h3>
        <p className="mt-1 text-sm text-cream/60">{circuit.tagline}</p>

        {circuit.minParty > 1 ? (
          <p className="mt-1 text-xs text-cream/45">minimum {circuit.minParty} travellers</p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          <Chip>{formatDuration(circuit.durationMin)}</Chip>
          <Chip>{circuit.stopIds.length} stops</Chip>
          {circuit.eveningOnly ? <Chip>Evening only</Chip> : <Chip>Next slot {formatTime(circuit.slots[0])}</Chip>}
        </div>

        <Link
          to={`/p/circuit/${circuit.id}#film`}
          className="mt-3 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-saffron transition hover:text-amber-300"
        >
          <Clapperboard size={16} aria-hidden="true" />
          Watch the circuit film
        </Link>

        <Link to={`/p/circuit/${circuit.id}`} className="mt-4 block">
          <Button className="w-full">
            View circuit
          </Button>
        </Link>
      </div>
    </div>
  );
}
