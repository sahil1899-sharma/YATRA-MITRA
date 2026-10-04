# Yatra Mitra — clickable prototype

Formalising Jammu's e-rickshaw fleet as app-hailed, story-led heritage circuits:
fixed notified fares, verified Mitra drivers, a women-driver Yatra Sakhi cohort,
a ropeway-feeder pilot, and a Jammu Tawi arrival kiosk.

React 18 + Vite + TypeScript (strict) + Tailwind + React Router v6 + Zustand
(persisted to localStorage) + Recharts + lucide-react + qrcode.react.
No backend, no external APIs, no CDN assets — works offline after first load.

## How to run

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # production build -> dist/
```

Views: `/` launcher · `/p` passenger app · `/d` driver app · `/k` kiosk (tablet)
· `/a` admin (Tourism Pulse + verification queue) · `/verify/:mitraId` public
badge check · `/share/:token` read-only live-trip link.

## How to reset demo data

- In the app: Admin → **Reset demo data** (top-right of the Tourism Pulse page).
- In the browser console: `localStorage.removeItem('yatra-mitra-demo-v1')` then reload.
- Corrupted saved data is detected on load: the app falls back to seed data and
  shows a notice instead of a blank screen.

## Demo script (for judges — about 60 seconds)

1. **Book** — open `/p`, pick *Arrival–Ropeway–Aarti*, choose the 4:00 PM slot,
   tap **Confirm booking**. Note the fixed ₹499/person fare and the digital receipt.
2. **Verify** — on the receipt, open the driver card and **scan the QR**
   (or visit `/verify/YM-1001`): green *Verified Mitra* plus the trust stack.
3. **Ride** — tap **Start ride**, open *Demo controls — Simulated GPS*, drag the
   progress slider: stop stories appear with *Sample narration* audio.
4. **Drive** — open `/d`, sign in as the assigned driver, **Accept** and
   **Start trip**: the same trip, the same progress.
5. **Approve** — open `/a/verification`, advance an applicant to
   **Approve & issue badge**: they turn Verified and become assignable.
6. **Pulse** — open `/a`: *71.7% of C1 riders boarded the ropeway* — the
   ropeway-conversion story, with every simulated figure labelled.

## What is simulated

Everything below is labelled in the UI with **Simulated**, **Demo** or **Sample**.
Nothing else pretends to be live.

- **Tourism Pulse dashboard** (`/a`): all KPIs marked Simulated, the ropeway
  conversion funnel, the 14-day rider chart (dashed line: *Reported baseline:
  under 100 riders/day (Daily Excelsior, Feb 2026)*), circuit-demand donut,
  origin mix, dwell-time table, and the printed monthly report.
- **Driver earnings** (`/d/earnings`): the weekly chart is Simulated; the daily
  figure is real (sums completed trips in this demo). Welfare pool ₹2,400 is
  Simulated. The *₹500–550/day street baseline* is a reported figure, labelled.
- **GPS**: the ride map, driver map and share page run on **Simulated GPS** —
  a hand-drawn offline SVG of Jammu (*Illustrated map of Jammu — not to scale*),
  not real locations. The kiosk *positioning card* is a static Demo.
- **Audio**: stop stories are **Sample narration** (≤60 words); mp3 files are
  tried first, then Hindi/English device TTS, otherwise *not available in this demo*.
- **Payments**: *UPI (demo)* — *no money is charged*.
- **People**: verification-queue applicants are *Sample profiles — not real people*.
- **SOS**: *Demo: no real call was placed* — incidents appear in the admin queue.
- **Share links**: *work in the same browser because the demo has no server*.
- **Receipts**: marked *Demo receipt*; nothing is emailed or SMSed.

Real within the demo: bookings, dispatch (badged + online drivers, least-busy
first, Sakhi preference), trip state machine, return-guarantee slot filtering,
cross-tab progress sync, verification pipeline, and incident queue.
