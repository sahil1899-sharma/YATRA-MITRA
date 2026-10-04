import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';

// Floating pill, desktop only, that returns to the launcher from any interface.
export default function SwitchViewPill() {
  const { pathname } = useLocation();
  if (pathname === '/') return null;
  return (
    <Link
      to="/"
      className="fixed bottom-4 left-4 z-40 hidden min-h-[44px] items-center gap-2 rounded-full border border-white/15 bg-night-soft/90 px-4 py-3 text-sm font-semibold text-cream shadow-[0_18px_50px_rgba(0,0,0,0.5)] backdrop-blur-md transition hover:border-saffron/50 hover:text-saffron md:inline-flex"
    >
      <LayoutGrid size={16} aria-hidden="true" />
      Switch view
    </Link>
  );
}
