import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Driver, Incident, Trip, TripStatus, VerificationStatus } from '../types';
import { MAX_PARTY_DEFAULT } from '../data/constants';
import { SEED_CIRCUITS, getSeedDrivers } from '../data/seed';

export type Role = 'passenger' | 'driver' | 'kiosk' | 'admin';

const VERIFICATION_PIPELINE: VerificationStatus[] = [
  'applied',
  'documents',
  'police_check',
  'training',
  'assessment',
  'badged',
];

export type TripDraft = Omit<
  Trip,
  'id' | 'createdAt' | 'status' | 'progress' | 'delayMin' | 'playedStopIds' | 'receiptNo' | 'liveShareToken' | 'fare' | 'storyRatings' | 'rideStars'
> & {
  id?: string;
  status?: TripStatus;
  receiptNo?: string;
  liveShareToken?: string;
};

export type TripResult = { ok: true; trip: Trip } | { ok: false; error: string };
export type UpdateResult = { ok: true } | { ok: false; error: string };
export type IncidentDraft = Omit<Incident, 'id' | 'createdAt'> & {
  status?: Incident['status'];
};

interface AppState {
  drivers: Driver[];
  trips: Trip[];
  incidents: Incident[];
  activeRole: Role | null;
  activeDriverMitraId: string | null;
  setActiveDriver: (mitraId: string | null) => void;
  createTrip: (draft: TripDraft) => TripResult;
  updateTrip: (id: string, patch: Partial<Trip>) => UpdateResult;
  setTripStatus: (id: string, status: TripStatus) => void;
  advanceDriverVerification: (mitraId: string) => void;
  badgeDriver: (mitraId: string) => void;
  createIncident: (draft: IncidentDraft) => Incident;
  updateIncident: (id: string, patch: Partial<Incident>) => void;
  setDriverOnline: (mitraId: string, online: boolean) => void;
  incrementDriverTrips: (mitraId: string) => void;
  resetDemo: () => void;
}

function findDriver(drivers: Driver[], mitraId: string): Driver | undefined {
  return drivers.find((d) => d.mitraId === mitraId);
}

