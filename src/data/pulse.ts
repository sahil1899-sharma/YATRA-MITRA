// Seeded sample figures for the Jammu Tourism Pulse dashboard (/a).
// Every number here is sample data for the demo — the page labels all
// seeded visuals "Simulated". Live counts (trips today, active drivers,
// verified Mitras) are computed from the store at render time.

export interface PulseSeed {
  baseTripsToday: number;
  missedOrDeclined: number;
  womenSeniorShare: number; // percent
  co2SavedKg: number;
  repeatCircuitRatePct: number; // percent of riders who booked again (simulated)
  circuitDemand: { name: string; value: number }[];
  funnel: { stage: string; value: number }[];
  funnelNote: string;
  dailyMitraRopewayRiders: { day: string; riders: number }[];
  ropewayBaseline: number;
  ropewayBaselineLabel: string;
  originMix: { origin: string; share: number }[];
  dwellMinutes: { stop: string; minutes: number }[];
}

export const PULSE_SEED: PulseSeed = {
  baseTripsToday: 132,
  missedOrDeclined: 18,
  womenSeniorShare: 34,
  co2SavedKg: 412,
  repeatCircuitRatePct: 12,
  circuitDemand: [
    { name: 'C1 · Arrival–Ropeway–Aarti', value: 46 },
    { name: 'C2 · Old City Story Loop', value: 31 },
    { name: 'C6 · Tawi Riverfront Evening', value: 23 },
  ],
  funnel: [
    { stage: 'Bookings', value: 420 },
    { stage: 'Reached Bahu Fort gate', value: 402 },
    { stage: 'Boarded ropeway', value: 301 },
    { stage: 'Reached Mahamaya', value: 296 },
    { stage: 'Reached Aarti ghat', value: 284 },
  ],
  funnelNote: 'Circuit C1, last 30 days',
  dailyMitraRopewayRiders: [
    { day: 'Sep 20', riders: 118 },
    { day: 'Sep 21', riders: 132 },
    { day: 'Sep 22', riders: 105 },
    { day: 'Sep 23', riders: 141 },
    { day: 'Sep 24', riders: 156 },
    { day: 'Sep 25', riders: 128 },
    { day: 'Sep 26', riders: 149 },
    { day: 'Sep 27', riders: 137 },
    { day: 'Sep 28', riders: 162 },
    { day: 'Sep 29', riders: 118 },
    { day: 'Sep 30', riders: 145 },
    { day: 'Oct 1', riders: 151 },
    { day: 'Oct 2', riders: 129 },
    { day: 'Oct 3', riders: 158 },
  ],
  ropewayBaseline: 100,
  ropewayBaselineLabel: 'Reported baseline: under 100 riders/day (Daily Excelsior, Feb 2026)',
  originMix: [
    { origin: 'Delhi NCR', share: 28 },
    { origin: 'Punjab', share: 22 },
    { origin: 'J&K (local)', share: 18 },
    { origin: 'Haryana', share: 12 },
    { origin: 'Uttar Pradesh', share: 9 },
    { origin: 'Maharashtra', share: 6 },
    { origin: 'Other states', share: 5 },
  ],
  dwellMinutes: [
    { stop: 'Bahu Fort gate', minutes: 14 },
    { stop: 'Ropeway ride', minutes: 12 },
    { stop: 'Mahamaya Temple', minutes: 22 },
    { stop: 'Riverfront promenade', minutes: 25 },
    { stop: 'Aarti ghat', minutes: 35 },
    { stop: 'Mubarak Mandi', minutes: 12 },
    { stop: 'Raghunath Bazaar', minutes: 20 },
    { stop: 'Ranbireshwar Temple', minutes: 16 },
  ],
};
