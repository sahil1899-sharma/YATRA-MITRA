import { useEffect, useRef, useState } from 'react';
import { Languages, Play, Volume2 } from 'lucide-react';
import type { Stop } from '../types';

export const STORY_LANGS = [
  { label: 'Hindi', code: 'hi' },
  { label: 'English', code: 'en' },
  { label: 'Dogri', code: 'dogri' },
  { label: 'Tamil', code: 'ta' },
  { label: 'Telugu', code: 'te' },
  { label: 'Bengali', code: 'bn' },
  { label: 'Punjabi', code: 'pa' },
  { label: 'Gujarati', code: 'gu' },
];

// Languages for which an existing mp3 file is presented as an AI dub.
const DUBBED = new Set(['ta', 'te', 'bn', 'pa', 'gu']);

export type StoryAudioState = 'idle' | 'playing' | 'speaking' | 'unavailable';

function hasTTS(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.speechSynthesis &&
    typeof window.speechSynthesis.speak === 'function'
  );
}

// Shared by the passenger ride screen and the driver trip screen.
// Behaviour: try /audio/{stopId}.{lang}.mp3 (must serve audio/* — the SPA
// fallback page is rejected by content type); if missing, Hindi/English fall
// back to speechSynthesis, every other language reports unavailable.
// Stories are never translated or dubbed by us.
export function useStoryAudio() {
  const [lang, setLang] = useState('hi');
  const [audioState, setAudioState] = useState<StoryAudioState>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (hasTTS()) window.speechSynthesis.cancel();
    setAudioState('idle');
  };

  const playStory = async (stop: Stop, code: string) => {
    stopAudio();
    let filePlayed = false;
    try {
      const res = await fetch(`/audio/${stop.id}.${code}.mp3`, { method: 'HEAD' });
      const ct = res.headers.get('content-type') ?? '';
      if (res.ok && ct.startsWith('audio/')) {
        const audio = new Audio(`/audio/${stop.id}.${code}.mp3`);
        audioRef.current = audio;
        audio.onended = () => setAudioState('idle');
        audio.onerror = () => setAudioState('idle');
        await audio.play();
        filePlayed = true;
        setAudioState('playing');
      }
    } catch {
      // No file (or fetch blocked) — fall through to the language fallback.
    }
    if (filePlayed) return;
    if (code === 'hi' || code === 'en') {
      const text = code === 'hi' ? stop.storyHi : stop.storyEn;
      if (text && hasTTS()) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = code === 'hi' ? 'hi-IN' : 'en-IN';
        u.onend = () => setAudioState('idle');
        u.onerror = () => setAudioState('idle');
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
        setAudioState('speaking');
        return;
      }
    }
    setAudioState('unavailable');
  };

  useEffect(() => stopAudio, []);
  // Note: no stop-on-lang-change effect — every language button calls
  // playStory directly (which stops previous audio first). A separate
  // effect would race the async mp3 check and clear its result.

  return { lang, setLang, audioState, playStory, stopAudio };
}

export type StoryAudio = ReturnType<typeof useStoryAudio>;

// Language picker + play button + status line for one stop's narration.
export function StoryAudioControls({
  stop,
  audio,
  showPlayButton = false,
}: {
  stop: Stop;
  audio: StoryAudio;
  showPlayButton?: boolean;
}) {
  const { lang, setLang, audioState, playStory } = audio;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5" aria-label="Narration language">
        <Languages size={15} className="mr-1 text-cream/50" aria-hidden="true" />
        {showPlayButton ? (
          <button
            type="button"
            onClick={() => void playStory(stop, lang)}
            className="mr-1 inline-flex items-center gap-1 rounded-full border border-saffron/60 bg-saffron/15 px-3 py-1 text-xs font-bold text-saffron transition hover:bg-saffron/25"
          >
            <Play size={13} aria-hidden="true" />
            Play audio
          </button>
        ) : null}
        {STORY_LANGS.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => {
              setLang(l.code);
              void playStory(stop, l.code);
            }}
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
              lang === l.code
                ? 'border-saffron/60 bg-saffron/15 text-saffron'
                : 'border-white/10 text-cream/55 hover:border-white/25 hover:text-cream'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="mt-2 min-h-[20px] text-xs" aria-live="polite">
        {audioState === 'playing' && DUBBED.has(lang) ? (
          <span className="font-semibold text-saffron">AI-dubbed sample</span>
        ) : audioState === 'playing' ? (
          <span className="inline-flex items-center gap-1 text-cream/55">
            <Volume2 size={13} aria-hidden="true" />
            Playing narration…
          </span>
        ) : audioState === 'speaking' ? (
          <span className="inline-flex items-center gap-1 text-cream/55">
            <Volume2 size={13} aria-hidden="true" />
            Speaking narration…
          </span>
        ) : audioState === 'unavailable' ? (
          <span className="text-cream/55">
            Narration for this language is not available in this demo.
          </span>
        ) : null}
      </div>
    </div>
  );
}
