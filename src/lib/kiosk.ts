// Kiosk (/k) shared bits.

// Inactivity timeout for the kiosk idle screen. The acceptance test
// temporarily shortens this constant and restores it afterwards.
export const KIOSK_IDLE_TIMEOUT_MS = 60000;

/** Format keypad digits as HH:MM (partial input shows what is typed). */
export function formatKeypadTime(digits: string): string {
  const d = digits.slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}:${d.slice(2)}`;
}

/** Whether a keypad digit is allowed at the given position (keeps HH:MM valid). */
export function keypadDigitAllowed(digits: string, digit: string): boolean {
  const pos = digits.length;
  if (pos >= 4) return false;
  if (pos === 0) return digit <= '2';
  if (pos === 1) return digits[0] === '2' ? digit <= '3' : true;
  if (pos === 2) return digit <= '5';
  return true;
}

/** "3 hr", "2 hr 30 min", "45 min". */
export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}
