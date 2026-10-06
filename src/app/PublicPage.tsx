import PageTransition from '../components/PageTransition';
import AppBackdrop from '../components/AppBackdrop';

// Minimal centred wrapper for public link pages (badge verification, live share).
export default function PublicPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-night/60 p-4">
      <AppBackdrop />
      <div className="relative w-full max-w-md">
        <p className="mb-4 text-center font-display text-base font-bold text-cream">Yatra Mitra</p>
        <PageTransition />
      </div>
    </div>
  );
}
