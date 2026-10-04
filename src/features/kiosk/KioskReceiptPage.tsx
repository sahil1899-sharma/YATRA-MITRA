import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';
import { SEED_CIRCUITS } from '../../data/seed';
import { formatINR, formatTime } from '../../lib/format';
import { useAppStore } from '../../store/useAppStore';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function KioskReceiptPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const trip = useAppStore((s) => s.trips.find((t) => t.id === tripId));
  const driver = useAppStore((s) => (trip ? s.drivers.find((d) => d.mitraId === trip.driverMitraId) : undefined));
  const circuit = trip ? SEED_CIRCUITS.find((c) => c.id === trip.circuitId) : undefined;

  if (!trip || !circuit) {
    return (
      <Card className="text-center print:hidden">
        <h1 className="font-display text-2xl font-bold text-cream">Receipt not found</h1>
        <Button className="mt-6" onClick={() => navigate('/k')}>
          New booking
        </Button>
      </Card>
    );
  }

  const rideUrl = `${window.location.origin}/p/ride/${trip.id}`;
  const driverLine = driver ? `Mitra ${driver.mitraId} — ${driver.name}` : trip.driverMitraId;

  const rows: [string, string][] = [
    ['Circuit', circuit.name],
    ['Slot', formatTime(trip.slot)],
    ['Travellers', String(trip.partySize)],
    ['Driver', driverLine],
    ['Receipt no.', trip.receiptNo],
    ['Payment', trip.paymentMethod === 'cash_at_kiosk' ? 'Cash at kiosk' : 'UPI'],
    ['Total', formatINR(trip.fare)],
  ];

  return (
    <div>
      {/* screen receipt */}
      <div className="print:hidden">
        <Card className="mx-auto max-w-3xl !p-6">
          <p className="text-center text-[12px] font-bold uppercase tracking-[0.2em] text-saffron">
            Yatra Mitra Kendra — Jammu Tawi
          </p>
          <h1 className="mt-1 text-center font-display text-3xl font-bold text-cream">
            Booking confirmed
          </h1>

          <div className="mt-4 grid items-start gap-6 md:grid-cols-[1fr_auto]">
            <dl className="text-left">
              {rows.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 border-b border-white/8 py-1.5">
                  <dt className="text-sm text-cream/55">{k}</dt>
                  <dd className="text-right font-display text-base font-bold text-cream">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mx-auto text-center">
              <div className="w-fit rounded-card border border-white/15 bg-white p-3">
                <QRCodeSVG value={rideUrl} size={150} aria-label="Follow your ride" />
              </div>
              <p className="mt-2 max-w-[180px] text-sm font-semibold text-cream/80">
                Scan to follow your ride on your phone
              </p>
            </div>
          </div>

          <p className="mt-4 rounded-card border border-saffron/40 bg-saffron/10 px-4 py-2.5 text-center text-lg font-bold text-saffron">
            Hand this to your driver: {driverLine}
          </p>

          <div className="mt-4 flex justify-center gap-3">
            <Button onClick={() => window.print()} className="!px-8 !py-3 !text-lg">
              <Printer size={20} aria-hidden="true" />
              Print receipt
            </Button>
            <Button variant="ghost" onClick={() => navigate('/k')} className="!px-8 !py-3 !text-lg">
              New booking
            </Button>
          </div>
        </Card>
      </div>

      {/* 80mm print receipt */}
      <div className="hidden print:block">
        <div className="mx-auto w-[80mm] bg-white p-4 text-black">
          <p className="text-center text-xs font-bold uppercase tracking-widest">
            Yatra Mitra Kendra
          </p>
          <p className="mt-1 text-center text-sm font-bold">{circuit.name}</p>
          <div className="my-2 border-t border-dashed border-neutral-400" />
          <dl className="text-[13px]">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 py-0.5">
                <dt className="text-neutral-600">{k}</dt>
                <dd className="text-right font-bold">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="my-2 border-t border-dashed border-neutral-400" />
          <div className="flex justify-center">
            <QRCodeSVG value={rideUrl} size={120} aria-label="Follow your ride" />
          </div>
          <p className="mt-1 text-center text-[11px]">Scan to follow your ride on your phone</p>
          <p className="mt-2 text-center text-[13px] font-bold">
            Hand this to your driver: {driverLine}
          </p>
          <p className="mt-2 text-center text-[10px] text-neutral-500">
            Fixed fare · No bargaining · Demo receipt
          </p>
        </div>
      </div>
    </div>
  );
}
