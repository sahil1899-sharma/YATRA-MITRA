import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { SEED_CIRCUITS } from '../../data/seed';
import { RETURN_GUARANTEE_TEXT } from '../../data/constants';
import { MODES, useBookingForm, type DepartureMode } from '../booking/useBookingForm';
import { formatINR, formatTime } from '../../lib/format';
import { formatDuration } from '../../lib/kiosk';
import Card from '../../components/Card';
import Button from '../../components/Button';
import TimeKeypad from './TimeKeypad';

const KIOSK_MODE_LABELS: Record<DepartureMode, string> = {
  train: 'Train',
  flight: 'Flight',
  bus: 'Bus',
  local: 'Staying',
};

const PAY_OPTIONS = [
  { id: 'cash_at_kiosk', label: 'Cash at kiosk' },
  { id: 'upi_demo', label: 'UPI' },
] as const;

export default function KioskBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const circuit = SEED_CIRCUITS.find((c) => c.id === id);
  const form = useBookingForm(circuit, { defaultPay: 'cash_at_kiosk', channel: 'kiosk' });

  if (!circuit) {
    return (
      <Card className="text-center">
        <h1 className="font-display text-2xl font-bold text-cream">Circuit not found</h1>
        <Link to="/k" className="mt-6 inline-block">
          <Button>Back to fare board</Button>
        </Link>
      </Card>
    );
  }

  const doConfirm = () => {
    const res = form.doConfirm();
    if (!res) return;
    navigate(`/k/receipt/${res.trip.id}`);
  };

  return (
    <div className="pb-10">
      <Link
        to="/k"
        className="inline-flex items-center gap-1.5 text-lg font-semibold text-cream/60 hover:text-saffron"
      >
        <ArrowLeft size={20} aria-hidden="true" />
        Fare board
      </Link>
      <h1 className="mt-2 font-display text-3xl font-bold text-cream">{circuit.name}</h1>
      <p className="mt-1 text-lg text-cream/60">
        {formatINR(circuit.farePerPerson)} per person · {formatDuration(circuit.durationMin)} · Our
        agent will help you at every step.
      </p>

      {/* 1 — departure */}
      <Card className="mt-5">
        <h2 className="font-display text-2xl font-bold text-cream">How are you leaving Jammu?</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4" role="group" aria-label="Departure mode">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => form.onModeChange(m.id)}
              aria-pressed={form.mode === m.id}
              className={`min-h-[72px] rounded-card border px-4 py-3 text-xl font-bold transition ${
                form.mode === m.id
                  ? 'opt-selected text-saffron'
                  : 'border-white/15 bg-white/[0.05] text-cream/80 hover:border-white/35'
              }`}
            >
              {KIOSK_MODE_LABELS[m.id]}
            </button>
          ))}
        </div>
        {form.mode !== null && form.mode !== 'local' ? (
          <div className="mt-6">
            <h3 className="text-center font-display text-xl font-bold text-cream">
              Enter your departure time
            </h3>
            <div className="mt-3">
              <TimeKeypad onChange={form.onDepartureChange} />
            </div>
            <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-cream/55">
              {RETURN_GUARANTEE_TEXT}
            </p>
          </div>
        ) : null}
      </Card>

      {/* 2 — slot */}
      <Card className="mt-4">
        <h2 className="font-display text-2xl font-bold text-cream">Choose a slot</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {circuit.slots.map((s, i) => {
            const check = form.slotChecks[i];
            const disabled = check !== null && !check.fits;
            const active = form.slot === s;
            return (
              <button
                key={s}
                type="button"
                disabled={disabled}
                onClick={() => form.setSlot(active ? null : s)}
                aria-pressed={active}
                className={`min-h-[76px] rounded-card border px-4 py-3 text-left transition ${
                  disabled
                    ? 'cursor-not-allowed border-white/10 bg-white/[0.02] opacity-45'
                    : active
                      ? 'opt-selected'
                      : 'border-white/15 bg-white/[0.05] hover:border-saffron/50'
                }`}
              >
                <span className="block font-display text-2xl font-bold text-cream">
                  {formatTime(s)}
                </span>
                <span className="mt-0.5 block text-sm text-cream/55">
                  {check !== null ? (check.fits ? 'Fits your return' : "Doesn't fit your return") : 'Pick a slot'}
                </span>
              </button>
            );
          })}
        </div>
        {form.noSlotFits ? (
          <p className="mt-3 text-base text-cream/65">
            No slot on this circuit gets you back 45 minutes before your {form.departure} departure.
          </p>
        ) : null}
      </Card>

      {/* 3 — travellers + sakhi */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-2xl font-bold text-cream">Travellers</h2>
          <div className="mt-4 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => form.setParty((p) => Math.max(circuit.minParty, p - 1))}
              disabled={form.party <= circuit.minParty}
              aria-label="Fewer travellers"
              className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 text-cream transition hover:border-saffron/60 disabled:opacity-40"
            >
              <Minus size={26} aria-hidden="true" />
            </button>
            <p className="font-display text-5xl font-bold text-cream">{form.party}</p>
            <button
              type="button"
              onClick={() => form.setParty((p) => Math.min(circuit.maxParty, p + 1))}
              disabled={form.party >= circuit.maxParty}
              aria-label="More travellers"
              className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 text-cream transition hover:border-saffron/60 disabled:opacity-40"
            >
              <Plus size={26} aria-hidden="true" />
            </button>
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-2xl font-bold text-cream">Driver preference</h2>
          <button
            type="button"
            role="switch"
            aria-checked={form.sakhi}
            onClick={() => form.setSakhi((v) => !v)}
            className={`mt-4 flex min-h-[76px] w-full items-center justify-between rounded-card border px-5 text-left transition ${
              form.sakhi ? 'opt-selected' : 'border-white/15 bg-white/[0.05]'
            }`}
          >
            <span>
              <span className="block text-xl font-bold text-cream">Woman driver (Yatra Sakhi)</span>
              <span className="block text-sm text-cream/55">We will do our best to assign one</span>
            </span>
            <span
              aria-hidden="true"
              className={`relative h-9 w-16 shrink-0 rounded-full transition ${form.sakhi ? 'bg-saffron' : 'bg-white/15'}`}
            >
              <span
                className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-all ${form.sakhi ? 'left-8' : 'left-1'}`}
              />
            </span>
          </button>
        </Card>
      </div>

      {/* 4 — payment */}
      <Card className="mt-4">
        <h2 className="font-display text-2xl font-bold text-cream">Payment</h2>
        <div className="mt-4 grid grid-cols-2 gap-3" role="group" aria-label="Payment method">
          {PAY_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => form.setPay(o.id)}
              aria-pressed={form.pay === o.id}
              className={`min-h-[72px] rounded-card border px-4 py-3 text-xl font-bold transition ${
                form.pay === o.id
                  ? 'opt-selected text-saffron'
                  : 'border-white/15 bg-white/[0.05] text-cream/80 hover:border-white/35'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Card>

      {form.assignError ? (
        <p role="alert" className="mt-4 rounded-card border border-alert/40 bg-alert/10 px-4 py-3 text-lg font-semibold text-red-300">
          {form.assignError}
        </p>
      ) : null}

      {/* confirm bar */}
      <div className="sticky bottom-0 mt-6 flex items-center justify-between gap-4 border-t border-white/10 bg-night/95 px-2 py-4 backdrop-blur-md">
        <p className="font-display text-2xl font-bold text-cream">
          {form.party} × {formatINR(circuit.farePerPerson)} = {formatINR(form.total)}
        </p>
        <Button onClick={doConfirm} disabled={!form.slot} className="!px-10 !py-4 !text-xl">
          Confirm booking
        </Button>
      </div>
    </div>
  );
}
