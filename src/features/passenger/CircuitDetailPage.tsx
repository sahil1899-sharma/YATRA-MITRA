import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Play, Square } from 'lucide-react';
import type { Stop } from '../../types';
import { SEED_CIRCUITS, SEED_STOPS } from '../../data/seed';
import { RETURN_GUARANTEE_TEXT } from '../../data/constants';
import { formatINR } from '../../lib/format';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import SectionTitle from '../../components/SectionTitle';
import CinematicScene from '../../components/CinematicScene';
import type { SceneMood } from '../../components/CinematicScene';
import JammuMap from '../../components/JammuMap';
import Reveal from '../../components/Reveal';
import CircuitFilm from './components/CircuitFilm';
import { formatDuration } from './components/CircuitCard';

const STOP_BY_ID = new Map(SEED_STOPS.map((s) => [s.id, s]));

function StoryPreview({ stop }: { stop: Stop }) {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const stopAll = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeakingId(null);
  };

  const toggle = async () => {
    if (!stop.storyEn) return;
    if (speakingId === stop.id) {
      stopAll();
      return;
    }
    // Prefer the recorded narration when it exists; fall back to the device voice.
    try {
      const res = await fetch(`/audio/${stop.id}.en.mp3`, { method: 'HEAD' });
      const ct = res.headers.get('content-type') ?? '';
      if (res.ok && ct.startsWith('audio/')) {
        stopAll();
        const a = new Audio(`/audio/${stop.id}.en.mp3`);
        audioRef.current = a;
        a.onended = () => setSpeakingId(null);
        a.onerror = () => setSpeakingId(null);
        setExpandedId(null);
        setSpeakingId(stop.id);
        await a.play();
        return;
      }
    } catch {
      // No recorded file — fall through to speech synthesis.
    }
    // No speech engine: show the text in an expandable panel, no error.
    if (!('speechSynthesis' in window)) {
      setExpandedId(expandedId === stop.id ? null : stop.id);
      return;
    }
    stopAll();
    const utterance = new SpeechSynthesisUtterance(stop.storyEn);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setExpandedId(null);
    setSpeakingId(stop.id);
    window.speechSynthesis.speak(utterance);
  };

  const playing = speakingId === stop.id;
  const expanded = expandedId === stop.id;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? `Stop story preview for ${stop.name}` : `Play story preview for ${stop.name}`}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 text-sm font-semibold text-saffron backdrop-blur-sm transition hover:border-saffron/50"
      >
        {playing ? <Square size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        Story preview
      </button>
      {playing ? <p className="mt-1 text-xs font-medium text-cream/55">Sample narration</p> : null}
      {expanded && stop.storyEn ? (
        <div className="mt-2 rounded-card border border-white/10 bg-white/[0.05] p-3 backdrop-blur-sm">
          <p className="text-xs font-semibold text-cream/50">Sample narration</p>
          <p className="mt-1 text-sm leading-relaxed text-cream/80">{stop.storyEn}</p>
        </div>
      ) : null}
    </div>
  );
}

