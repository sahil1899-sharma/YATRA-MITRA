import type { SceneMood } from './CinematicScene';

// App-wide photographic backdrop: the Jammu dusk panorama, dimmed under a
// night gradient so it adds depth without fighting text. Drop it as the first
// child of a `relative` shell; give the content that follows `relative` so it
// paints above. Hidden in print (kiosk receipts).
const SRC: Record<SceneMood, string> = {
  dawn: '/scenes/dawn.jpg',
  dusk: '/scenes/dusk.jpg',
};

export default function AppBackdrop({ mood = 'dusk' }: { mood?: SceneMood }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden print:hidden"
      aria-hidden="true"
    >
      <img
        src={SRC[mood]}
        alt=""
        draggable={false}
        className="kenburns h-full w-full object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-night/75 via-night/45 to-night/85" />
    </div>
  );
}
