import { useEffect, useMemo, useRef, useState } from 'react';
import type { Stop } from '../types';

// Interactive illustrated map of Jammu. No tiles, no external requests —
// the Tawi's curve, the old-city cluster, Bahu Fort's east-bank plateau,
// the station and the ropeway river-crossing are drawn from the city's
// real geography. Positions are illustrative, not surveyed.
//
// Modes:
// - default: self-driving rickshaw preview with zoom/pan and stop popups.
// - progress (number 0–100): the marker is driven externally (ride / live
//   share); the auto-drive loop and its play button are disabled.
// - readOnly: no pan, zoom, controls or popups (public live-share page).
interface Pt {
  x: number;
  y: number;
}

const GEO: Record<string, Pt> = {
  s_kiosk: { x: 330, y: 518 },
  s_bahu: { x: 545, y: 292 },
  s_ropeway: { x: 472, y: 252 },
  s_mahamaya: { x: 398, y: 208 },
  s_riverfront: { x: 402, y: 332 },
  s_ghat: { x: 372, y: 422 },
  s_mubarak: { x: 328, y: 148 },
  s_raghunath: { x: 298, y: 192 },
  s_ranbir: { x: 362, y: 232 },
  s_lanes: { x: 392, y: 178 },
  s_lightsound: { x: 562, y: 322 },
  s_boating: { x: 350, y: 462 },
};

const RIVER =
  'M 618 -20 C 566 70 524 132 494 202 C 464 272 444 332 414 402 C 386 468 356 542 334 620';

