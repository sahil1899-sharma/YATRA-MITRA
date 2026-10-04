import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  Flag,
  Pause,
  Play,
  RotateCcw,
  Share2,
  Siren,
  Star,
  ThumbsDown,
  ThumbsUp,
  Volume2,
} from 'lucide-react';
import { SEED_CIRCUITS } from '../../data/seed';
import { getCircuitStops, stopProgressFraction } from '../../lib/circuits';
import { useAppStore } from '../../store/useAppStore';
import JammuMap from '../../components/JammuMap';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import StatusPill from '../../components/StatusPill';
import ShareTripModal from '../../components/ShareTripModal';
import ReturnCountdownCard from '../../components/ReturnCountdown';
import { StoryAudioControls, useStoryAudio } from '../../components/StoryAudio';

const FARE_REASONS = ['Asked for extra money', 'Unplanned stop', 'Pushed shopping', 'Other'];

export default function RideScreen() {
  const { tripId } = useParams();
  const trip = useAppStore((s) => s.trips.find((t) => t.id === tripId));
  const updateTrip = useAppStore((s) => s.updateTrip);
  const createIncident = useAppStore((s) => s.createIncident);

  const [playing, setPlaying] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [fareOpen, setFareOpen] = useState(false);
  const [fareReason, setFareReason] = useState(FARE_REASONS[0]);
  const [fareText, setFareText] = useState('');
  const [fareSent, setFareSent] = useState(false);
  // Ratings are persisted on the trip so they survive refreshes and can feed the story quality loop.
  const stars = trip?.rideStars ?? 0;
  const thumbs = trip?.storyRatings ?? {};
  const rateStars = (n: number) => {
    if (trip) updateTrip(trip.id, { rideStars: n });
  };
  const rateThumbs = (stopId: string, v: 'up' | 'down') => {
    if (trip) updateTrip(trip.id, { storyRatings: { ...(trip.storyRatings ?? {}), [stopId]: v } });
  };
  const audio = useStoryAudio();

  const circuit = trip ? SEED_CIRCUITS.find((c) => c.id === trip.circuitId) : undefined;
  const stops = circuit ? getCircuitStops(circuit) : [];
  const driver = useAppStore((s) => (trip ? s.drivers.find((d) => d.mitraId === trip.driverMitraId) : undefined));

  // ---- playback ----
  useEffect(() => {
    if (!playing || !tripId) return;
    const id = window.setInterval(() => {
      const cur = useAppStore.getState().trips.find((t) => t.id === tripId);
      if (!cur || cur.status === 'completed') {
        setPlaying(false);
        return;
      }
      const next = Math.min(100, cur.progress + 1);
      useAppStore.getState().updateTrip(cur.id, { progress: next });
      if (next >= 100) {
        useAppStore.getState().updateTrip(cur.id, { status: 'completed' });
        setPlaying(false);
      }
    }, 400);
    return () => window.clearInterval(id);
  }, [playing, tripId]);

  // ---- story triggers: a story stop fires exactly once ----
  useEffect(() => {
    if (!trip || stops.length === 0) return;
    const n = stops.length;
    const newly = stops.filter(
      (s) =>
        s.hasStory &&
        trip.progress >= stopProgressFraction(stops.indexOf(s), n) &&
        !trip.playedStopIds.includes(s.id),
    );
    if (newly.length === 0) return;
    updateTrip(trip.id, { playedStopIds: [...trip.playedStopIds, ...newly.map((s) => s.id)] });
    void audio.playStory(newly[newly.length - 1], audio.lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?.progress]);

  if (!trip || !circuit) {
    return (
      <div className="p-4">
        <Card className="text-center">
          <h1 className="font-display text-lg font-bold text-cream">Ride not found</h1>
          <p className="mt-2 text-sm text-cream/65">This trip does not exist in this browser.</p>
          <Link to="/p" className="mt-4 inline-block">
            <Button>Browse circuits</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const startPlayback = () => {
    if (trip.status === 'completed') return;
    if (trip.status !== 'in_progress') updateTrip(trip.id, { status: 'in_progress' });
    if (trip.progress < 100) setPlaying(true);
  };

  const setProgress = (v: number) => {
    const next = Math.min(100, Math.max(0, v));
    updateTrip(trip.id, { progress: next });
    if (next >= 100) {
      updateTrip(trip.id, { status: 'completed' });
      setPlaying(false);
    }
  };

  const resetRide = () => {
    setPlaying(false);
    audio.stopAudio();
    updateTrip(trip.id, {
      progress: 0,
      delayMin: 0,
      playedStopIds: [],
      storyRatings: {},
      rideStars: 0,
      status: 'driver_assigned',
    });
  };

  const doSos = () => {
    createIncident({
      tripId: trip.id,
      type: 'SOS',
      status: 'escalated',
      escalatedTo: 'Mitra control room (simulated)',
    });
    setSosOpen(false);
    setSosSent(true);
  };

  const submitFare = () => {
    createIncident({
      tripId: trip.id,
      type: 'FARE_ISSUE',
      status: 'open',
      escalatedTo: 'RTO Jammu grievance desk (simulated)',
      note: fareText.trim() ? `${fareReason} — ${fareText.trim()}` : fareReason,
    });
    setFareSent(true);
  };

  // The story card follows the last played story from the store, so the
  // two mounted trees (mobile + desktop) always agree on what is showing.
  // Component state alone would race: whichever tree's trigger effect ran
  // second would see the stop as already played and never show the card.
  const lastPlayedId =
    trip.playedStopIds.length > 0 ? trip.playedStopIds[trip.playedStopIds.length - 1] : null;
  const activeStory = lastPlayedId ? stops.find((s) => s.id === lastPlayedId) ?? null : null;
  const storyText =
    activeStory != null ? (audio.lang === 'hi' ? activeStory.storyHi : activeStory.storyEn) : null;

  return (
    <div className="bg-jaali-dark px-4 pb-28 pt-6 md:px-2">
      {/* a) header */}
      <Card className="card-lift">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-saffron">
              <span className="pulse-dot" aria-hidden="true" />
              Live ride
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-cream">{circuit.name}</h1>
          </div>
          <StatusPill status={trip.status} />
        </div>
        {driver ? (
          <Link
            to={`/p/driver/${driver.mitraId}`}
            className="mt-3 flex items-center gap-3 rounded-card border border-white/10 bg-white/[0.04] p-2.5 transition hover:border-saffron/40"
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-saffron to-[#c96f06] text-sm font-bold text-ink"
            >
              {driver.initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-cream">{driver.name}</span>
              <span className="block text-xs text-cream/55">
                Mitra ID {driver.mitraId}
                {driver.cohort === 'sakhi' ? ' · Yatra Sakhi' : ''}
              </span>
            </span>
          </Link>
        ) : null}
      </Card>

      {/* completion card */}
      {trip.status === 'completed' ? (
        <Card className="mt-4 border-verified/30">
          <h2 className="font-display text-xl font-bold text-cream">Ride completed</h2>
          <p className="mt-1 text-sm text-cream/60">How was your ride?</p>
          <div className="mt-3 flex gap-1.5" role="radiogroup" aria-label="Rate your ride">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={stars === n}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                onClick={() => rateStars(n)}
                className="p-1"
              >
                <Star
                  size={30}
                  className={n <= stars ? 'fill-saffron text-saffron' : 'text-cream/25'}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold text-cream/75">Rate each stop's story</p>
          <div className="mt-2 flex flex-col gap-2">
            {stops
              .filter((s) => s.hasStory)
              .map((s) => {
                const v = thumbs[s.id];
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-2 rounded-card border border-white/10 bg-white/[0.03] px-3 py-2"
                  >
                    <span className="truncate text-sm text-cream/80">{s.name}</span>
                    <span className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        aria-label={`Thumbs up for ${s.name}`}
                        onClick={() => rateThumbs(s.id, 'up')}
                        className={`rounded-full p-1.5 ${v === 'up' ? 'bg-verified/20 text-emerald-300' : 'text-cream/35 hover:text-cream'}`}
                      >
                        <ThumbsUp size={17} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Thumbs down for ${s.name}`}
                        onClick={() => rateThumbs(s.id, 'down')}
                        className={`rounded-full p-1.5 ${v === 'down' ? 'bg-alert/20 text-red-300' : 'text-cream/35 hover:text-cream'}`}
                      >
                        <ThumbsDown size={17} aria-hidden="true" />
                      </button>
                    </span>
                  </div>
                );
              })}
          </div>
        </Card>
      ) : null}

      {/* b) map */}
      <div className="mt-4">
        <JammuMap stops={stops} progress={trip.progress} caption="Simulated GPS" />
      </div>

      {/* c) demo controls */}
      <Card className="mt-4">
        <button
          type="button"
          onClick={() => setControlsOpen((o) => !o)}
          aria-expanded={controlsOpen}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="font-display text-base font-bold text-cream">Demo controls — Simulated GPS</span>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={`text-cream/60 transition-transform ${controlsOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {controlsOpen ? (
          <div className="mt-4 flex flex-col gap-4 border-t border-white/10 pt-4">
            <div className="flex items-center gap-3">
              <Button onClick={playing ? () => setPlaying(false) : startPlayback}>
                {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
                {playing ? 'Pause' : 'Play'}
              </Button>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(trip.progress)}
                onChange={(e) => setProgress(Number(e.target.value))}
                aria-label="Ride progress"
                className="w-full accent-[#E8890C]"
              />
              <span className="w-12 shrink-0 text-right font-display text-sm font-bold text-cream">
                {Math.round(trip.progress)}%
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => updateTrip(trip.id, { delayMin: trip.delayMin + 15 })}>
                +15 min traffic delay
              </Button>
              <Button variant="ghost" onClick={resetRide}>
                <RotateCcw size={15} aria-hidden="true" />
                Reset ride
              </Button>
            </div>
            {trip.delayMin > 0 ? (
              <p className="text-xs text-cream/55">Traffic delay added: {trip.delayMin} min</p>
            ) : null}
          </div>
        ) : null}
      </Card>

      {/* now-playing story card */}
      {activeStory && storyText ? (
        <Card className="grad-ring mt-4">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-saffron">
            <Volume2 size={14} aria-hidden="true" />
            Now playing — {activeStory.name}
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-cream/85">
            <span className="font-semibold text-cream/50">Sample narration — </span>
            {storyText}
          </p>
          <div className="mt-3">
            <StoryAudioControls stop={activeStory} audio={audio} />
          </div>
        </Card>
      ) : null}

      {/* d) stop checklist */}
      <Card className="mt-4">
        <h2 className="font-display text-xl font-bold text-cream">Stops</h2>
        <ol className="mt-3 flex flex-col">
          {stops.map((s, k) => {
            const reached = trip.progress >= stopProgressFraction(k, stops.length);
            return (
              <li key={s.id} className="flex gap-3">
                <span className="flex flex-col items-center" aria-hidden="true">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-500 ${
                      reached
                        ? 'border-verified bg-verified/20 text-emerald-300 shadow-[0_0_16px_rgba(30,142,90,0.45)]'
                        : 'border-white/20 text-cream/40'
                    }`}
                  >
                    {reached ? <Check size={14} /> : k + 1}
                  </span>
                  {k < stops.length - 1 ? (
                    <span
                      className={`h-5 w-0.5 transition-colors duration-700 ${
                        reached ? 'bg-gradient-to-b from-verified to-verified/30' : 'bg-white/10'
                      }`}
                    />
                  ) : null}
                </span>
                <span className="pb-4">
                  <span className={`block text-[15px] font-semibold ${reached ? 'text-cream' : 'text-cream/55'}`}>
                    {s.name}
                  </span>
                  {s.hasStory && reached ? (
                    <button
                      type="button"
                      onClick={() => void audio.playStory(s, audio.lang)}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-saffron hover:underline"
                    >
                      <Volume2 size={13} aria-hidden="true" />
                      Replay story
                    </button>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>
      </Card>

      {/* f) return countdown */}
      <div className="mt-4">
        <ReturnCountdownCard trip={trip} circuit={circuit} />
      </div>

      {/* g) safety row — sticky so it is always on screen */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#14090ecc]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-stretch gap-2 px-4 py-3">
          <Button variant="danger" onClick={() => setSosOpen(true)} className="flex-1">
            <Siren size={16} aria-hidden="true" />
            SOS
          </Button>
          <Button variant="ghost" onClick={() => setShareOpen(true)} className="flex-1">
            <Share2 size={16} aria-hidden="true" />
            Share live trip
          </Button>
          <Button variant="ghost" onClick={() => setFareOpen(true)} className="flex-1">
            <Flag size={16} aria-hidden="true" />
            Report a fare issue
          </Button>
        </div>
      </div>

      {/* SOS confirm */}
      <Modal open={sosOpen} onClose={() => setSosOpen(false)} title="Send an SOS alert?">
        <p className="text-[15px] leading-relaxed text-cream/80">
          Alert emergency services (112) and the Mitra control room with your live location?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setSosOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={doSos}>
            Alert
          </Button>
        </div>
      </Modal>

      {/* SOS full-screen confirmation */}
      {sosSent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b060cee] p-6">
          <div className="max-w-sm text-center">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-verified/15">
              <Check size={40} className="text-emerald-300" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold text-cream">Help alerted</h2>
            <p className="mt-2 text-sm leading-relaxed text-cream/65">
              Your SOS reached the Mitra control room with your live location. Demo: no real call
              was placed.
            </p>
            <Button className="mt-6" onClick={() => setSosSent(false)}>
              Back to ride
            </Button>
          </div>
        </div>
      ) : null}

      {/* share */}
      <ShareTripModal open={shareOpen} onClose={() => setShareOpen(false)} token={trip.liveShareToken} />

      {/* fare issue */}
      <Modal
        open={fareOpen}
        onClose={() => {
          setFareOpen(false);
          setFareSent(false);
        }}
        title="Report a fare issue"
      >
        {fareSent ? (
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-verified/15">
              <Check size={28} className="text-emerald-300" aria-hidden="true" />
            </span>
            <p className="mt-3 text-[15px] text-cream/85">Sent with your receipt attached — Demo</p>
            <Button className="mt-5" onClick={() => { setFareOpen(false); setFareSent(false); }}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <label className="block text-sm font-semibold text-cream/75" htmlFor="fare-reason">
              What happened?
            </label>
            <select
              id="fare-reason"
              value={fareReason}
              onChange={(e) => setFareReason(e.target.value)}
              className="mt-1.5 w-full rounded-card border border-white/15 bg-night-soft px-3 py-2.5 text-sm text-cream"
            >
              {FARE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <label className="mt-4 block text-sm font-semibold text-cream/75" htmlFor="fare-text">
              Anything to add? <span className="font-normal text-cream/45">(optional)</span>
            </label>
            <textarea
              id="fare-text"
              value={fareText}
              onChange={(e) => setFareText(e.target.value)}
              rows={3}
              placeholder="A line or two about what happened"
              className="mt-1.5 w-full rounded-card border border-white/15 bg-night-soft px-3 py-2.5 text-sm text-cream placeholder:text-cream/30"
            />
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setFareOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitFare}>Send report</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
