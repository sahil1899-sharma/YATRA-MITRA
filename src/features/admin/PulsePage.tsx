import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download } from 'lucide-react';
import { PULSE_SEED } from '../../data/pulse';
import { useAppStore } from '../../store/useAppStore';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Reveal from '../../components/Reveal';
import CountUp from '../../components/CountUp';
import SimulatedBanner from '../../components/SimulatedBanner';

const SAFFRON = '#E8890C';
const AMBER = '#D98E04';
const EMERALD = '#1E8E5A';
const CREAM_DIM = 'rgba(255,248,236,0.55)';
const GRID = 'rgba(255,255,255,0.08)';

const tooltipStyle = {
  background: '#1d0f16',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 12,
  color: '#FFF8EC',
};

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function Kpi({
  label,
  count,
  format,
  sub,
  simulated,
  live,
  index = 0,
}: {
  label: string;
  count: number;
  format?: (n: number) => string;
  sub?: string;
  simulated?: boolean;
  live?: boolean;
  index?: number;
}) {
  return (
    <Reveal delay={Math.min(index * 0.06, 0.42)}>
      <Card className="card-lift !p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-cream/50">
            {live ? <span className="pulse-dot" aria-hidden="true" /> : null}
            {label}
          </p>
          {simulated ? <Badge variant="simulated">Simulated</Badge> : null}
        </div>
        <p className="mt-2 font-display text-3xl font-bold text-cream">
          <CountUp value={count} format={format} />
        </p>
        {sub ? <p className="mt-1 text-xs text-cream/50">{sub}</p> : null}
      </Card>
    </Reveal>
  );
}