function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x} ${p2.y}`;
  }
  return d;
}

interface Transform {
  k: number;
  x: number;
  y: number;
}

const DWELL_MS = 1100;
const TRAVEL_MS_PER_PX = 14;

const DEFAULT_CAPTION = 'Illustrated map of Jammu — not to scale. Tap a stop to preview its story.';

export default function JammuMap({
  stops,
  progress = null,
  readOnly = false,
  caption = DEFAULT_CAPTION,
}: {
  stops: Stop[];
  progress?: number | null;
  readOnly?: boolean;
  caption?: string;
}) {
  const pts = useMemo(() => stops.map((s) => GEO[s.id] ?? { x: 400, y: 300 }), [stops]);
  const route = useMemo(() => smoothPath(pts), [pts]);
  const [t, setT] = useState<Transform>({ k: 1, x: 0, y: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const [stopLens, setStopLens] = useState<number[]>([]);
  const [totalLen, setTotalLen] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  const driven = progress !== null && progress !== undefined;

  // Measure the route once so the rickshaw can dwell at real stop positions.
  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const total = p.getTotalLength();
    setTotalLen(total);
    const samples: Pt[] = [];
    const N = 1200;
    for (let i = 0; i <= N; i++) {
      const pt = p.getPointAtLength((total * i) / N);
      samples.push({ x: pt.x, y: pt.y });
    }
    setStopLens(
      pts.map((s) => {
        let best = 0;
        let bestD = Infinity;
        for (let i = 0; i <= N; i++) {
          const dx = samples[i].x - s.x;
          const dy = samples[i].y - s.y;
          const d = dx * dx + dy * dy;
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
        return (total * best) / N;
      }),
    );
  }, [route, pts]);

  // Marker placement: externally driven progress, or the self-driving loop.
  useEffect(() => {
    const p = pathRef.current;
    const marker = markerRef.current;
    if (!p || !marker || totalLen === 0) return;

    if (driven) {
      const clamped = Math.min(100, Math.max(0, progress ?? 0));
      const pt = p.getPointAtLength((clamped / 100) * totalLen);
      marker.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      return;
    }

    if (!playing || stopLens.length === 0) return;
    const travel = totalLen * TRAVEL_MS_PER_PX;
    const cycle = travel + stopLens.length * DWELL_MS;
    let raf = 0;
    const start = performance.now();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const place = (len: number) => {
      // The marker icon is symmetric, so it stays upright — no rotation flip.
      const pt = p.getPointAtLength(Math.min(len, totalLen));
      marker.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
    };

    const tick = (now: number) => {
      const el = (now - start) % cycle;
      // walk the timeline: travel segments interleaved with dwells
      let time = 0;
      let len = 0;
      for (let i = 0; i < stopLens.length; i++) {
        const segLen = i === 0 ? stopLens[0] : stopLens[i] - stopLens[i - 1];
        const segTime = segLen * TRAVEL_MS_PER_PX;
        if (el < time + segTime) {
          len = (i === 0 ? 0 : stopLens[i - 1]) + ((el - time) / segTime) * segLen;
          break;
        }
        time += segTime;
        len = stopLens[i];
        if (el < time + DWELL_MS) break;
        time += DWELL_MS;
      }
      place(len);
      raf = requestAnimationFrame(tick);
    };

    if (reduced) {
      place(0);
      return;
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, totalLen, stopLens, progress, driven]);

  const zoomAt = (fk: number, cx = 400, cy = 300) => {
    setT((prev) => {
      const k = Math.min(3.2, Math.max(1, prev.k * fk));
      const s = k / prev.k;
      return { k, x: cx - (cx - prev.x) * s, y: cy - (cy - prev.y) * s };
    });
  };

  const onWheelNative = useRef<(e: WheelEvent) => void>(() => {});
  onWheelNative.current = (e: WheelEvent) => {
    e.preventDefault();
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = ((e.clientX - rect.left) / rect.width) * 800;
    const cy = ((e.clientY - rect.top) / rect.height) * 600;
    zoomAt(e.deltaY < 0 ? 1.18 : 1 / 1.18, cx, cy);
  };

  useEffect(() => {
    if (readOnly) return;
    const el = wrapRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => onWheelNative.current(e);
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [readOnly]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (readOnly) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: t.x, oy: t.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const sx = 800 / rect.width;
    const sy = 600 / rect.height;
    setT((prev) => ({ ...prev, x: d.ox + (e.clientX - d.sx) * sx, y: d.oy + (e.clientY - d.sy) * sy }));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const selectedStop = !readOnly ? stops.find((s) => s.id === selected) ?? null : null;
  const selectedPt = selected && !readOnly ? GEO[selected] ?? null : null;
  const popupPos =
    selectedPt && wrapRef.current
      ? (() => {
          const rect = wrapRef.current?.getBoundingClientRect();
          if (!rect) return null;
          return {
            left: ((selectedPt.x * t.k + t.x) / 800) * rect.width,
            top: ((selectedPt.y * t.k + t.y) / 600) * rect.height,
          };
        })()
      : null;

  return (
    <figure className="overflow-hidden rounded-card border border-white/10 bg-night-soft">
      <div
        ref={wrapRef}
        className={`relative aspect-[4/3] w-full select-none ${
          readOnly ? '' : 'cursor-grab touch-pan-y active:cursor-grabbing'
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <svg viewBox="0 0 800 600" className="h-full w-full" role="img" aria-label="Illustrated map of Jammu with the circuit route">
          <defs>
            <linearGradient id="ym-river" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#274b6d" />
              <stop offset="0.5" stopColor="#1d3a5f" />
              <stop offset="1" stopColor="#274b6d" />
            </linearGradient>
            <radialGradient id="ym-fort" cx="0.5" cy="0.4" r="0.8">
              <stop offset="0" stopColor="#2b1420" />
              <stop offset="1" stopColor="#180d14" />
            </radialGradient>
          </defs>

          {/* land */}
          <rect width="800" height="600" fill="#120a10" />
          {/* Bahu plateau */}
          <ellipse cx="560" cy="300" rx="150" ry="110" fill="url(#ym-fort)" />
          {/* old-city rise */}
          <ellipse cx="330" cy="190" rx="130" ry="90" fill="#170d13" />

          <g transform={`translate(${t.x} ${t.y}) scale(${t.k})`}>
            {/* Tawi river */}
            <path d={RIVER} fill="none" stroke="#7fb2dd" strokeWidth="46" strokeLinecap="round" opacity="0.14" />
            <path d={RIVER} fill="none" stroke="url(#ym-river)" strokeWidth="32" strokeLinecap="round" opacity="0.95" />
            <path d={RIVER} fill="none" stroke="#9cc8ee" strokeWidth="2" opacity="0.5" />
            <path d={RIVER} fill="none" stroke="#cfe6fa" strokeWidth="1.4" opacity="0.35" strokeDasharray="26 30" />
            {/* bridges */}
            <g stroke="#c9a86a" strokeWidth="5" opacity="0.55" strokeLinecap="round">
              <line x1="408" y1="392" x2="470" y2="368" />
              <line x1="352" y1="500" x2="414" y2="478" />
            </g>
            {/* ropeway cable across the river, cabin gliding back and forth */}
            <line x1="545" y1="292" x2="398" y2="208" stroke="#E8890C" strokeWidth="2.4" strokeDasharray="7 6" opacity="0.8" />
            <g opacity="0.95">
              <rect x="-10" y="-8" width="20" height="13" rx="3.5" fill="#E8890C" />
              <rect x="-6" y="-5" width="12" height="5" rx="1.5" fill="#0B060C" opacity="0.75" />
              <animateMotion
                dur="10s"
                repeatCount="indefinite"
                values="M 545 292 L 398 208; M 398 208 L 545 292"
                keyTimes="0;1"
                calcMode="spline"
                keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
              />
            </g>

            {/* geography labels */}
            <g fontSize="15" fill="#FFF8EC" opacity="0.5" fontStyle="italic">
              <text x="470" y="120" transform="rotate(62 470 120)">Tawi river</text>
            </g>
            <g fontSize="13" fill="#FFF8EC" opacity="0.42" letterSpacing="2">
              <text x="252" y="120">OLD CITY</text>
              <text x="500" y="400">BAHU PLATEAU</text>
              <text x="238" y="560">JAMMU TAWI STATION</text>
            </g>

            {/* route */}
            <path
              ref={pathRef}
              d={route}
              fill="none"
              stroke="#E8890C"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
              style={{ filter: 'drop-shadow(0 0 8px rgba(232,137,12,0.55))' }}
            />
            {/* stops */}
            {stops.map((s, i) => {
              const p = GEO[s.id] ?? { x: 400, y: 300 };
              const active = selected === s.id;
              return (
                <g
                  key={s.id}
                  transform={`translate(${p.x} ${p.y})`}
                  onClick={
                    readOnly
                      ? undefined
                      : (e) => {
                          e.stopPropagation();
                          setSelected(active ? null : s.id);
                        }
                  }
                  className={readOnly ? undefined : 'cursor-pointer'}
                >
                  {active ? (
                    <circle r="20" fill="none" stroke="#E8890C" strokeWidth="2" opacity="0.7">
                      <animate attributeName="r" values="14;22" dur="1.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0.1" dur="1.6s" repeatCount="indefinite" />
                    </circle>
                  ) : null}
                  <circle r="13" fill={active ? '#E8890C' : '#0B060C'} stroke="#E8890C" strokeWidth="2.6" />
                  <text
                    textAnchor="middle"
                    dy="5.5"
                    fontSize="13"
                    fontWeight="800"
                    fill={active ? '#0B060C' : '#E8890C'}
                    pointerEvents="none"
                  >
                    {i + 1}
                  </text>
                </g>
              );
            })}

            {/* travelling e-rickshaw — painted above the stops */}
            <g ref={markerRef}>
              <g transform="translate(0 -16)">
                <rect x="-13" y="-9" width="26" height="14" rx="4" fill="#E8890C" />
                <rect x="-13" y="-13" width="26" height="6" rx="3" fill="#7A1F2B" />
                <circle cx="-8" cy="7" r="4" fill="#0B060C" stroke="#FFF8EC" strokeWidth="1.4" />
                <circle cx="8" cy="7" r="4" fill="#0B060C" stroke="#FFF8EC" strokeWidth="1.4" />
              </g>
            </g>
          </g>

          {/* north arrow */}
          <g transform="translate(758 44)" opacity="0.7">
            <circle r="17" fill="#0B060C" stroke="#FFF8EC" strokeOpacity="0.35" />
            <path d="M0 9 L0 -9 M-5 -3 L0 -9 L5 -3" stroke="#E8890C" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <text y="34" textAnchor="middle" fontSize="11" fill="#FFF8EC" opacity="0.7">N</text>
          </g>
        </svg>

        {/* stop popup */}
        {selectedStop && selectedPt && popupPos ? (
          (() => {
            const estH = 178;
            const above = popupPos.top - 14 - estH > 6;
            return (
              <div
                className="glass absolute z-10 w-56 -translate-x-1/2 rounded-card p-3 shadow-[0_18px_50px_rgba(0,0,0,0.6)]"
                style={{
                  left: Math.min(
                    Math.max(popupPos.left, 118),
                    (wrapRef.current?.clientWidth ?? 300) - 118,
                  ),
                  top: above ? popupPos.top - 14 : popupPos.top + 26,
                  transform: `translate(-50%, ${above ? '-100%' : '0'})`,
                }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-saffron">
                  Stop {stops.findIndex((s) => s.id === selectedStop.id) + 1}
                </p>
                <p className="mt-0.5 text-sm font-bold text-cream">{selectedStop.name}</p>
                {selectedStop.hasStory && selectedStop.storyEn ? (
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-cream/65">
                    <span className="font-semibold text-cream/50">Sample narration — </span>
                    {selectedStop.storyEn}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="mt-2 text-xs font-semibold text-cream/50 underline-offset-2 hover:text-cream hover:underline"
                >
                  Close
                </button>
              </div>
            );
          })()
        ) : null}

        {/* controls */}
        {!readOnly ? (
          <div
            className="absolute bottom-3 right-3 flex flex-col gap-1.5"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {[
              { label: 'Zoom in', onClick: () => zoomAt(1.35), icon: '+' },
              { label: 'Zoom out', onClick: () => zoomAt(1 / 1.35), icon: '−' },
              { label: 'Reset view', onClick: () => setT({ k: 1, x: 0, y: 0 }), icon: '⟲' },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                aria-label={b.label}
                title={b.label}
                onClick={b.onClick}
                className="glass flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold text-cream transition hover:border-saffron/60 hover:text-saffron"
              >
                {b.icon}
              </button>
            ))}
          </div>
        ) : null}
        {!readOnly && !driven ? (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setPlaying((p) => !p)}
            className="glass absolute bottom-3 left-3 flex min-h-[44px] items-center rounded-full px-4 py-2 text-xs font-bold text-cream transition hover:border-saffron/60 hover:text-saffron"
          >
            {playing ? 'Pause ride preview' : 'Play ride preview'}
          </button>
        ) : null}
      </div>
      <figcaption className="border-t border-white/10 px-4 py-2.5 text-center text-xs text-cream/50">
        {caption}
      </figcaption>
    </figure>
  );
}
