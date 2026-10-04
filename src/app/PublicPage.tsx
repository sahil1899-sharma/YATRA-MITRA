import { Outlet } from 'react-router-dom';
import SwitchViewPill from './shells/SwitchViewPill';

// Minimal centred wrapper for public link pages (badge verification, live share).
export default function PublicPage() {
  return (
    <div className="bg-jaali-dark flex min-h-dvh items-center justify-center bg-night p-4">
      <div className="w-full max-w-md">
        <p className="mb-4 text-center font-display text-base font-bold text-cream">Yatra Mitra</p>
        <Outlet />
      </div>
      <SwitchViewPill />
    </div>
  );
}
