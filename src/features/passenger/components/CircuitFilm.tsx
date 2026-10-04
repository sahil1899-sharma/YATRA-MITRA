import { useCallback, useEffect, useRef, useState } from 'react';
import { Clapperboard, Maximize, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { CIRCUIT_FILMS } from '../../../data/films';
import SectionTitle from '../../../components/SectionTitle';

function fmt(t: number): string {
  if (!Number.isFinite(t) || t < 0) return '0:00';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Cinematic circuit film: locally-bundled stock montage with chapter
 * markers. Footage is illustrative (not filmed at the actual stops), so the
 * caption says so plainly.
 */
export default function CircuitFilm({ circuitId }: { circuitId: string }) {
  const film = CIRCUIT_FILMS[circuitId];
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(film?.duration ?? 0);
  const [ended, setEnded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hoverChapter, setHoverChapter] = useState<string | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (window.location.hash === '#film') {
      const el = sectionRef.current;
      // ResponsiveShell mounts mobile + desktop trees; only the visible one scrolls.
      if (!el || el.offsetParent === null) return;
      const scroll = () => el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const t1 = setTimeout(scroll, 350);
      const t2 = setTimeout(scroll, 1200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, []);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      setEnded(false);
      void v.play();
    } else {
      v.pause();
    }
  }, []);

  const seek = useCallback(
    (t: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = Math.min(Math.max(0, t), duration || 0);
      setEnded(false);
      if (v.paused) void v.play();
    },
    [duration],
  );

  const seekFromBar = useCallback(
    (clientX: number) => {
      const bar = barRef.current;
      if (!bar || !duration) return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      seek(ratio * duration);
    },
    [duration, seek],
  );

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void v.requestFullscreen().catch(() => undefined);
  }, []);

  if (!film) return null;

  const progress = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <section
      ref={sectionRef}
      id="film"
      aria-label="Circuit film"
      className={`scroll-mt-24 pt-6 transition-all duration-700 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      <SectionTitle title="Watch the film" subtitle="A cinematic glimpse of the circuit" />

      <div className="group relative overflow-hidden rounded-card border border-white/10 bg-black shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
        <div className="relative aspect-video w-full">
          <video
            ref={videoRef}
            className="h-full w-full cursor-pointer object-cover"
            src={film.src}
            poster={film.poster}
            preload="metadata"
            playsInline
            muted={muted}
            onClick={toggle}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => {
              setPlaying(false);
              setEnded(true);
            }}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => {
              const d = e.currentTarget.duration;
              if (Number.isFinite(d)) setDuration(d);
            }}
            aria-label={`Cinematic film for circuit ${circuitId}`}
          />

          {/* Idle / replay overlay */}
          {!playing ? (
            <button
              type="button"
              onClick={toggle}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-t from-night/85 via-night/20 to-night/40 transition"
              aria-label={ended ? 'Replay the film' : 'Play the film'}
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-saffron text-ink shadow-[0_0_45px_rgba(232,137,12,0.55)] transition-transform duration-300 hover:scale-110">
                {ended ? (
                  <RotateCcw size={30} aria-hidden="true" />
                ) : (
                  <Play size={30} className="ml-1" aria-hidden="true" />
                )}
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold text-cream">
                <Clapperboard size={16} className="text-saffron" aria-hidden="true" />
                {ended ? 'Watch again' : `Watch the film · ${fmt(film.duration)}`}
              </span>
            </button>
          ) : null}

          {/* Controls */}
          <div
            className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/95 via-night/40 to-transparent px-3 pb-2.5 pt-10 transition-opacity duration-300 ${
              playing ? 'opacity-0 group-hover:opacity-100 focus-within:opacity-100' : 'opacity-100'
            }`}
          >
            {/* Progress bar with chapter ticks */}
            <div
              ref={barRef}
              role="slider"
              tabIndex={0}
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(time)}
              aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
              className="relative h-6 cursor-pointer"
              onClick={(e) => seekFromBar(e.clientX)}
              onMouseMove={(e) => {
                const bar = barRef.current;
                if (!bar || !duration) return;
                const rect = bar.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                const t = ratio * duration;
                const ch = [...film.chapters].reverse().find((c) => t >= c.t);
                setHoverChapter(ch ? ch.label : null);
              }}
              onMouseLeave={() => setHoverChapter(null)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') seek(time + 5);
                else if (e.key === 'ArrowLeft') seek(time - 5);
                else if (e.key === 'Home') seek(0);
                else if (e.key === 'End') seek(duration);
              }}
            >
              <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-visible rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-saffron to-amber-300 shadow-glow"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {film.chapters.map((c) => (
                <span
                  key={c.t}
                  title={c.label}
                  className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-night bg-cream/80"
                  style={{ left: `${(c.t / duration) * 100}%` }}
                />
              ))}
              {hoverChapter ? (
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-night/90 px-3 py-1 text-xs font-semibold text-cream backdrop-blur-sm">
                  {hoverChapter}
                </span>
              ) : null}
            </div>

            <div className="mt-0.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? 'Pause' : 'Play'}
                className="flex h-11 w-11 items-center justify-center rounded-full text-cream transition hover:bg-white/10"
              >
                {playing ? <Pause size={20} aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? 'Unmute' : 'Mute'}
                className="flex h-11 w-11 items-center justify-center rounded-full text-cream transition hover:bg-white/10"
              >
                {muted ? <VolumeX size={20} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
              </button>
              <span className="ml-1 text-xs font-medium tabular-nums text-cream/70">
                {fmt(time)} / {fmt(duration)}
              </span>
              <span className="flex-1" />
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label="Fullscreen"
                className="flex h-11 w-11 items-center justify-center rounded-full text-cream transition hover:bg-white/10"
              >
                <Maximize size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="list" aria-label="Film chapters">
        {film.chapters.map((c, i) => {
          const active = time >= c.t && (i === film.chapters.length - 1 || time < film.chapters[i + 1].t);
          return (
            <button
              key={c.t}
              type="button"
              role="listitem"
              onClick={() => seek(c.t + 0.05)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition ${
                active
                  ? 'border-saffron/60 bg-saffron/15 text-saffron'
                  : 'border-white/12 bg-white/[0.05] text-cream/70 hover:border-saffron/40 hover:text-cream'
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  active ? 'bg-saffron text-ink' : 'bg-white/10 text-cream/60'
                }`}
              >
                {i + 1}
              </span>
              {c.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
