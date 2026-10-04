Story narration audio for the ride experience.

These are studio-style narrations (one consistent narrator voice) generated
2026-10-04 for the demo. File name pattern: {stopId}.{lang}.mp3
Example: s_bahu.hi.mp3  (Hindi narration for the Bahu Fort gate stop)
         s_bahu.en.mp3  (English narration for the Bahu Fort gate stop)

Covered stops (5): s_bahu, s_ghat, s_mubarak, s_raghunath, s_ranbir
Languages: hi, en.

How it works (see src/components/StoryAudio.tsx): the ride screen first tries
/audio/{stopId}.{lang}.mp3 (HEAD check for audio/*). If a file exists it plays
it; otherwise Hindi/English fall back to on-device speech synthesis, and every
other language reports unavailable. Stories are never translated or dubbed by us.
