import { TriangleAlert } from 'lucide-react';

export default function SimulatedBanner() {
  return (
    <div className="flex items-center gap-2 rounded-card border border-amber/50 bg-amber/15 px-4 py-3 text-sm font-medium text-amber">
      <TriangleAlert size={18} aria-hidden="true" />
      <span>Simulated data — for demonstration</span>
    </div>
  );
}
