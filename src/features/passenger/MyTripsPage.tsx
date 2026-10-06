import { Link } from 'react-router-dom';
import { SEED_CIRCUITS } from '../../data/seed';
import { formatINR, formatTime } from '../../lib/format';
import { useAppStore } from '../../store/useAppStore';
import SectionTitle from '../../components/SectionTitle';
import StatusPill from '../../components/StatusPill';
import Button from '../../components/Button';
import Reveal from '../../components/Reveal';

export default function MyTripsPage() {
  const trips = useAppStore((s) => s.trips);
  const mine = trips
    .filter((t) => t.passengerRef === 'guest')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="px-4 py-6 md:px-2">
      <SectionTitle title="My trips" subtitle="Your bookings as a guest" />

      {mine.length === 0 ? (
        <div className="glass mt-2 rounded-card p-6 text-center">
          <p className="text-sm text-cream/65">No trips yet. Your bookings will appear here.</p>
          <Link to="/p" className="mt-4 inline-block">
            <Button>Browse circuits</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {mine.map((t, i) => {
            const circuit = SEED_CIRCUITS.find((c) => c.id === t.circuitId);
            return (
              <Reveal key={t.id} delay={Math.min(i * 0.08, 0.4)}>
              <Link
                to={`/p/receipt/${t.id}`}
                className="glass card-lift block rounded-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg font-bold text-cream">
                      {circuit?.name ?? t.circuitId}
                    </p>
                    <p className="mt-0.5 text-xs text-cream/55">
                      {formatTime(t.slot)} · {t.partySize} traveller{t.partySize > 1 ? 's' : ''} ·{' '}
                      {formatINR(t.fare)}
                    </p>
                    <p className="mt-0.5 text-xs text-cream/40">{t.id}</p>
                  </div>
                  <StatusPill status={t.status} />
                </div>
              </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
