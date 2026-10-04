import { addMinutes, parseHHMM } from '../lib/time';
import { formatTime } from '../lib/format';
import type { Circuit, Trip } from '../types';
import Card from './Card';
import Badge from './Badge';

export interface ReturnCountdown {
  deadline: string;
  slack: number;
  band: 'ok' | 'tight' | 'risk';
}

// Shared by the passenger ride screen and the driver trip screen.
// returnDeadline = departure − 45 min; etaBack = slot start + duration + delay.
export function useReturnCountdown(trip: Trip, circuit: Circuit): ReturnCountdown | null {
  if (!trip.departureTime) return null;
  const deadline = addMinutes(trip.departureTime, -45);
  const etaBack = parseHHMM(trip.slot) + circuit.durationMin + trip.delayMin;
  const slack = parseHHMM(deadline) - etaBack;
  const band = slack >= 20 ? 'ok' : slack >= 0 ? 'tight' : 'risk';
  return { deadline, slack, band };
}

const BAND_LABEL: Record<ReturnCountdown['band'], string> = {
  ok: 'On time',
  tight: 'Buffer tight',
  risk: 'At risk — the cooperative covers this ride',
};

export default function ReturnCountdownCard({
  trip,
  circuit,
}: {
  trip: Trip;
  circuit: Circuit;
}) {
  const countdown = useReturnCountdown(trip, circuit);
  if (!countdown) return null;
  return (
    <Card
      className={
        countdown.band === 'ok'
          ? 'border-verified/30'
          : countdown.band === 'tight'
            ? 'border-amber/40'
            : 'border-alert/40'
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-cream">Return guarantee</h2>
          <p className="mt-1 text-sm text-cream/60">
            Back by {formatTime(countdown.deadline)} ·{' '}
            {countdown.slack >= 0
              ? `${countdown.slack} min`
              : `${-countdown.slack} min over`}{' '}
            buffer
          </p>
        </div>
        <Badge
          variant={
            countdown.band === 'ok' ? 'verified' : countdown.band === 'tight' ? 'simulated' : 'alert'
          }
        >
          {BAND_LABEL[countdown.band]}
        </Badge>
      </div>
    </Card>
  );
}
