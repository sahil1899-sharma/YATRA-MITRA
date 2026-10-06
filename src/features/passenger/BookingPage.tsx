import type { CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Minus, Plus } from 'lucide-react';
import { SEED_CIRCUITS } from '../../data/seed';
import { RETURN_GUARANTEE_TEXT } from '../../data/constants';
import { MODES, useBookingForm } from '../booking/useBookingForm';
import { formatINR, formatTime } from '../../lib/format';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Reveal from '../../components/Reveal';
import CountUp from '../../components/CountUp';

const rise = (d: string) => ({ '--d': d }) as CSSProperties;

function SectionNum({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-saffron to-[#c96f06] font-display text-lg font-bold text-ink shadow-glow"
    >
      {n}
    </span>
  );
}

function Stepper({ steps }: { steps: { label: string; done: boolean }[] }) {
  const current = steps.findIndex((s) => !s.done);
  return (
    <ol className="mt-5 flex items-center" aria-label="Booking progress">
      {steps.map((s, i) => {
        const isCurrent = i === current;
        const isDone = s.done;
        return (
          <li key={s.label} className={`flex items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all duration-500 ${
                  isDone
                    ? 'border-saffron bg-saffron text-ink shadow-glow'
                    : isCurrent
                      ? 'border-saffron/70 bg-saffron/10 text-saffron'
                      : 'border-white/15 bg-white/[0.04] text-cream/40'
                }`}
              >
                {isDone ? <Check size={15} aria-hidden="true" /> : i + 1}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  isDone || isCurrent ? 'text-cream/80' : 'text-cream/35'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 ? (
              <div className="relative mx-1 mb-6 h-0.5 flex-1 overflow-hidden rounded bg-white/10">
                <div
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r from-saffron to-amber-300 transition-all duration-700 ${
                    isDone ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const circuit = SEED_CIRCUITS.find((c) => c.id === id);

  const form = useBookingForm(circuit, { defaultPay: 'upi_demo', channel: 'app' });
  const {
    mode,
    departure,
    slot,
    party,
    sakhi,
    pay,
    assignError,
    total,
    slotChecks,
    noSlotFits,
  } = form;

  if (!circuit) {
    return (
      <div className="p-4">
        <Card className="text-center">
          <h1 className="font-display text-lg font-bold text-cream">Circuit not found</h1>
          <p className="mt-2 text-sm text-cream/65">Please choose a circuit to book.</p>
          <Link to="/p" className="mt-4 inline-block">
            <Button>Browse circuits</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const doConfirm = () => {
    const res = form.doConfirm();
    if (!res) return;
    navigate(`/p/receipt/${res.trip.id}`, {
      state: { sakhiFallback: res.sakhiFallback },
    });
  };

  const steps = [
    { label: 'Departure', done: mode !== null },
    { label: 'Slot', done: slot !== null },
    { label: 'Travellers', done: true },
    { label: 'Driver', done: true },
    { label: 'Payment', done: true },
  ];

  return (
    <div className="">
      <div className="px-4 pb-32 pt-4 md:px-2 md:pt-6">
        <Link
          to={`/p/circuit/${circuit.id}`}
          className="rise inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-cream/60 hover:text-saffron"
          style={rise('0s')}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to circuit
        </Link>

        <div className="rise mt-3" style={rise('0.06s')}>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-saffron">Booking</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-cream">{circuit.name}</h1>
          <p className="mt-1 text-sm text-cream/60">
            {formatINR(circuit.farePerPerson)} per person · {formatTime(circuit.slots[0])} onwards
          </p>
          <Stepper steps={steps} />
        </div>

        {/* 1 — departure */}
        <Reveal delay={0.05}>
        <Card className="mt-5">
          <div className="flex items-center gap-3">
            <SectionNum n={1} />
            <h2 className="font-display text-xl font-bold text-cream">Your departure</h2>
            <span className="text-xs font-semibold text-cream/45">(optional)</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Departure mode">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => form.onModeChange(m.id)}
                aria-pressed={mode === m.id}
                className={`min-h-[48px] rounded-card border px-3 py-2.5 text-sm font-semibold transition duration-300 ${
                  mode === m.id
                    ? 'opt-selected text-saffron'
                    : 'border-white/15 bg-white/[0.05] text-cream/75 hover:border-white/30'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          {mode !== null && mode !== 'local' ? (
            <div className="mt-4">
              <label htmlFor="departure-time" className="text-sm font-semibold text-cream/85">
                Departure time
              </label>
              <input
                id="departure-time"
                type="time"
                value={departure}
                onChange={(e) => form.onDepartureChange(e.target.value)}
                className="mt-1.5 w-full rounded-card border border-white/15 bg-night-soft px-4 py-3 text-base text-cream [color-scheme:dark]"
              />
              <p className="mt-2 text-xs leading-relaxed text-cream/55">{RETURN_GUARANTEE_TEXT}</p>
            </div>
          ) : null}
        </Card>
        </Reveal>

        {/* 2 — slot */}
        <Reveal delay={0.08}>
        <Card className="mt-4">
          <div className="flex items-center gap-3">
            <SectionNum n={2} />
            <h2 className="font-display text-xl font-bold text-cream">Choose a slot</h2>
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            {circuit.slots.map((s, i) => {
              const check = slotChecks[i];
              const disabled = check !== null && !check.fits;
              const active = slot === s;
              return (
                <div key={s}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => form.setSlot(active ? null : s)}
                    aria-pressed={active}
                    className={`flex min-h-[60px] w-full items-center justify-between gap-3 rounded-card border px-4 py-3 text-left transition duration-300 ${
                      disabled
                        ? 'cursor-not-allowed border-white/10 bg-white/[0.02] opacity-45'
                        : active
                          ? 'opt-selected'
                          : 'border-white/15 bg-white/[0.05] hover:border-saffron/50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm font-bold ${
                          active ? 'border-saffron bg-saffron text-ink' : 'border-white/25 text-cream/60'
                        }`}
                      >
                        {active ? <Check size={15} aria-hidden="true" /> : null}
                      </span>
                      <span className="text-lg font-bold text-cream">{formatTime(s)}</span>
                    </span>
                    {check && check.fits ? (
                      <span className="text-xs font-bold text-emerald-300">
                        Fits — {check.slackMin} min to spare
                      </span>
                    ) : null}
                  </button>
                  {disabled ? (
                    <p className="mt-1 pl-1 text-xs text-cream/50">
                      Would not get you back 45 minutes before departure
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
          {noSlotFits ? (
            <div className="mt-4 rounded-card border border-amber/40 bg-amber/10 p-4">
              <p className="text-sm font-semibold text-amber">
                No slot on this circuit gets you back 45 minutes before your {departure} departure.
              </p>
              <Link to={`/p?departure=${departure}`} className="mt-3 inline-block">
                <Button variant="secondary">See circuits that fit</Button>
              </Link>
            </div>
          ) : null}
        </Card>
        </Reveal>

        {/* 3 — travellers */}
        <Reveal delay={0.1}>
        <Card className="mt-4">
          <div className="flex items-center gap-3">
            <SectionNum n={3} />
            <h2 className="font-display text-xl font-bold text-cream">Travellers</h2>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              aria-label="Fewer travellers"
              disabled={party <= circuit.minParty}
              onClick={() => form.setParty((p) => Math.max(circuit.minParty, p - 1))}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-cream transition hover:border-saffron/60 hover:text-saffron disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Minus size={20} aria-hidden="true" />
            </button>
            <div className="text-center">
              <p className="font-display text-4xl font-bold text-cream">{party}</p>
              <p className="mt-0.5 text-xs text-cream/50">
                {circuit.minParty}–{circuit.maxParty} travellers
              </p>
            </div>
            <button
              type="button"
              aria-label="More travellers"
              disabled={party >= circuit.maxParty}
              onClick={() => form.setParty((p) => Math.min(circuit.maxParty, p + 1))}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-cream transition hover:border-saffron/60 hover:text-saffron disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Plus size={20} aria-hidden="true" />
            </button>
          </div>
        </Card>
        </Reveal>

        {/* 4 — driver preference */}
        <Reveal delay={0.12}>
        <Card className="mt-4">
          <div className="flex items-center gap-3">
            <SectionNum n={4} />
            <h2 className="font-display text-xl font-bold text-cream">Driver preference</h2>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={sakhi}
            onClick={() => form.setSakhi((v) => !v)}
            className="mt-4 flex w-full items-center justify-between gap-3 rounded-card border border-white/15 bg-white/[0.05] px-4 py-3.5 transition duration-300 hover:border-saffron/40"
          >
            <span className="text-left">
              <span className="block text-[15px] font-semibold text-cream">
                Woman driver preferred (Yatra Sakhi)
              </span>
              <span className="mt-0.5 block text-xs text-cream/55">
                We will do our best to assign a Yatra Sakhi driver
              </span>
            </span>
            <span
              aria-hidden="true"
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${
                sakhi ? 'bg-saffron shadow-glow' : 'bg-white/15'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  sakhi ? 'left-6' : 'left-1'
                }`}
              />
            </span>
          </button>
        </Card>
        </Reveal>

        {/* 5 — payment */}
        <Reveal delay={0.14}>
        <Card className="mt-4">
          <div className="flex items-center gap-3">
            <SectionNum n={5} />
            <h2 className="font-display text-xl font-bold text-cream">Payment</h2>
          </div>
          <div className="mt-4 flex flex-col gap-2" role="radiogroup" aria-label="Payment method">
            {(
              [
                { id: 'upi_demo', label: 'UPI (demo)' },
                { id: 'cash_at_kiosk', label: 'Pay at kiosk (cash)' },
              ] as const
            ).map((o) => (
              <label
                key={o.id}
                className={`flex min-h-[56px] cursor-pointer items-center gap-3 rounded-card border px-4 py-3 transition duration-300 ${
                  pay === o.id
                    ? 'opt-selected'
                    : 'border-white/15 bg-white/[0.05] hover:border-white/30'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={pay === o.id}
                  onChange={() => form.setPay(o.id)}
                  className="h-5 w-5 accent-[#E8890C]"
                />
                <span className="text-[15px] font-semibold text-cream">{o.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs text-cream/55">Demo payment — no money is charged.</p>
        </Card>
        </Reveal>

        {assignError ? (
          <div className="mt-4 rounded-card border border-alert/50 bg-alert/10 p-4" role="alert">
            <p className="text-sm font-semibold text-red-300">{assignError}</p>
          </div>
        ) : null}
      </div>

      {/* sticky summary bar — sits above the mobile tab bar */}
      <div className="sticky bottom-[61px] border-t border-saffron/20 bg-night/92 px-4 py-3 shadow-[0_-12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md md:bottom-0">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
          <p className="text-[15px] font-bold text-cream">
            {party} × {formatINR(circuit.farePerPerson)} ={' '}
            <CountUp value={total} format={(n) => formatINR(Math.round(n))} />
          </p>
          <Button onClick={doConfirm} disabled={!slot} className="min-w-[170px]">
            Confirm booking
          </Button>
        </div>
      </div>
    </div>
  );
}
