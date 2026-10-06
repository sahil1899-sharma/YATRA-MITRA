import { useState } from 'react';
import PageTransition from '../../components/PageTransition';
import { CircleHelp, Home, Phone, Ticket } from 'lucide-react';
import ResponsiveShell from './ResponsiveShell';
import type { TabItem } from './TabBar';
import SwitchViewPill from './SwitchViewPill';
import StorageGuard from '../../components/StorageGuard';
import Modal from '../../components/Modal';
import { EMERGENCY, HELPLINE } from '../../data/constants';

const TABS: TabItem[] = [
  { to: '/p', label: 'Home', icon: Home, end: true },
  { to: '/p/trips', label: 'My trips', icon: Ticket },
];

export default function PassengerShell() {
  const [helpOpen, setHelpOpen] = useState(false);
  const tabs: TabItem[] = [...TABS, { label: 'Help', icon: CircleHelp, onClick: () => setHelpOpen(true) }];

  return (
    <ResponsiveShell
      title="Yatra Mitra"
      tabs={tabs}
      videoSrc="/video/portal-passenger.mp4"
      posterSrc="/video/portal-passenger-poster.jpg"
    >
      <StorageGuard />
      <PageTransition />

      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Need help?">
        <p className="text-sm text-cream/70">
          The tourism helpline and emergency number are available round the clock.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <a
            href={`tel:${HELPLINE}`}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-card bg-maroon px-5 text-[15px] font-semibold text-cream"
          >
            <Phone size={16} aria-hidden="true" />
            Tourism helpline: {HELPLINE}
          </a>
          <a
            href={`tel:${EMERGENCY}`}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-card bg-alert px-5 text-[15px] font-semibold text-white"
          >
            <Phone size={16} aria-hidden="true" />
            Emergency: {EMERGENCY}
          </a>
        </div>
      </Modal>

      <SwitchViewPill />
    </ResponsiveShell>
  );
}