export default function CircuitDetailPage() {
  const { id } = useParams();
  const circuit = SEED_CIRCUITS.find((c) => c.id === id);

  if (!circuit) {
    return (
      <div className="p-4">
        <Card className="text-center">
          <h1 className="text-lg font-bold text-cream">Circuit not found</h1>
          <p className="mt-2 text-sm text-cream/65">
            We could not find that circuit. Please choose from the available heritage circuits.
          </p>
          <Link to="/p" className="mt-4 block">
            <Button variant="secondary" className="w-full">
              Back to circuits
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const stops = circuit.stopIds
    .map((stopId) => STOP_BY_ID.get(stopId))
    .filter((s): s is Stop => s !== undefined);

  const included = [
    'Verified Mitra driver-guide',
    'Fixed fare, no bargaining',
    'Digital receipt',
    'Live trip-sharing for family',
    'SOS',
  ];
  if (circuit.id === 'C6') included.push("Boating is extra, booked via JMC's online portal.");

  const mood: SceneMood = circuit.id === 'C6' ? 'dusk' : 'dawn';

  return (
    <div className="">
      <div className="relative h-56 overflow-hidden md:h-80 md:rounded-[24px]">
        <CinematicScene mood={mood} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/15 to-transparent" />
        <div className="absolute inset-x-4 bottom-3.5 flex items-end justify-between gap-3 md:inset-x-8 md:bottom-6">
          <h1 className="font-display text-[30px] font-bold leading-tight text-cream drop-shadow-[0_3px_14px_rgba(0,0,0,0.6)] md:text-5xl">
            {circuit.name}
          </h1>
          <span className="mb-1 shrink-0 rounded-full bg-saffron px-3.5 py-1.5 text-sm font-bold text-ink shadow-glow md:mb-2 md:text-base">
            {formatINR(circuit.farePerPerson)}{' '}
            <span className="font-medium">per person</span>
          </span>
        </div>
      </div>

      <div className="px-4 pt-4 md:px-2 md:pt-6">
        <p className="text-sm text-cream/70 md:text-base">{circuit.tagline}</p>
        {circuit.minParty > 1 ? (
          <p className="mt-0.5 text-xs text-cream/50">minimum {circuit.minParty} travellers</p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip>{formatDuration(circuit.durationMin)}</Chip>
          <Chip>{stops.length} stops</Chip>
          <Chip>Zero bargaining</Chip>
        </div>

        <div className="md:mt-6 md:grid md:grid-cols-[minmax(0,1fr)_340px] md:items-start md:gap-8">
          <div>
            <Reveal>
              <JammuMap stops={stops} />
            </Reveal>

            <CircuitFilm circuitId={circuit.id} />

            <Reveal className="pt-6">
              <SectionTitle title="Stops" subtitle="In visiting order" />
              <Card className="!p-0 px-4">
                <ul>
                  {stops.map((s, i) => (
                    <li
                      key={s.id}
                      className="group flex gap-3 border-b border-line py-3 transition-colors last:border-0 hover:bg-saffron/[0.04]"
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-maroon text-xs font-bold text-cream transition-all duration-300 group-hover:bg-saffron group-hover:text-ink group-hover:shadow-glow"
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-medium text-cream">{s.name}</p>
                        {s.hasStory && s.storyEn ? <StoryPreview stop={s} /> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          </div>

          <aside className="md:sticky md:top-24">
            <Reveal delay={0.1}>
            <div className="pt-6 md:pt-0">
              <SectionTitle title="What's included" />
              <Card className="card-lift">
                <ul className="flex flex-col gap-2.5">
                  {included.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[15px] text-cream/85">
                      <Check size={18} className="mt-0.5 shrink-0 text-verified" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-[15px] text-cream/85">
                    <Check size={18} className="mt-0.5 shrink-0 text-verified" aria-hidden="true" />
                    <span>
                      <span className="font-semibold">Return Guarantee:</span> {RETURN_GUARANTEE_TEXT}
                    </span>
                  </li>
                </ul>
              </Card>
            </div>

            <div className="pt-4">
              <div className="glass rounded-card p-4">
                <p className="text-sm font-semibold text-saffron">Driver-concierge note</p>
                <p className="mt-1 text-sm leading-relaxed text-cream/65">
                  Your driver is trained in storytelling and hospitality. Drivers are not licensed
                  professional guides.
                </p>
              </div>
            </div>

            <div className="hidden pt-4 md:block">
              <Link to={`/p/book/${circuit.id}`} className="block">
                <Button className="w-full">Book this circuit</Button>
              </Link>
            </div>
            </Reveal>
          </aside>
        </div>
      </div>

      <div className="sticky bottom-0 mt-6 border-t border-white/10 bg-night/90 p-4 backdrop-blur-md md:hidden">
        <Link to={`/p/book/${circuit.id}`} className="block">
          <Button className="w-full">Book this circuit</Button>
        </Link>
      </div>
    </div>
  );
}
