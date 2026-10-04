import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { VerificationStatus } from '../../types';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

const STEPS: { key: VerificationStatus; label: string }[] = [
  { key: 'applied', label: 'Applied' },
  { key: 'documents', label: 'Documents' },
  { key: 'police_check', label: 'Police check' },
  { key: 'training', label: 'Training' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'badged', label: 'Badged' },
];

// The action records the evidence that completes the driver's current step.
const STEP_ACTION: Record<Exclude<VerificationStatus, 'badged'>, { label: string; toast: string }> = {
  applied: { label: 'Mark documents received', toast: 'Documents received' },
  documents: { label: 'Record police verification', toast: 'Police verification recorded' },
  police_check: { label: 'Mark training complete', toast: 'Training marked complete' },
  training: { label: 'Record assessment passed', toast: 'Assessment passed' },
  assessment: { label: 'Approve & issue badge', toast: 'Badge issued' },
};

function Stepper({ current }: { current: VerificationStatus }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-1" aria-label={`Step ${idx + 1} of 6: ${STEPS[idx].label}`}>
      {STEPS.map((s, i) => (
        <span
          key={s.key}
          title={s.label}
          className={`h-2 flex-1 rounded-full ${i <= idx ? 'bg-saffron' : 'bg-white/15'}`}
        />
      ))}
    </div>
  );
}

export default function VerificationPage() {
  const drivers = useAppStore((s) => s.drivers);
  const incidents = useAppStore((s) => s.incidents);
  const advanceDriverVerification = useAppStore((s) => s.advanceDriverVerification);
  const badgeDriver = useAppStore((s) => s.badgeDriver);
  const updateIncident = useAppStore((s) => s.updateIncident);

  const [recentlyBadged, setRecentlyBadged] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const queue = drivers.filter((d) => d.verificationStatus !== 'badged');
  const fresh = recentlyBadged
    .map((id) => drivers.find((d) => d.mitraId === id))
    .filter((d) => d !== undefined);

  const act = (mitraId: string, name: string, step: VerificationStatus) => {
    if (step === 'badged') return;
    if (step === 'assessment') {
      badgeDriver(mitraId);
      setRecentlyBadged((r) => (r.includes(mitraId) ? r : [...r, mitraId]));
    } else {
      advanceDriverVerification(mitraId);
    }
    setToast(`${name}: ${STEP_ACTION[step].toast}.`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="font-display text-2xl font-bold text-cream">Verification queue</h1>
      <p className="mt-1 text-sm text-cream/60">
        Walk each applicant through the six trust-stack steps. Sample profiles — not real people.
      </p>

      <Card className="mt-4 !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.14em] text-cream/45">
                <th className="px-4 py-3 font-bold">Mitra ID</th>
                <th className="px-4 py-3 font-bold">Name</th>
                <th className="px-4 py-3 font-bold">Cohort</th>
                <th className="px-4 py-3 font-bold">Current step</th>
                <th className="px-4 py-3 font-bold">Step progress</th>
                <th className="px-4 py-3 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((d) => {
                const stepLabel = STEPS.find((s) => s.key === d.verificationStatus)?.label ?? d.verificationStatus;
                const action = d.verificationStatus === 'badged' ? null : STEP_ACTION[d.verificationStatus];
                return (
                  <tr key={d.mitraId} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 font-mono text-[13px] text-cream/80">{d.mitraId}</td>
                    <td className="px-4 py-3 font-semibold text-cream">{d.name}</td>
                    <td className="px-4 py-3">
                      {d.cohort === 'sakhi' ? <Badge variant="sakhi">Yatra Sakhi</Badge> : <span className="text-cream/55">Standard</span>}
                    </td>
                    <td className="px-4 py-3 text-cream/75">{stepLabel}</td>
                    <td className="px-4 py-3">
                      <div className="w-36">
                        <Stepper current={d.verificationStatus} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {action ? (
                        <Button
                          onClick={() => act(d.mitraId, d.name, d.verificationStatus)}
                          className="!px-4 !py-2 !text-[13px]"
                        >
                          {action.label}
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-cream/55">
                    Every applicant is badged. The queue is clear.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      {fresh.length > 0 ? (
        <div className="mt-6">
          <h2 className="font-display text-lg font-bold text-cream">Recently badged</h2>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {fresh.map((d) => (
              <Card key={d.mitraId} className="!p-4 border-verified/30">
                <p className="flex items-center gap-2 font-display text-base font-bold text-cream">
                  <BadgeCheck size={18} className="text-emerald-300" aria-hidden="true" />
                  {d.name}
                </p>
                <p className="mt-0.5 font-mono text-xs text-cream/55">{d.mitraId} · now online</p>
                <Link
                  to={`/verify/${d.mitraId}`}
                  className="mt-2 inline-block text-sm font-semibold text-saffron hover:underline"
                >
                  View badge →
                </Link>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {/* incidents */}
      <div className="mt-8">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-cream">
          <ShieldCheck size={18} className="text-saffron" aria-hidden="true" />
          Incidents
        </h2>
        {incidents.length === 0 ? (
          <Card className="mt-3 text-center">
            <p className="text-sm text-cream/60">No incidents reported yet.</p>
          </Card>
        ) : (
          <Card className="mt-3 !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.14em] text-cream/45">
                    <th className="px-4 py-3 font-bold">Type</th>
                    <th className="px-4 py-3 font-bold">Trip</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold">Escalated to</th>
                    <th className="px-4 py-3 font-bold">Time</th>
                    <th className="px-4 py-3 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...incidents].reverse().map((i) => (
                    <tr key={i.id} className="border-b border-white/5 last:border-0">
                      <td className="px-4 py-3 font-semibold text-cream">{i.type}</td>
                      <td className="px-4 py-3 font-mono text-[13px] text-cream/70">{i.tripId ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={i.status === 'resolved' ? 'verified' : i.status === 'escalated' ? 'alert' : 'simulated'}>
                          {i.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-cream/70">{i.escalatedTo ?? '—'}</td>
                      <td className="px-4 py-3 text-cream/55">
                        {new Date(i.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {i.status !== 'resolved' ? (
                          <Button
                            variant="ghost"
                            onClick={() => {
                              updateIncident(i.id, { status: 'resolved' });
                              setToast(`Incident ${i.id} marked resolved.`);
                            }}
                            className="!px-4 !py-2 !text-[13px]"
                          >
                            Mark resolved
                          </Button>
                        ) : (
                          <span className="text-xs text-cream/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
