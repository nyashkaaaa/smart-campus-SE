// Pure time helpers. No React.
// Times are represented as integer minutes after midnight (0 <= t <= MINUTES_PER_DAY).

/** Minutes in one day. Also the latest allowed end time (24:00). */
export const MINUTES_PER_DAY = 1440;

/** A requested time window in minutes after midnight. Not validated here. */
export interface TimeWindow {
  readonly start: number;
  readonly end: number;
}

export function minutesToLabel(min: number): string {
  const m = Math.min(Math.max(min, 0), MINUTES_PER_DAY);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function labelToMinutes(label: string): number | null {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(label.trim());
  if (!match) return null;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

/**
 * Converts the form values into a TimeWindow.
 * "End at midnight" means end = MINUTES_PER_DAY (24:00).
 * Returns null if either time is not a valid HH:MM label.
 * Order and range are NOT checked here; canBook() does that (AC1).
 */
export function parseTimeWindow(
  startLabel: string,
  endLabel: string,
  endAtMidnight: boolean
): TimeWindow | null {
  const start = labelToMinutes(startLabel);
  const end = endAtMidnight ? MINUTES_PER_DAY : labelToMinutes(endLabel);
  if (start === null || end === null) return null;
  return { start, end };
}

/** Length of the window in minutes (may be negative if end is before start). */
export function windowDuration(window: TimeWindow): number {
  return window.end - window.start;
}
