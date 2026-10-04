// 'HH:MM' -> minutes since midnight
export function parseHHMM(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// 'HH:MM' plus minutes -> 'HH:MM', wrapping past midnight
export function addMinutes(hhmm: string, minutes: number): string {
  const day = 24 * 60;
  const total = (((parseHHMM(hhmm) + minutes) % day) + day) % day;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
