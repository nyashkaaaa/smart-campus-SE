// Availability logic, kept separate from the UI.
// Times are represented as integer minutes after midnight (0 <= t <= 1440).

export interface ExistingBooking {
  /** Unique id, used as a stable React key */
  readonly id: string;
  /** Minutes after midnight */
  readonly start: number;
  /** Minutes after midnight */
  readonly end: number;
  /** Label shown to the user */
  readonly label: string;
}

export type AvailabilityOutcome =
  | { available: true }
  | { available: false; reason: string };

export interface AvailabilityInput {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  existing: readonly ExistingBooking[];
}

export const MAX_DURATION_MINUTES = 120;

export function minutesToLabel(min: number): string {
  const m = Math.min(Math.max(min, 0), 1440);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function labelToMinutes(label: string): number | null {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(label.trim());
  if (!match) return null;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

// Pure validation function. Returns either Available or Unavailable with a reason.
// Does NOT mutate existing bookings and never creates a booking.
export function canBook(input: AvailabilityInput): AvailabilityOutcome {
  const { start, end, now, blocked, existing } = input;

  if (blocked) {
    return {
      available: false,
      reason: "This room is currently blocked and cannot be booked at any time.",
    };
  }

  if (!(0 <= start && start < end && end <= 1440)) {
    return {
      available: false,
      reason:
        "Please enter a valid time range: start before end, between 00:00 and 24:00.",
    };
  }

  if (start <= now) {
    return {
      available: false,
      reason: `The start time must be in the future (right now it is ${minutesToLabel(
        now
      )}).`,
    };
  }

  const duration = end - start;
  if (duration > MAX_DURATION_MINUTES) {
    return {
      available: false,
      reason: `The requested duration is ${duration} minutes. The maximum allowed is ${MAX_DURATION_MINUTES} minutes.`,
    };
  }

  // Half-open overlap: start < booked_end && booked_start < end
  for (const booking of existing) {
    if (start < booking.end && booking.start < end) {
      return {
        available: false,
        reason: `The requested time overlaps an existing booking (${booking.label}: ${minutesToLabel(
          booking.start
        )}–${minutesToLabel(booking.end)}).`,
      };
    }
  }

  return { available: true };
}
