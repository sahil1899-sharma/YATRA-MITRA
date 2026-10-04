import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../../components/PageTransition';
import SwitchViewPill from './SwitchViewPill';
import StorageGuard from '../../components/StorageGuard';
import AppBackdrop from '../../components/AppBackdrop';
import { KIOSK_IDLE_TIMEOUT_MS } from '../../lib/kiosk';

export default function KioskShell() {
  const navigate = useNavigate();
  const timer = useRef<number | null>(null);
  const printing = useRef(false);

  useEffect(() => {
    const arm = () => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        // Return to the idle screen and discard unsaved input (the booking
        // page unmounts, so its form state is dropped).
        if (!printing.current) navigate('/k', { state: { kioskIdleReset: Date.now() } });
      }, KIOSK_IDLE_TIMEOUT_MS);
    };
    const onBeforePrint = () => {
      printing.current = true;
    };
    const onAfterPrint = () => {
      printing.current = false;
      arm();
    };
    arm();
    window.addEventListener('pointerdown', arm);
    window.addEventListener('keydown', arm);
    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      window.removeEventListener('pointerdown', arm);
      window.removeEventListener('keydown', arm);
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, [navigate]);

  return (
    <div className="bg-jaali-dark relative min-h-dvh bg-night/60 print:bg-white">
      <AppBackdrop />
      <StorageGuard />
      <header className="relative border-b border-white/10 bg-night-soft/80 px-8 py-5 backdrop-blur-md print:hidden">
        <h1 className="font-display text-2xl font-bold text-cream">Yatra Mitra Kendra — Jammu Tawi</h1>
        <p className="mt-1 text-base text-cream/60">Fixed fares. Verified drivers. No bargaining.</p>
      </header>
      <main className="relative mx-auto max-w-6xl px-8 py-8 text-lg">
        <PageTransition />
      </main>
      <div className="print:hidden">
        <SwitchViewPill />
      </div>
    </div>
  );
}
