import type { CircuitId } from '../types';

// Cinematic photographic banner art per circuit. The image drifts in a slow
// Ken Burns move; a night gradient keeps overlaid text legible.
const SRC: Record<CircuitId, string> = {
  C1: '/banners/c1.jpg',
  C2: '/banners/c2.jpg',
  C6: '/banners/c6.jpg',
};

export default function CircuitBanner({
  circuitId,
  className = '',
}: {
  circuitId: CircuitId;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-night-soft ${className}`} aria-hidden="true">
      <img
        src={SRC[circuitId]}
        alt=""
        draggable={false}
        className="kenburns img-in h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-night/10" />
    </div>
  );
}
