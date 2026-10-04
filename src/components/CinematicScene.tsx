// Cinematic photographic backdrop — a real Jammu panorama in two moods:
// dawn (maroon-to-gold sunrise over the fort and river) and dusk (indigo
// twilight, city lights, ember horizon). The image drifts in a slow Ken Burns
// move for a living, filmic feel. Respects prefers-reduced-motion (still).
export type SceneMood = 'dawn' | 'dusk';

const SRC: Record<SceneMood, string> = {
  dawn: '/scenes/dawn.jpg',
  dusk: '/scenes/dusk.jpg',
};

export default function CinematicScene({
  className = '',
  mood = 'dawn',
}: {
  className?: string;
  mood?: SceneMood;
}) {
  return (
    <div className={`overflow-hidden ${className}`} aria-hidden="true">
      <img
        src={SRC[mood]}
        alt=""
        draggable={false}
        className="kenburns h-full w-full object-cover"
      />
    </div>
  );
}
