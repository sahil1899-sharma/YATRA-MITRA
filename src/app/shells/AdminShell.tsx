import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import PageTransition from '../../components/PageTransition';
import { BarChart3, RotateCcw, ShieldCheck } from 'lucide-react';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import StorageGuard from '../../components/StorageGuard';
import AppBackdrop from '../../components/AppBackdrop';
import { useAppStore } from '../../store/useAppStore';

function sidebarLinkClass({ isActive }: { isActive: boolean }): string {
  return `flex min-h-[44px] items-center gap-3 rounded-card px-4 text-[15px] font-semibold ${
    isActive ? 'bg-saffron text-ink shadow-glow' : 'text-cream/65 hover:bg-white/10 hover:text-cream'
  }`;
}

function mobileLinkClass({ isActive }: { isActive: boolean }): string {
  return `rounded-full px-3 py-2 text-sm font-semibold ${
    isActive ? 'bg-saffron text-ink' : 'bg-white/10 text-cream/65'
  }`;
}

export default function AdminShell() {
  const resetDemo = useAppStore((s) => s.resetDemo);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const doReset = () => {
    resetDemo();
    setConfirmOpen(false);
    setToast('Demo data has been reset.');
  };

  return (
    <div className="relative flex min-h-dvh bg-night/60">
      <AppBackdrop
        videoSrc="/video/portal-ambient.mp4"
        posterSrc="/video/portal-ambient-poster.jpg"
      />
      <StorageGuard />
      <aside className="relative hidden w-64 shrink-0 flex-col border-r border-white/10 bg-night-soft/80 p-4 backdrop-blur-md md:flex print:hidden">
        <Link to="/" className="px-2 py-3 font-display text-base font-bold text-cream transition-colors hover:text-saffron" aria-label="Yatra Mitra home">
          Yatra Mitra
        </Link>
        <nav className="flex flex-col gap-1" aria-label="Admin">
          <NavLink to="/a" end className={sidebarLinkClass}>
            <BarChart3 size={18} aria-hidden="true" />
            Tourism Pulse
          </NavLink>
          <NavLink to="/a/verification" className={sidebarLinkClass}>
            <ShieldCheck size={18} aria-hidden="true" />
            Verification queue
          </NavLink>
        </nav>
      </aside>

      <div className="relative flex min-h-dvh flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 bg-night-soft/80 px-4 py-3 backdrop-blur-md md:px-8 print:hidden">
          <div>
            <h1 className="font-display text-lg font-bold text-cream">Jammu Tourism Pulse</h1>
            <nav className="mt-2 flex gap-2 md:hidden" aria-label="Admin">
              <NavLink to="/a" end className={mobileLinkClass}>
                Tourism Pulse
              </NavLink>
              <NavLink to="/a/verification" className={mobileLinkClass}>
                Verification queue
              </NavLink>
            </nav>
          </div>
          <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
            <RotateCcw size={16} aria-hidden="true" />
            Reset demo data
          </Button>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8">
          <PageTransition />
        </main>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Reset demo data">
        <p className="text-sm text-cream/70">
          This restores the original driver list and clears all trips and incidents created so far.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={doReset}>
            Reset
          </Button>
        </div>
      </Modal>

      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
