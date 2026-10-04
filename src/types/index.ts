export type VerificationStatus =
  | 'applied'
  | 'documents'
  | 'police_check'
  | 'training'
  | 'assessment'
  | 'badged';

export interface Driver {
  mitraId: string;
  name: string;
  initials: string;
  verificationStatus: VerificationStatus;
  languages: string[];
  cohort: 'standard' | 'sakhi';
  subscriptionActive: boolean;
  rating: number;
  tripsCompleted: number;
  online: boolean;
}

export interface Stop {
  id: string;
  name: string;
  hasStory: boolean;
  storyEn?: string;
  storyHi?: string;
  x: number;
  y: number;
}

export type CircuitId = 'C1' | 'C2' | 'C6';

export interface Circuit {
  id: CircuitId;
  name: string;
  tagline: string;
  stopIds: string[];
  durationMin: number;
  farePerPerson: number;
  minParty: number;
  maxParty: number;
  slots: string[];
  eveningOnly: boolean;
  driverPayout: number;
  kpiLabel: string;
}

export type TripStatus =
  | 'booked'
  | 'driver_assigned'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'aborted';

export interface Trip {
  id: string;
  circuitId: CircuitId;
  driverMitraId: string;
  passengerRef: string;
  partySize: number;
  slot: string;
  departureTime: string | null;
  departureMode: 'train' | 'flight' | 'bus' | null;
  sakhiPreferred: boolean;
  fare: number;
  receiptNo: string;
  liveShareToken: string;
  status: TripStatus;
  channel: 'app' | 'kiosk';
  paymentMethod: 'upi_demo' | 'cash_at_kiosk';
  createdAt: string;
  progress: number;
  delayMin: number;
  playedStopIds: string[];
  /** Per-stop story ratings from the passenger ('up' | 'down'), keyed by stop id. */
  storyRatings: Record<string, 'up' | 'down'>;
  /** Overall ride rating (1-5 stars) from the passenger. */
  rideStars: number;
}

export interface Incident {
  id: string;
  tripId: string;
  type: 'SOS' | 'FARE_ISSUE' | 'TRIP_ABORT';
  status: 'open' | 'escalated' | 'resolved';
  escalatedTo: string;
  /** Optional free text, e.g. the passenger's fare-issue description. */
  note?: string;
  createdAt: string;
}
