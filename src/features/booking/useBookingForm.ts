import { useState } from 'react';
import { fitsReturnGuarantee } from '../../lib/returnGuarantee';
import { assignDriver } from '../../lib/dispatch';
import { useAppStore } from '../../store/useAppStore';
import type { Circuit, Trip } from '../../types';

export type DepartureMode = 'train' | 'flight' | 'bus' | 'local';

export const MODES: { id: DepartureMode; label: string }[] = [
  { id: 'train', label: 'Train' },
  { id: 'flight', label: 'Flight' },
  { id: 'bus', label: 'Bus' },
  { id: 'local', label: "I'm staying in Jammu" },
];

export type PayMethod = 'upi_demo' | 'cash_at_kiosk';

function randomToken(len: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export interface BookingOptions {
  defaultPay: PayMethod;
  channel: 'app' | 'kiosk';
}

export interface ConfirmResult {
  trip: Trip;
  sakhiFallback: boolean;
}

// Shared booking logic for the passenger app (Phase 4) and the kiosk (Phase 8).
// Behaviour is identical in both: same return-guarantee filtering, same dispatch.
export function useBookingForm(circuit: Circuit | undefined, opts: BookingOptions) {
  const drivers = useAppStore((s) => s.drivers);
  const trips = useAppStore((s) => s.trips);
  const createTrip = useAppStore((s) => s.createTrip);

  const [mode, setMode] = useState<DepartureMode | null>(null);
  const [departure, setDeparture] = useState('');
  const [slot, setSlot] = useState<string | null>(null);
  const [party, setParty] = useState(circuit?.minParty ?? 1);
  const [sakhi, setSakhi] = useState(false);
  const [pay, setPay] = useState<PayMethod>(opts.defaultPay);
  const [assignError, setAssignError] = useState<string | null>(null);

  const departureSet = mode !== null && mode !== 'local' && departure !== '';
  const total = circuit ? party * circuit.farePerPerson : 0;

  const slotChecks = circuit
    ? circuit.slots.map((s) =>
        departureSet ? fitsReturnGuarantee(s, circuit.durationMin, departure) : null,
      )
    : [];
  const noSlotFits = !!circuit && departureSet && slotChecks.every((c) => c && !c.fits);

  const onDepartureChange = (v: string) => {
    setDeparture(v);
    if (circuit && slot && v && !fitsReturnGuarantee(slot, circuit.durationMin, v).fits) {
      setSlot(null);
    }
  };

  const onModeChange = (m: DepartureMode) => {
    setMode(m);
    setAssignError(null);
  };

  const doConfirm = (): ConfirmResult | null => {
    if (!circuit || !slot) return null;
    const a = assignDriver(drivers, trips, sakhi);
    if (!a.ok) {
      setAssignError(a.error);
      return null;
    }
    const r = createTrip({
      circuitId: circuit.id,
      driverMitraId: a.mitraId,
      passengerRef: 'guest',
      partySize: party,
      slot,
      departureTime: departureSet ? departure : null,
      departureMode: mode === 'local' || mode === null ? null : mode,
      sakhiPreferred: sakhi,
      channel: opts.channel,
      paymentMethod: pay,
      liveShareToken: randomToken(10),
      status: 'driver_assigned',
    });
    if (!r.ok) {
      setAssignError(r.error);
      return null;
    }
    return { trip: r.trip, sakhiFallback: a.usedSakhiFallback };
  };

  return {
    mode,
    departure,
    slot,
    party,
    sakhi,
    pay,
    assignError,
    departureSet,
    total,
    slotChecks,
    noSlotFits,
    setSlot,
    setParty,
    setSakhi,
    setPay,
    onDepartureChange,
    onModeChange,
    doConfirm,
  };
}

export type BookingForm = ReturnType<typeof useBookingForm>;
