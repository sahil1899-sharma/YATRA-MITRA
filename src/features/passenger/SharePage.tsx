import { useParams } from 'react-router-dom';
import { SEED_CIRCUITS } from '../../data/seed';
import { getCircuitStops } from '../../lib/circuits';
import { useAppStore } from '../../store/useAppStore';
import JammuMap from '../../components/JammuMap';
import Card from '../../components/Card';
import Badge from '../../components/Badge';

// Public live-share page. Deliberately shows no passenger data — only the
// driver, the circuit, and where the ride is along its route.
export default function SharePage() {
  const { token } = useParams();
  const trip = useAppStore((s) => s.trips.find((t) => t.liveShareToken === token));

  if (!trip) {
    return (
      <Card className="text-center">
        <h1 className="font-display text-2xl font-bold text-cream">This link is not active.</h1>
        <p className="mt-2 text-sm text-cream/65">
          The ride it pointed to has ended, or the link was never issued.
        </p>
      </Card>
    );
  }

  const driver = useAppStore((s) => s.drivers.find((d) => d.mitraId === trip.driverMitraId));
  const circuit = SEED_CIRCUITS.find((c) => c.id === trip.circuitId);
  const stops = circuit ? getCircuitStops(circuit) : [];
  const firstName = driver?.name.split(' ')[0] ?? 'Your driver';
  const statusLabel =
    trip.status === 'in_progress'
      ? 'On the way'
      : trip.status === 'completed'
        ? 'Ride completed'
        : 'Booked';

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-lg font-bold text-cream">
              Riding with {firstName}
              {driver ? <span className="text-cream/50"> · {driver.mitraId}</span> : null}
            </p>
            <p className="mt-0.5 text-sm text-cream/60">{circuit?.name ?? 'Yatra Mitra ride'}</p>
          </div>
          <Badge variant={trip.status === 'in_progress' ? 'verified' : 'simulated'}>{statusLabel}</Badge>
        </div>
      </Card>

      <JammuMap
        stops={stops}
        progress={trip.progress}
        readOnly
        caption="Simulated location"
      />

      <Card>
        <div className="flex items-center justify-between text-sm">
          <span className="text-cream/60">Progress along the route</span>
          <span className="font-display font-bold text-cream">{Math.round(trip.progress)}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-saffron to-[#c96f06]"
            style={{ width: `${trip.progress}%` }}
          />
        </div>
        <p className="mt-4 border-t border-white/10 pt-3 text-center text-xs leading-relaxed text-cream/50">
          Demo: this link works in the same browser because the demo has no server.
        </p>
      </Card>
    </div>
  );
}