export default function PulsePage() {
  const trips = useAppStore((s) => s.trips);
  const drivers = useAppStore((s) => s.drivers);

  const tripsToday = PULSE_SEED.baseTripsToday + trips.filter((t) => isToday(t.createdAt)).length;
  const activeDrivers = drivers.filter((d) => d.verificationStatus === 'badged' && d.online).length;
  const verifiedMitras = drivers.filter((d) => d.verificationStatus === 'badged').length;

  // Yatra Sakhi utilization — live: share of today's trips handled by Sakhi-cohort drivers.
  const todayTrips = trips.filter((t) => isToday(t.createdAt));
  const sakhiToday = todayTrips.filter(
    (t) => drivers.find((d) => d.mitraId === t.driverMitraId)?.cohort === 'sakhi',
  ).length;
  const sakhiUtilPct = todayTrips.length > 0 ? Math.round((sakhiToday / todayTrips.length) * 100) : null;

  const funnel = PULSE_SEED.funnel;
  const boarded = funnel[2].value;
  const bookings = funnel[0].value;
  const conversionPct = ((boarded / bookings) * 100).toFixed(1);

  const donutColors = [SAFFRON, AMBER, EMERALD];

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* screen view */}
      <div className="print:hidden">
        <SimulatedBanner />
        <h1 className="mt-4 font-display text-2xl font-bold text-cream md:text-3xl">
          Jammu Tourism Pulse
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-cream/60">
          Anonymised, aggregated tourist-flow view for J&amp;K Tourism, JSCL, JKCCC and RTO.
        </p>

        {/* 1 — KPI cards */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-3">
          <Kpi index={0} label="Trips today" count={tripsToday} sub="Seed baseline + live bookings" simulated live />
          <Kpi index={1} label="Active drivers" count={activeDrivers} sub="Badged and online now" />
          <Kpi index={2} label="Verified Mitras" count={verifiedMitras} sub="Across the cooperative" />
          <Kpi index={3} label="Missed or declined rides" count={PULSE_SEED.missedOrDeclined} simulated />
          <Kpi index={4} label="Women/senior share" count={PULSE_SEED.womenSeniorShare} format={(n) => `${Math.round(n)}%`} sub="Of all riders" simulated />
          <Kpi index={5} label="CO₂ saved (est.)" count={PULSE_SEED.co2SavedKg} format={(n) => `${Math.round(n)} kg`} sub="Vs. private cars" simulated />
          <Kpi
            index={6}
            label="Repeat-circuit rate"
            count={PULSE_SEED.repeatCircuitRatePct}
            format={(n) => `${Math.round(n)}%`}
            sub="Riders who booked again"
            simulated
          />
          <Reveal delay={0.42}>
            <Card className="card-lift !p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cream/50">
                  Yatra Sakhi utilization
                </p>
              </div>
              <p className="mt-2 font-display text-3xl font-bold text-cream">
                {sakhiUtilPct === null ? (
                  '—'
                ) : (
                  <CountUp value={sakhiUtilPct} format={(n) => `${Math.round(n)}%`} />
                )}
              </p>
              <p className="mt-1 text-xs text-cream/50">
                {sakhiUtilPct === null
                  ? 'No trips yet today'
                  : `${sakhiToday} of ${todayTrips.length} trip${todayTrips.length === 1 ? '' : 's'} by Sakhi drivers`}
              </p>
            </Card>
          </Reveal>
        </div>

        {/* 2 — hero: ropeway story */}
        <div className="mt-6 grid gap-2.5 lg:grid-cols-2">
          <Reveal>
          <Card className="h-full">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-cream">
                Ropeway conversion funnel
              </h2>
              <Badge variant="simulated">Simulated</Badge>
            </div>
            <p className="mt-0.5 text-xs text-cream/50">{PULSE_SEED.funnelNote}</p>
            <p className="mt-3 font-display text-xl font-bold text-saffron">
              {conversionPct}% of C1 riders boarded the ropeway
            </p>
            <div className="mt-2 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnel} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 8 }}>
                  <CartesianGrid stroke={GRID} horizontal={false} />
                  <XAxis type="number" tick={{ fill: CREAM_DIM, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    width={150}
                    tick={{ fill: CREAM_DIM, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill={SAFFRON} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          </Reveal>

          <Reveal delay={0.1}>
          <Card className="h-full">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-cream">
                Ropeway riders brought by Yatra Mitra per day
              </h2>
              <Badge variant="simulated">Simulated</Badge>
            </div>
            <p className="mt-0.5 text-xs text-cream/50">Last 14 days</p>
            <div className="mt-2 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PULSE_SEED.dailyMitraRopewayRiders} margin={{ top: 12, right: 12, bottom: 0, left: -14 }}>
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: CREAM_DIM, fontSize: 11 }} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={{ fill: CREAM_DIM, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <ReferenceLine
                    y={PULSE_SEED.ropewayBaseline}
                    stroke={AMBER}
                    strokeDasharray="6 4"
                    label={{
                      value: PULSE_SEED.ropewayBaselineLabel,
                      fill: AMBER,
                      fontSize: 11,
                      position: 'insideTopLeft',
                    }}
                  />
                  <Line type="monotone" dataKey="riders" stroke={SAFFRON} strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          </Reveal>
        </div>

        {/* 3 + 4 — demand donut & origins */}
        <div className="mt-2.5 grid gap-2.5 lg:grid-cols-2">
          <Reveal>
          <Card className="h-full">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-cream">Circuit demand</h2>
              <Badge variant="simulated">Simulated</Badge>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={PULSE_SEED.circuitDemand} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {PULSE_SEED.circuitDemand.map((_, i) => (
                      <Cell key={i} fill={donutColors[i % donutColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Share']} />
                  <Legend wrapperStyle={{ color: '#FFF8EC', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
          </Reveal>

          <Reveal delay={0.1}>
          <Card className="h-full">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-cream">Where visitors come from</h2>
              <Badge variant="simulated">Simulated</Badge>
            </div>
            <div className="mt-2 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PULSE_SEED.originMix} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 8 }}>
                  <CartesianGrid stroke={GRID} horizontal={false} />
                  <XAxis type="number" tick={{ fill: CREAM_DIM, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="origin" width={110} tick={{ fill: CREAM_DIM, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Share']} />
                  <Bar dataKey="share" fill={AMBER} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          </Reveal>
        </div>

        {/* 5 — dwell time */}
        <Reveal>
        <Card className="mt-2.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-cream">Dwell time per stop</h2>
            <Badge variant="simulated">Simulated</Badge>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.14em] text-cream/45">
                  <th className="py-2 pr-4 font-bold">Stop</th>
                  <th className="py-2 font-bold">Average dwell</th>
                </tr>
              </thead>
              <tbody>
                {PULSE_SEED.dwellMinutes.map((d) => (
                  <tr key={d.stop} className="border-b border-white/5 last:border-0">
                    <td className="py-2 pr-4 text-cream/80">{d.stop}</td>
                    <td className="py-2 font-display font-bold text-cream">{d.minutes} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        </Reveal>

        {/* 6 — report */}
        <div className="mt-4">
          <Button onClick={() => window.print()}>
            <Download size={16} aria-hidden="true" />
            Download monthly report
          </Button>
          <p className="mt-3 border-t border-white/10 pt-3 text-xs text-cream/45">
            No individual passenger is tracked.
          </p>
        </div>
      </div>

      {/* print-only report */}
      <div className="hidden print:block print:bg-white print:p-8">
        <h1 className="font-display text-2xl font-bold text-black">
          Jammu Tourism Pulse — Monthly report (Simulated)
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Anonymised, aggregated tourist-flow view for J&amp;K Tourism, JSCL, JKCCC and RTO.
        </p>
        <h2 className="mt-6 font-display text-lg font-bold text-black">Key figures</h2>
        <table className="mt-2 w-full text-left text-sm">
          <tbody>
            {[
              ['Trips today', `${tripsToday} (seed baseline + live bookings)`],
              ['Active drivers', `${activeDrivers} (badged and online)`],
              ['Verified Mitras', String(verifiedMitras)],
              ['Missed or declined rides', String(PULSE_SEED.missedOrDeclined)],
              ['Women/senior share', `${PULSE_SEED.womenSeniorShare}% of all riders`],
              ['CO₂ saved (est.)', `${PULSE_SEED.co2SavedKg} kg vs. private cars`],
              ['Repeat-circuit rate', `${PULSE_SEED.repeatCircuitRatePct}% of riders booked again (simulated)`],
              [
                'Yatra Sakhi utilization',
                sakhiUtilPct === null
                  ? 'No trips yet today'
                  : `${sakhiUtilPct}% — ${sakhiToday} of ${todayTrips.length} trips by Sakhi drivers`,
              ],
            ].map(([k, v]) => (
              <tr key={k} className="border-b border-neutral-300">
                <td className="py-2 pr-4 font-semibold text-black">{k}</td>
                <td className="py-2 text-neutral-700">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2 className="mt-6 font-display text-lg font-bold text-black">
          Ropeway conversion funnel — {PULSE_SEED.funnelNote}
        </h2>
        <p className="mt-1 text-sm font-bold text-neutral-800">
          {conversionPct}% of C1 riders boarded the ropeway
        </p>
        <table className="mt-2 w-full text-left text-sm">
          <tbody>
            {funnel.map((f) => (
              <tr key={f.stage} className="border-b border-neutral-300">
                <td className="py-2 pr-4 text-neutral-800">{f.stage}</td>
                <td className="py-2 font-bold text-black">{f.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-6 text-xs text-neutral-500">
          Simulated sample data — for demonstration. No individual passenger is tracked.
        </p>
      </div>
    </div>
  );
}
