import type { SceneMood } from './CinematicScene';

// App-wide backdrop: either the photographic panorama (subtle Ken Burns drift)
// or — when a video is supplied — a cinematic video background with a poster
// frame. Video is dimmed under a night gradient so content stays legible.
// Reduced-motion and print fall back to the still poster. Hidden in print
// (kiosk receipts).
const SRC: Record<SceneMood, string> = {
  dawn: '/scenes/dawn.jpg',
  dusk: '/scenes/dusk.jpg',
};

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function AppBackdrop({
  mood = 'dusk',
  videoSrc,
  posterSrc,
}: {
  mood?: SceneMood;
  videoSrc?: string;
  posterSrc?: string;
}) {
  const poster = posterSrc ?? SRC[mood];
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden print:hidden"
      aria-hidden="true"
    >
      {videoSrc && !prefersReducedMotion ? (
        <video
          className="h-full w-full object-cover opacity-40"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={poster}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        <img
          src={poster}
          alt=""
          draggable={false}
          className="kenburns h-full w-full object-cover opacity-45"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-night/80 via-night/50 to-night/90" />
    </div>
  );
}
