import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SEED_CIRCUITS } from '../../data/seed';
import { formatINR, formatTime } from '../../lib/format';
import { useAppStore } from '../../store/useAppStore';
import Card from '../../components/Card';
import CountUp from '../../components/CountUp';
import Badge from '../../components/Badge';

const DAILY_TARGET = 1050;
const WEEKLY_SIMULATED = [1180, 1320, 1050, 1490, 1560, 1240, 1410];

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function last7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-IN', { weekday: 'short' });
  });
}

export default function DriverEarningsPage() {
  const [tab, setTab] = useState<'daily' | 'weekly'>('daily');
  const activeDriverMitraId = useAppStore((s) => s.activeDriverMitraId);
  const driver = useAppStore((s) => s.drivers.find((d) => d.mitraId === activeDriverMitraId));
  const trips = useAppStore((s) => s.trips);

  if (!driver) {
    return (
      <div className="p-4">
        <Card className="text-center">
          <h1 className="font-display text-xl font-bold text-cream">Choose your driver</h1>
          <p className="mt-2 text-sm text-cream/65">Sign in to see earnings.</p>
        </Card>
      </div>
    );
  }

  const myTrips = trips.filter((t) => t.driverMitraId === driver.mitraId);
  const todayTrips = myTrips.filter((t) => t.status === 'completed' && isToday(t.createdAt));
  const payoutFor = (circuitId: string) =>
    SEED_CIRCUITS.find((c) => c.id === circuitId)?.driverPayout ?? 0;
  const earnings = todayTrips.reduce((sum, t) => sum + payoutFor(t.circuitId), 0);
  const pct = Math.min(100, Math.round((earnings / DAILY_TARGET) * 100));

  const weekData = last7Days().map((day, i) => ({ day, earnings: WEEKLY_SIMULATED[i] }));

  return (
    <div className="bg-jaali-dark px-4 pb-10 pt-6 md:px-2">
      <h1 className="font-display text-2xl font-bold text-cream">Earnings</h1>

      {/* toggle */}
      <div className="mt-4 inline-flex rounded-full border border-white/15 bg-white/[0.04] p-1" role="tablist" aria-label="Earnings period">
        {(['daily', 'weekly'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-full px-5 py-1.5 text-sm font-bold capitalize transition ${
              tab === t ? 'bg-saffron text-ink shadow-glow' : 'text-cream/60 hover:text-cream'
            }`}
          >
            {t === 'daily' ? 'Daily' : 'Weekly'}
          </button>
        ))}
      </div>

      {tab === 'daily' ? (
        <>
          <Card className="mt-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-bold text-cream">Today</h2>
              <p className="font-display text-2xl font-bold text-saffron">
                <CountUp value={earnings} format={(n) => formatINR(Math.round(n))} />
              </p>
            </div>
            <div className="bar-shimmer mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-saffron to-[#c96f06]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-cream/55">
              {formatINR(earnings)} of {formatINR(DAILY_TARGET)} daily target
            </p>
          </Card>

          <h2 className="mt-6 font-display text-lg font-bold text-cream">Completed trips today</h2>
          {todayTrips.length === 0 ? (
            <Card className="mt-3 text-center">
              <p className="text-sm text-cream/60">No completed trips yet today.</p>
            </Card>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {todayTrips.map((t) => {
                const circuit = SEED_CIRCUITS.find((c) => c.id === t.circuitId);
                return (
                  <Card key={t.id} className="!p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-display text-base font-bold text-cream">
                          {circuit?.name ?? t.circuitId}
                        </p>
                        <p className="mt-0.5 text-xs text-cream/55">
                          {formatTime(t.slot)} · {t.partySize} traveller
                          {t.partySize === 1 ? '' : 's'}
                        </p>
                      </div>
                      <p className="font-display text-lg font-bold text-emerald-300">
                        +{formatINR(payoutFor(t.circuitId))}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <Card className="mt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-cream">This week</h2>
            <Badge variant="simulated">Simulated</Badge>
          </div>
          <div className="mt-3 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'rgba(255,248,236,0.55)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,248,236,0.55)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [formatINR(Number(v)), 'Earnings']}
                  contentStyle={{
                    background: '#1d0f16',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 12,
                    color: '#FFF8EC',
                  }}
                />
                <Bar dataKey="earnings" fill="#E8890C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-center text-xs text-cream/45">
            Simulated weekly sample — not your real earnings.
          </p>
        </Card>
      )}

      {/* subscription + welfare */}
      <Card className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-cream">Daily subscription ₹28</p>
            <p className="mt-0.5 text-xs text-cream/55">Zero commission on every trip</p>
          </div>
          <Badge variant={driver.subscriptionActive ? 'verified' : 'simulated'}>
            {driver.subscriptionActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-cream">Welfare pool balance</p>
            <p className="mt-0.5 font-display text-xl font-bold text-cream">{formatINR(2400)}</p>
          </div>
          <Badge variant="simulated">Simulated</Badge>
        </div>
        {driver.cohort === 'sakhi' ? (
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            <p className="text-sm font-semibold text-cream/80">Yatra Sakhi safety incentive</p>
            <Badge variant="sakhi">Eligible</Badge>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
