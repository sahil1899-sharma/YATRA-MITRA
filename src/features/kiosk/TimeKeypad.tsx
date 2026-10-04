import { useState } from 'react';
import { Delete } from 'lucide-react';
import { formatKeypadTime, keypadDigitAllowed } from '../../lib/kiosk';

// Large on-page numeric keypad for departure-time entry. No OS keyboard.
export default function TimeKeypad({
  onChange,
}: {
  onChange: (value: string) => void;
}) {
  const [digits, setDigits] = useState('');

  const push = (d: string) => {
    if (!keypadDigitAllowed(digits, d)) return;
    const next = (digits + d).slice(0, 4);
    setDigits(next);
    onChange(next.length === 4 ? formatKeypadTime(next) : '');
  };

  const backspace = () => {
    const next = digits.slice(0, -1);
    setDigits(next);
    onChange(next.length === 4 ? formatKeypadTime(next) : '');
  };

  const clear = () => {
    setDigits('');
    onChange('');
  };

  const shown = formatKeypadTime(digits).padEnd(5, '·');

  return (
    <div>
      <div
        aria-live="polite"
        className="mx-auto w-fit rounded-card border border-white/15 bg-night-soft px-8 py-3 text-center font-display text-4xl font-bold tracking-[0.2em] text-cream"
      >
        {shown}
      </div>
      <div className="mx-auto mt-4 grid max-w-md grid-cols-3 gap-2.5" role="group" aria-label="Time keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => push(d)}
            className="min-h-[64px] rounded-card border border-white/15 bg-white/[0.06] font-display text-2xl font-bold text-cream transition hover:border-saffron/60 active:bg-saffron/20"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={clear}
          className="min-h-[64px] rounded-card border border-white/15 bg-white/[0.04] text-sm font-bold text-cream/60 transition hover:border-white/30"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => push('0')}
          className="min-h-[64px] rounded-card border border-white/15 bg-white/[0.06] font-display text-2xl font-bold text-cream transition hover:border-saffron/60 active:bg-saffron/20"
        >
          0
        </button>
        <button
          type="button"
          onClick={backspace}
          aria-label="Backspace"
          className="flex min-h-[64px] items-center justify-center rounded-card border border-white/15 bg-white/[0.04] text-cream/70 transition hover:border-white/30"
        >
          <Delete size={22} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
