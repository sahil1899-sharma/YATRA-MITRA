import type { CircuitId } from '../types';

export const RETURN_BUFFER_MIN = 45;

// ₹/day, driver subscription (illustrative)
export const DAILY_SUBSCRIPTION = 28;

export const GUARANTEE_CARD_TEXT =
  'No bargaining. No surprise stops. No commission shopping. If your driver breaks this promise, your ride is free and we want to know.';

export const RETURN_GUARANTEE_TEXT =
  'Back 45 minutes before your departure, or the ride is free.';

export const HELPLINE = '1363';
export const EMERGENCY = '112';

export const MAX_PARTY_DEFAULT = 4;

export interface CircuitPricing {
  farePerPerson: number;
  minParty: number;
  driverPayout: number;
  durationMin: number;
}

// Single source of truth for circuit pricing. Change a fare here and every
// screen, receipt and dashboard that reads it picks the new value up.
export const PRICING: Record<CircuitId, CircuitPricing> = {
  C1: { farePerPerson: 499, minParty: 2, driverPayout: 500, durationMin: 180 },
  C2: { farePerPerson: 349, minParty: 1, driverPayout: 350, durationMin: 120 },
  C6: { farePerPerson: 449, minParty: 1, driverPayout: 450, durationMin: 180 },
};
