import { useRef } from 'react';
import type { ReactNode } from 'react';

// Pointer-tracked 3D tilt with a specular glare sweep. Dependency-free CSS 3D.
// Disabled automatically when the user prefers reduced motion or on touch
// devices (no hover). Transform is written straight to the DOM — no re-renders.
export default function TiltCard({
  children,
  className = '',
  max = 9,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const setTilt = (rx: number, ry: number, gx: number, gy: number, on: boolean) => {
    const card = cardRef.current;
    const stage = stageRef.current;
    if (!card || !stage) return;
    card.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(${
      on ? -5 : 0
    }px)`;
    card.style.setProperty('--gx', `${gx.toFixed(1)}%`);
    card.style.setProperty('--gy', `${gy.toFixed(1)}%`);
    card.style.setProperty('--go', on ? '1' : '0');
    stage.classList.toggle('tilting', on);
  };

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt((0.5 - py) * max * 2, (px - 0.5) * max * 2, px * 100, py * 100, true);
  };

  const onLeave = () => setTilt(0, 0, 50, 50, false);

  return (
    <div ref={stageRef} className="tilt-stage" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div ref={cardRef} className={`tilt-card relative ${className}`}>
        {children}
        <span className="tilt-glare" aria-hidden="true" />
      </div>
    </div>
  );
}
