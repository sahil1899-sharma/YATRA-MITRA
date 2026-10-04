import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Power } from 'lucide-react';
import { SEED_CIRCUITS } from '../../data/seed';
import { formatINR, formatTime } from '../../lib/format';
import { useAppStore } from '../../store/useAppStore';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import StatusPill from '../../components/StatusPill';
import Reveal from '../../components/Reveal';
import CountUp from '../../components/CountUp';

const DAILY_TARGET = 1050;

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function payoutFor(circuitId: string): number {
  return SEED_CIRCUITS.find((c) => c.id === circuitId)?.driverPayout ?? 0;
}

export default function DriverTodayPage() {
  const navigate = useNavigate();
  const activeDriverMitraId = useAppStore((s) => s.activeDriverMitraId);
  const driver = useAppStore((s) => s.drivers.find((d) => d.mitraId === activeDriverMitraId));
  const trips = useAppStore((s) => s.trips);
  const setDriverOnline = useAppStore((s) => s.setDriverOnline);
  const setTripStatus = useAppStore((s) => s.setTripStatus);

  if (!driver) {
    return (
      <div className="p-4">
        <Card className="text-center">
          <h1 className="font-display text-xl font-bold text-cream">Choose your driver</h1>
          <p className="mt-2 text-sm text-cream/65">
            Sign in as a Mitra driver to see today's trips and earnings.
          </p>
        </Card>
      </div>
    );
  }

  const firstName = driver.name.split(' ')[0];
  const myTrips = trips.filter((t) => t.driverMitraId === driver.mitraId);
  const completedToday = myTrips.filter((t) => t.status === 'completed' && isToday(t.createdAt));
  const earnings = completedToday.reduce((sum, t) => sum + payoutFor(t.circuitId), 0);
  const pct = Math.min(100, Math.round((earnings / DAILY_TARGET) * 100));
  const queue = myTrips
    .filter((t) => t.status === 'driver_assigned' || t.status === 'accepted' || t.status === 'in_progress')
    .sort((a, b) => a.slot.localeCompare(b.slot));

  return (
    <div className="bg-jaali-dark px-4 pb-10 pt-6 md:px-2">
      {/* header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-saffron">Mitra Saarthi</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-cream">
            Namaste, {firstName}
          </h1>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={driver.online}
          aria-label={driver.online ? 'Go offline' : 'Go online'}
          onClick={() => setDriverOnline(driver.mitraId, !driver.online)}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition duration-300 ${
            driver.online
              ? 'border-verified/50 bg-verified/15 text-emerald-300 shadow-[0_0_18px_rgba(30,142,90,0.35)]'
              : 'border-white/15 bg-white/[0.05] text-cream/60'
          }`}
        >
          {driver.online ? <span className="pulse-dot" aria-hidden="true" /> : null}
          <Power size={15} aria-hidden="true" />
          {driver.online ? 'Online' : 'Offline'}
        </button>
      </div>
      {!driver.online ? (
        <p className="mt-2 text-xs text-cream/50">
          You're offline — new trip requests won't reach you until you go online.
        </p>
      ) : null}

      {/* earnings */}
      <Reveal delay={0.05}>
      <Card className="grad-ring mt-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold text-cream">Today's earnings</h2>
          <p className="font-display text-2xl font-bold text-saffron">
            <CountUp value={earnings} format={(n) => formatINR(Math.round(n))} />
          </p>
        </div>
        <div className="bar-shimmer mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-saffron to-[#c96f06] transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-cream/55">
          {formatINR(earnings)} of {formatINR(DAILY_TARGET)} daily target · {completedToday.length}{' '}
          trip{completedToday.length === 1 ? '' : 's'} completed
        </p>
        <p className="mt-2 border-t border-white/10 pt-2 text-xs text-cream/45">
          Reported street baseline: about ₹500–550 a day
        </p>
      </Card>
      </Reveal>

      {/* positioning prompt — static sample */}
      <Reveal delay={0.1}>
      <Card className="card-lift mt-4 border-saffron/30">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm font-bold text-cream">
            <MapPin size={16} className="text-saffron" aria-hidden="true" />
            Move to Jammu Tawi — 18:40 arrival in 25 min
          </p>
          <Badge variant="simulated">Demo</Badge>
        </div>
        <p className="mt-1.5 text-xs text-cream/50">
          Evening arrivals are building at the station kiosk. Positioning nearby lifts your chances
          of the next trip.
        </p>
      </Card>
      </Reveal>

      {/* trip queue */}
      <h2 className="mt-6 font-display text-xl font-bold text-cream">Trip queue</h2>
      {queue.length === 0 ? (
        <Card className="mt-3 text-center">
          <p className="text-sm text-cream/60">
            {driver.online
              ? 'No trips waiting. Stay near the station kiosk during arrival hours.'
              : 'You are offline. Go online to receive trip requests.'}
          </p>
        </Card>
      ) : (
        <div className="mt-3 flex flex-col gap-2.5">
          {queue.map((t, i) => {
            const circuit = SEED_CIRCUITS.find((c) => c.id === t.circuitId);
            return (
              <Reveal key={t.id} delay={Math.min(i * 0.08, 0.4)}>
              <Card className="card-lift !p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-bold text-cream">
                      {circuit?.name ?? t.circuitId}
                    </p>
                    <p className="mt-0.5 text-xs text-cream/55">
                      {formatTime(t.slot)} · {t.partySize} traveller{t.partySize === 1 ? '' : 's'}
                      {t.departureTime ? ` · leaves ${formatTime(t.departureTime)}` : ''}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <StatusPill status={t.status} />
                      {t.sakhiPreferred ? <Badge variant="sakhi">Sakhi</Badge> : null}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {t.status === 'driver_assigned' ? (
                    <Button onClick={() => setTripStatus(t.id, 'accepted')} className="flex-1">
                      Accept
                    </Button>
                  ) : null}
                  <Button
                    variant={t.status === 'driver_assigned' ? 'ghost' : 'primary'}
                    onClick={() => navigate(`/d/trip/${t.id}`)}
                    className="flex-1"
                  >
                    Open
                  </Button>
                </div>
              </Card>
              </Reveal>
            );
          })}
        </div>
      )}

      <Link to="/d/earnings" className="mt-4 inline-block text-sm font-semibold text-saffron hover:underline">
        View earnings breakdown →
      </Link>
    </div>
  );
}
