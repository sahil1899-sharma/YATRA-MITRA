import PageTransition from '../components/PageTransition';
import SwitchViewPill from './shells/SwitchViewPill';
import AppBackdrop from '../components/AppBackdrop';

// Minimal centred wrapper for public link pages (badge verification, live share).
export default function PublicPage() {
  return (
    <div className="bg-jaali-dark relative flex min-h-dvh items-center justify-center bg-night/60 p-4">
      <AppBackdrop />
      <div className="relative w-full max-w-md">
        <p className="mb-4 text-center font-display text-base font-bold text-cream">Yatra Mitra</p>
        <PageTransition />
      </div>
      <SwitchViewPill />
    </div>
  );
}
