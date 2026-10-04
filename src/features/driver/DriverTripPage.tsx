import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Pause, Play, RotateCcw, Siren, ThumbsDown, ThumbsUp } from 'lucide-react';
import { SEED_CIRCUITS } from '../../data/seed';
import { getCircuitStops, stopProgressFraction } from '../../lib/circuits';
import { formatTime } from '../../lib/format';
import { useAppStore } from '../../store/useAppStore';
import JammuMap from '../../components/JammuMap';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import StatusPill from '../../components/StatusPill';
import ReturnCountdownCard from '../../components/ReturnCountdown';
import Reveal from '../../components/Reveal';
import { StoryAudioControls, useStoryAudio } from '../../components/StoryAudio';

const ABORT_REASONS = ['Passenger request', 'Vehicle issue', 'Safety concern', 'Other'];

export default function DriverTripPage() {
  const { tripId } = useParams();
  const trip = useAppStore((s) => s.trips.find((t) => t.id === tripId));
  const updateTrip = useAppStore((s) => s.updateTrip);
  const setTripStatus = useAppStore((s) => s.setTripStatus);
  const incrementDriverTrips = useAppStore((s) => s.incrementDriverTrips);
  const createIncident = useAppStore((s) => s.createIncident);

  const [playing, setPlaying] = useState(false);
  const [abortOpen, setAbortOpen] = useState(false);
  const [abortReason, setAbortReason] = useState(ABORT_REASONS[0]);
  const [receiptSent, setReceiptSent] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const audio = useStoryAudio();

  const circuit = trip ? SEED_CIRCUITS.find((c) => c.id === trip.circuitId) : undefined;
  const stops = circuit ? getCircuitStops(circuit) : [];

  // Demo playback — the driver drives the same progress the passenger sees.
  useEffect(() => {
    if (!playing || !tripId) return;
    const id = window.setInterval(() => {
      const cur = useAppStore.getState().trips.find((t) => t.id === tripId);
      if (!cur || cur.status === 'completed' || cur.status === 'aborted') {
        setPlaying(false);
        return;
      }
      const next = Math.min(100, cur.progress + 1);
      useAppStore.getState().updateTrip(cur.id, { progress: next });
      if (next >= 100) setPlaying(false);
    }, 400);
    return () => window.clearInterval(id);
  }, [playing, tripId]);

  // Reaching a story stop marks it played (shared with the passenger screen).
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?.progress]);

  if (!trip || !circuit) {
    return (
      <div className="p-4">
        <Card className="text-center">
          <h1 className="font-display text-lg font-bold text-cream">Trip not found</h1>
          <Link to="/d" className="mt-4 inline-block">
            <Button>Back to today</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const setProgress = (v: number) => {
    updateTrip(trip.id, { progress: Math.min(100, Math.max(0, v)) });
  };

  const completeTrip = () => {
    if (trip.progress < 100 || trip.status === 'completed') return;
    setPlaying(false);
    audio.stopAudio();
    updateTrip(trip.id, { status: 'completed' });
    incrementDriverTrips(trip.driverMitraId);
    setReceiptSent(true);
  };

  const doAbort = () => {
    setPlaying(false);
    audio.stopAudio();
    createIncident({
      tripId: trip.id,
      type: 'TRIP_ABORT',
      status: 'open',
      escalatedTo: 'Mitra control room (simulated)',
      note: abortReason,
    });
    setTripStatus(trip.id, 'aborted');
    setAbortOpen(false);
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

  const finished = trip.status === 'completed' || trip.status === 'aborted';

  return (
    <div className="bg-jaali-dark px-4 pb-10 pt-6 md:px-2">
      <Link
        to="/d"
        className="text-sm font-semibold text-cream/60 hover:text-saffron"
      >
        ← Back to today
      </Link>

      <Card className="mt-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-saffron">
              Trip {trip.id}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-cream">{circuit.name}</h1>
            <p className="mt-1 text-sm text-cream/60">
              {formatTime(trip.slot)} · {trip.partySize} traveller
              {trip.partySize === 1 ? '' : 's'}
              {trip.departureTime ? ` · leaves ${formatTime(trip.departureTime)}` : ''}
            </p>
          </div>
          <StatusPill status={trip.status} />
        </div>
        {trip.sakhiPreferred ? (
          <div className="mt-2">
            <Badge variant="sakhi">Sakhi requested</Badge>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {trip.status === 'driver_assigned' ? (
            <Button onClick={() => setTripStatus(trip.id, 'accepted')}>Accept trip</Button>
          ) : null}
          {trip.status === 'accepted' ? (
            <Button onClick={() => setTripStatus(trip.id, 'in_progress')}>Start trip</Button>
          ) : null}
          {trip.status === 'in_progress' ? (
            <>
              <Button onClick={completeTrip} disabled={trip.progress < 100}>
                Complete trip
              </Button>
              <Button variant="ghost" onClick={() => setAbortOpen(true)}>
                Abort trip
              </Button>
            </>
          ) : null}
        </div>
        {receiptSent && trip.status === 'completed' ? (
          <p className="mt-3 flex items-center gap-2 rounded-card border border-verified/30 bg-verified/10 px-3 py-2 text-sm font-semibold text-emerald-300">
            <Check size={16} aria-hidden="true" />
            Receipt sent to passenger — Demo
          </p>
        ) : null}
        {trip.status === 'aborted' ? (
          <p className="mt-3 rounded-card border border-alert/30 bg-alert/10 px-3 py-2 text-sm font-semibold text-red-300">
            Trip aborted. The control room has been notified — Demo.
          </p>
        ) : null}
      </Card>

      {/* live route */}
      <div className="mt-4">
        <JammuMap stops={stops} progress={trip.progress} caption="Simulated GPS" />
      </div>

      {/* demo controls */}
      {!finished ? (
        <Card className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-saffron">
            Demo controls — Simulated GPS
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Button onClick={playing ? () => setPlaying(false) : () => setPlaying(true)}>
              {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
              {playing ? 'Pause' : 'Play'}
            </Button>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(trip.progress)}
              onChange={(e) => setProgress(Number(e.target.value))}
              aria-label="Trip progress"
              className="w-full accent-[#E8890C]"
            />
            <span className="w-12 shrink-0 text-right font-display text-sm font-bold text-cream">
              {Math.round(trip.progress)}%
            </span>
          </div>
          <Button variant="ghost" onClick={() => setProgress(0)} className="mt-3">
            <RotateCcw size={15} aria-hidden="true" />
            Reset progress
          </Button>
        </Card>
      ) : null}

      {/* stop checklist with story scripts */}
      <Reveal>
      <Card className="mt-4">
        <h2 className="font-display text-xl font-bold text-cream">Stops & story scripts</h2>
        <ol className="mt-3 flex flex-col">
          {stops.map((s, k) => {
            const reached = trip.progress >= stopProgressFraction(k, stops.length);
            const played = trip.playedStopIds.includes(s.id);
            return (
              <li key={s.id} className="flex gap-3">
                <span className="flex flex-col items-center" aria-hidden="true">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold ${
                      reached ? 'border-verified bg-verified/20 text-emerald-300' : 'border-white/20 text-cream/40'
                    }`}
                  >
                    {reached ? <Check size={14} /> : k + 1}
                  </span>
                  {k < stops.length - 1 ? (
                    <span className={`h-5 w-0.5 ${reached ? 'bg-verified/50' : 'bg-white/10'}`} />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1 pb-4">
                  <span className={`block text-[15px] font-semibold ${reached ? 'text-cream' : 'text-cream/55'}`}>
                    {s.name}
                    {played ? <span className="ml-2 text-xs font-normal text-emerald-300/80">· played</span> : null}
                    {(() => {
                      const r = (trip.storyRatings ?? {})[s.id];
                      return r ? (
                        <span
                          className={`ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            r === 'up' ? 'bg-verified/15 text-emerald-300' : 'bg-alert/15 text-red-300'
                          }`}
                        >
                          {r === 'up' ? (
                            <ThumbsUp size={11} aria-hidden="true" />
                          ) : (
                            <ThumbsDown size={11} aria-hidden="true" />
                          )}
                          Passenger rated this story
                        </span>
                      ) : null;
                    })()}
                  </span>
                  {s.hasStory && s.storyEn ? (
                    <span className="mt-1 block text-sm leading-relaxed text-cream/70">
                      <span className="font-semibold text-cream/50">Script — </span>
                      {s.storyEn}
                    </span>
                  ) : null}
                  {s.hasStory ? (
                    <span className="mt-2 block">
                      <StoryAudioControls stop={s} audio={audio} showPlayButton />
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>
      </Card>
      </Reveal>

      {/* return countdown */}
      <div className="mt-4">
        <ReturnCountdownCard trip={trip} circuit={circuit} />
      </div>

      {/* safety */}
      {!finished ? (
        <Card className="mt-4">
          <Button variant="danger" onClick={() => setSosOpen(true)} className="w-full">
            <Siren size={16} aria-hidden="true" />
            SOS — alert 112 and control room
          </Button>
          <p className="mt-2 text-center text-xs text-cream/45">
            Sends your live location with the trip details. Demo: no real call is placed.
          </p>
        </Card>
      ) : null}

      {/* abort modal */}
      <Modal open={abortOpen} onClose={() => setAbortOpen(false)} title="Abort this trip?">
        <label className="block text-sm font-semibold text-cream/75" htmlFor="abort-reason">
          Reason
        </label>
        <select
          id="abort-reason"
          value={abortReason}
          onChange={(e) => setAbortReason(e.target.value)}
          className="mt-1.5 w-full rounded-card border border-white/15 bg-night-soft px-3 py-2.5 text-sm text-cream"
        >
          {ABORT_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setAbortOpen(false)}>
            Keep trip
          </Button>
          <Button variant="danger" onClick={doAbort}>
            Abort trip
          </Button>
        </div>
      </Modal>

      {/* SOS confirm */}
      <Modal open={sosOpen} onClose={() => setSosOpen(false)} title="Send an SOS alert?">
        <p className="text-[15px] leading-relaxed text-cream/80">
          Alert emergency services (112) and the Mitra control room with your live location and trip
          details?
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
              Your SOS reached the Mitra control room with your live location and trip details.
              Demo: no real call was placed.
            </p>
            <Button className="mt-6" onClick={() => setSosSent(false)}>
              Back to trip
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
