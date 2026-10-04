import { SEED_STOPS } from '../data/seed';
import type { Circuit, Stop } from '../types';

const STOP_BY_ID = new Map(SEED_STOPS.map((s) => [s.id, s]));

/** Resolve a circuit's ordered stops from its stopIds. */
export function getCircuitStops(circuit: Circuit): Stop[] {
  return circuit.stopIds
    .map((stopId) => STOP_BY_ID.get(stopId))
    .filter((s): s is Stop => s !== undefined);
}

/** Progress (0–100) at which stop k of n is considered reached. */
export function stopProgressFraction(k: number, n: number): number {
  return n <= 1 ? 100 : (k / (n - 1)) * 100;
}