function assignmentError(drivers: Driver[], mitraId: string): string | null {
  const driver = findDriver(drivers, mitraId);
  if (!driver) return `Unknown driver ${mitraId}.`;
  if (driver.verificationStatus !== 'badged') {
    return `Driver ${mitraId} is at verification stage "${driver.verificationStatus}" and cannot be assigned trips. Only badged drivers can take trips.`;
  }
  return null;
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, '0')}`;
}

function initialState() {
  return {
    drivers: getSeedDrivers(),
    trips: [] as Trip[],
    incidents: [] as Incident[],
    activeRole: null as Role | null,
    activeDriverMitraId: null as string | null,
  };
}

// Corrupted persisted state must never white-screen the app. This storage
// wrapper detects unparseable data, drops it (the store then falls back to
// seed state), and raises a flag so the UI can tell the user what happened.
// The flag stays raised until the notice is dismissed, so a StrictMode
// remount cannot lose it.
let corruptionPending = false;
export function isCorruptionPending(): boolean {
  return corruptionPending;
}
export function dismissCorruptionNotice(): void {
  corruptionPending = false;
}

const safeStorage = createJSONStorage(() => ({
  getItem: (key: string) => {
    const raw = localStorage.getItem(key);
    if (raw == null) return null;
    try {
      JSON.parse(raw);
      return raw;
    } catch {
      corruptionPending = true;
      localStorage.removeItem(key);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },
}));

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState(),

      createTrip: (draft) => {
        const { drivers } = get();
        const circuit = SEED_CIRCUITS.find((c) => c.id === draft.circuitId);
        if (!circuit) return { ok: false, error: `Unknown circuit ${draft.circuitId}.` };

        const blocked = assignmentError(drivers, draft.driverMitraId);
        if (blocked) return { ok: false, error: blocked };

        if (draft.partySize < circuit.minParty || draft.partySize > circuit.maxParty) {
          return {
            ok: false,
            error: `Party size must be between ${circuit.minParty} and ${circuit.maxParty} for circuit ${circuit.id}.`,
          };
        }

        const n = get().trips.length + 1;
        const seq = String(n).padStart(4, '0');
        const now = new Date();
        const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
          now.getDate(),
        ).padStart(2, '0')}`;

        const trip: Trip = {
          id: draft.id ?? `T-${seq}`,
          circuitId: draft.circuitId,
          driverMitraId: draft.driverMitraId,
          passengerRef: draft.passengerRef,
          partySize: draft.partySize,
          slot: draft.slot,
          departureTime: draft.departureTime,
          departureMode: draft.departureMode,
          sakhiPreferred: draft.sakhiPreferred,
          fare: circuit.farePerPerson * draft.partySize,
          receiptNo: draft.receiptNo ?? `YM-R-${ymd}-${seq}`,
          liveShareToken: draft.liveShareToken ?? makeId('SHARE'),
          status: draft.status ?? 'booked',
          channel: draft.channel,
          paymentMethod: draft.paymentMethod,
          createdAt: now.toISOString(),
          progress: 0,
          delayMin: 0,
          playedStopIds: [],
          storyRatings: {},
          rideStars: 0,
        };
        set((s) => ({ trips: [...s.trips, trip] }));
        return { ok: true, trip };
      },

      updateTrip: (id, patch) => {
        const { drivers } = get();
        if (patch.driverMitraId !== undefined) {
          const blocked = assignmentError(drivers, patch.driverMitraId);
          if (blocked) return { ok: false, error: blocked };
        }
        if (patch.partySize !== undefined) {
          const trip = get().trips.find((t) => t.id === id);
          const circuit = trip ? SEED_CIRCUITS.find((c) => c.id === trip.circuitId) : undefined;
          const max = circuit ? circuit.maxParty : MAX_PARTY_DEFAULT;
          const min = circuit ? circuit.minParty : 1;
          if (patch.partySize < min || patch.partySize > max) {
            return { ok: false, error: `Party size must be between ${min} and ${max}.` };
          }
        }
        set((s) => ({ trips: s.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
        return { ok: true };
      },

      setTripStatus: (id, status) => {
        set((s) => ({ trips: s.trips.map((t) => (t.id === id ? { ...t, status } : t)) }));
      },

      advanceDriverVerification: (mitraId) => {
        set((s) => ({
          drivers: s.drivers.map((d) => {
            if (d.mitraId !== mitraId) return d;
            const idx = VERIFICATION_PIPELINE.indexOf(d.verificationStatus);
            if (idx < 0 || idx >= VERIFICATION_PIPELINE.length - 1) return d;
            return { ...d, verificationStatus: VERIFICATION_PIPELINE[idx + 1] };
          }),
        }));
      },

      badgeDriver: (mitraId) => {
        set((s) => ({
          drivers: s.drivers.map((d) =>
            d.mitraId === mitraId
              ? { ...d, verificationStatus: 'badged', online: true, subscriptionActive: true }
              : d,
          ),
        }));
      },

      createIncident: (draft) => {
        const incident: Incident = {
          id: makeId('INC'),
          tripId: draft.tripId,
          type: draft.type,
          status: draft.status ?? 'open',
          escalatedTo: draft.escalatedTo,
          note: draft.note,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ incidents: [...s.incidents, incident] }));
        return incident;
      },

      updateIncident: (id, patch) => {
        set((s) => ({
          incidents: s.incidents.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        }));
      },

      setDriverOnline: (mitraId, online) => {
        set((s) => ({
          drivers: s.drivers.map((d) => (d.mitraId === mitraId ? { ...d, online } : d)),
        }));
      },

      setActiveDriver: (mitraId) => {
        set({ activeDriverMitraId: mitraId });
      },

      incrementDriverTrips: (mitraId) => {
        set((s) => ({
          drivers: s.drivers.map((d) =>
            d.mitraId === mitraId ? { ...d, tripsCompleted: d.tripsCompleted + 1 } : d,
          ),
        }));
      },

      resetDemo: () => {
        set(initialState());
      },
    }),
    { name: 'yatra-mitra-demo-v1', storage: safeStorage },
  ),
);

// Cross-tab sync: zustand's persist does not rehydrate other tabs on its
// own, so a second tab (e.g. the public live-share page) re-reads the latest
// persisted state whenever any tab writes to it.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'yatra-mitra-demo-v1') void useAppStore.persist.rehydrate();
  });
}
