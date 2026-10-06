import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Share2 } from 'lucide-react';
import { SEED_CIRCUITS } from '../../data/seed';
import { HELPLINE } from '../../data/constants';
import { addMinutes } from '../../lib/time';
import { formatINR, formatTime } from '../../lib/format';
import { useAppStore } from '../../store/useAppStore';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import ShareTripModal from '../../components/ShareTripModal';
import Reveal from '../../components/Reveal';
import Toast from '../../components/Toast';

const SAKHI_FALLBACK_MSG =
  "A Yatra Sakhi driver wasn't available; a verified Mitra will take you.";

const PAYMENT_LABEL: Record<string, string> = {
  upi_demo: 'UPI (demo)',
  cash_at_kiosk: 'Cash at kiosk',
};

export default function ReceiptPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const trip = useAppStore((s) => s.trips.find((t) => t.id === tripId));
  const driver = useAppStore((s) =>
    trip ? s.drivers.find((d) => d.mitraId === trip.driverMitraId) : undefined,
  );

  const [shareOpen, setShareOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(
    (location.state as { sakhiFallback?: boolean } | null)?.sakhiFallback
      ? SAKHI_FALLBACK_MSG
      : null,
  );

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(t);
  }, [toast]);

  if (!trip) {
    return (
      <div className="p-4">
        <Card className="text-center">
          <h1 className="font-display text-lg font-bold text-cream">Receipt not found</h1>
          <p className="mt-2 text-sm text-cream/65">
            We could not find that booking. Please check your trips.
          </p>
          <Link to="/p/trips" className="mt-4 inline-block">
            <Button>My trips</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const circuit = SEED_CIRCUITS.find((c) => c.id === trip.circuitId);
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="px-4 py-6 md:px-2">
      <div className="rise mx-auto flex items-center gap-3" style={{ '--d': '0s' } as CSSProperties}>
        <span className="pop-in flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-verified/15 shadow-[0_0_34px_rgba(30,142,90,0.5)]" aria-hidden="true">
          <CheckCircle2 size={34} className="text-verified" />
        </span>
        <h1 className="font-display text-3xl font-bold text-cream">Booking confirmed</h1>
      </div>

      {/* receipt card */}
      <Reveal delay={0.12}>
      <Card className="grad-ring mt-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cream/50">
            Receipt {trip.receiptNo}
          </p>
          <Badge variant="simulated">Demo receipt</Badge>
        </div>
        <dl className="mt-4 flex flex-col gap-2.5 text-[15px]">
          <div className="flex justify-between gap-3">
            <dt className="text-cream/55">Circuit</dt>
            <dd className="text-right font-semibold text-cream">{circuit?.name}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-cream/55">Slot</dt>
            <dd className="font-semibold text-cream">{formatTime(trip.slot)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-cream/55">Date</dt>
            <dd className="font-semibold text-cream">{today}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-cream/55">Travellers</dt>
            <dd className="font-semibold text-cream">{trip.partySize}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-white/10 pt-2.5">
            <dt className="text-cream/55">
              {trip.partySize} × {formatINR(circuit?.farePerPerson ?? 0)}
            </dt>
            <dd className="font-display text-xl font-bold text-saffron">{formatINR(trip.fare)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-cream/55">Payment</dt>
            <dd className="font-semibold text-cream">{PAYMENT_LABEL[trip.paymentMethod]}</dd>
          </div>
        </dl>
        {trip.departureTime ? (
          <p className="mt-4 rounded-card border border-verified/40 bg-verified/10 px-3 py-2.5 text-sm font-semibold text-emerald-300">
            Return Guarantee active — back by {formatTime(addMinutes(trip.departureTime, -45))}
          </p>
        ) : null}
      </Card>
      </Reveal>

      {/* driver mini-card */}
      {driver ? (
        <Reveal delay={0.2}>
        <Link
          to={`/p/driver/${driver.mitraId}`}
          className="glass card-lift mt-4 flex items-center gap-4 rounded-card p-4"
          aria-label={`View driver ${driver.name}`}
        >
          <span
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-saffron to-[#c96f06] font-display text-lg font-bold text-ink shadow-glow"
          >
            {driver.initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[17px] font-bold text-cream">{driver.name}</span>
            <span className="mt-0.5 block text-xs text-cream/55">Mitra ID {driver.mitraId}</span>
            <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge variant="verified">Verified</Badge>
              {driver.cohort === 'sakhi' ? <Badge variant="sakhi">Sakhi</Badge> : null}
              <span className="text-xs font-semibold text-cream/60">★ {driver.rating.toFixed(1)}</span>
            </span>
          </span>
        </Link>
        </Reveal>
      ) : null}

      <p className="mt-4 text-center text-xs text-cream/50">
        A receipt would be sent to your phone — Demo
      </p>

      <Reveal delay={0.25}>
      <div className="mt-5 flex flex-col gap-2.5">
        <Button onClick={() => navigate(`/p/ride/${trip.id}`)}>Start ride</Button>
        <Button variant="secondary" onClick={() => setShareOpen(true)}>
          <Share2 size={17} aria-hidden="true" />
          Share live trip
        </Button>
        <Button variant="ghost" onClick={() => setHelpOpen((v) => !v)} aria-expanded={helpOpen}>
          Help
        </Button>
        {helpOpen ? (
          <p className="rounded-card border border-white/10 bg-white/[0.05] px-4 py-3 text-center text-sm text-cream/75">
            Tourism helpline: {HELPLINE}
          </p>
        ) : null}
      </div>
      </Reveal>

      <ShareTripModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        token={trip.liveShareToken}
      />

      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
