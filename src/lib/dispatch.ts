import type { Driver, Trip, TripStatus } from '../types';

const ACTIVE_STATUSES: TripStatus[] = ['booked', 'driver_assigned', 'accepted', 'in_progress'];

export type AssignResult =
  | { ok: true; mitraId: string; usedSakhiFallback: boolean }
  | { ok: false; error: string };

function byMitraId(a: Driver, b: Driver): number {
  return a.mitraId.localeCompare(b.mitraId);
}

// Driver assignment for a new booking.
// - Candidates: badged AND online AND subscriptionActive.
// - Sakhi preferred: first Sakhi candidate; if none, fall back to any
//   candidate and report the fallback so the UI can tell the passenger.
// - Otherwise: candidate with the fewest active trips; ties go to the
//   lowest Mitra ID (candidates are pre-sorted, strict < keeps the first).
export function assignDriver(
  drivers: Driver[],
  trips: Trip[],
  sakhiPreferred: boolean,
): AssignResult {
  const candidates = drivers
    .filter((d) => d.verificationStatus === 'badged' && d.online && d.subscriptionActive)
    .sort(byMitraId);

  if (candidates.length === 0) {
    return { ok: false, error: 'No verified drivers are available right now' };
  }

  const activeLoad = (d: Driver): number =>
    trips.filter(
      (t) => t.driverMitraId === d.mitraId && ACTIVE_STATUSES.includes(t.status),
    ).length;

  if (sakhiPreferred) {
    const sakhi = candidates.filter((d) => d.cohort === 'sakhi');
    if (sakhi.length > 0) {
      // Least-busy Sakhi driver first; ties go to the lowest Mitra ID
      // (candidates are pre-sorted, strict < keeps the first).
      let best = sakhi[0];
      let bestLoad = activeLoad(best);
      for (const c of sakhi.slice(1)) {
        const l = activeLoad(c);
        if (l < bestLoad) {
          best = c;
          bestLoad = l;
        }
      }
      return { ok: true, mitraId: best.mitraId, usedSakhiFallback: false };
    }
    return { ok: true, mitraId: candidates[0].mitraId, usedSakhiFallback: true };
  }

  let best = candidates[0];
  let bestLoad = activeLoad(best);
  for (const c of candidates.slice(1)) {
    const l = activeLoad(c);
    if (l < bestLoad) {
      best = c;
      bestLoad = l;
    }
  }
  return { ok: true, mitraId: best.mitraId, usedSakhiFallback: false };
}
