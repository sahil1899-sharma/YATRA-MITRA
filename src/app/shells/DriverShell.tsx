import { useEffect, useState } from 'react';
import PageTransition from '../../components/PageTransition';
import { BookOpen, CalendarCheck, ChevronDown, User, Wallet, X } from 'lucide-react';
import ResponsiveShell from './ResponsiveShell';
import type { TabItem } from './TabBar';
import SwitchViewPill from './SwitchViewPill';
import StorageGuard from '../../components/StorageGuard';
import { useAppStore } from '../../store/useAppStore';

const TABS: TabItem[] = [
  { to: '/d', label: 'Today', icon: CalendarCheck, end: true },
  { to: '/d/earnings', label: 'Earnings', icon: Wallet },
  { to: '/d/learn', label: 'Learn', icon: BookOpen },
  { to: '/d/profile', label: 'Profile', icon: User },
];

function SignInSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const drivers = useAppStore((s) => s.drivers);
  const setActiveDriver = useAppStore((s) => s.setActiveDriver);
  if (!open) return null;

  const badged = drivers.filter((d) => d.verificationStatus === 'badged');
  const pending = drivers.filter((d) => d.verificationStatus !== 'badged');

  const choose = (mitraId: string, isBadged: boolean) => {
    if (!isBadged) return;
    setActiveDriver(mitraId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="glass scroll-dark max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-card p-5 md:rounded-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Sign in as a Mitra driver"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-cream">Sign in as</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-cream/60 hover:bg-white/10 hover:text-cream"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {badged.map((d) => (
            <button
              key={d.mitraId}
              type="button"
              onClick={() => choose(d.mitraId, true)}
              className="flex items-center gap-3 rounded-card border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-saffron/50"
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-saffron to-[#c96f06] text-sm font-bold text-ink"
              >
                {d.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-bold text-cream">{d.name}</span>
                <span className="block text-xs text-cream/55">Mitra ID {d.mitraId}</span>
              </span>
              <ChevronDown size={18} aria-hidden="true" className="-rotate-90 text-cream/40" />
            </button>
          ))}
        </div>

        {pending.length > 0 ? (
          <>
            <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-cream/45">
              Not yet verified
            </p>
            <div className="flex flex-col gap-2">
              {pending.map((d) => (
                <div
                  key={d.mitraId}
                  aria-disabled="true"
                  className="flex cursor-not-allowed items-center gap-3 rounded-card border border-white/5 bg-white/[0.02] p-3 opacity-50"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-cream/50"
                  >
                    {d.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold text-cream/70">{d.name}</span>
                    <span className="block text-xs text-cream/45">
                      Mitra ID {d.mitraId} · Verification pending — cannot take trips
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function DriverShell() {
  const activeDriverMitraId = useAppStore((s) => s.activeDriverMitraId);
  const driver = useAppStore((s) => s.drivers.find((d) => d.mitraId === activeDriverMitraId));
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!activeDriverMitraId) setSheetOpen(true);
  }, [activeDriverMitraId]);

  return (
    <ResponsiveShell title="Mitra Saarthi" tabs={TABS}>
      <StorageGuard />
      {/* driver chip */}
      <div className="border-b border-white/10 bg-night-soft/60 px-4 py-2 md:px-2">
        <div className="mx-auto w-full max-w-6xl">
          {driver ? (
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] py-1.5 pl-1.5 pr-3 transition hover:border-saffron/50"
              aria-label={`Signed in as ${driver.name}. Switch driver.`}
            >
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-saffron to-[#c96f06] text-[11px] font-bold text-ink"
              >
                {driver.initials}
              </span>
              <span className="text-xs font-bold text-cream">{driver.name}</span>
              <span className="text-[11px] text-cream/50">{driver.mitraId}</span>
              <ChevronDown size={14} aria-hidden="true" className="text-cream/50" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex min-h-[44px] items-center rounded-full border border-saffron/50 bg-saffron/15 px-4 py-1.5 text-xs font-bold text-saffron transition hover:bg-saffron/25"
            >
              Sign in as a driver
            </button>
          )}
        </div>
      </div>

      <PageTransition />
      <SwitchViewPill />
      <SignInSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </ResponsiveShell>
  );
}
