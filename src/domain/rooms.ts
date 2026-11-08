// Room model, filtering (F1, F2) and the per-room availability check. Pure TypeScript, no React.
import {
  canBook,
  type AvailabilityOutcome,
  type ExistingBooking,
} from "@/domain/availability";
import type { TimeWindow } from "@/domain/time";

export type Equipment =
  | "Projector"
  | "Whiteboard"
  | "Computers"
  | "Video conferencing";

/** All equipment options, in the order shown in the filter form. */
export const ALL_EQUIPMENT: readonly Equipment[] = [
  "Projector",
  "Whiteboard",
  "Computers",
  "Video conferencing",
];

export interface Room {
  readonly id: string;
  readonly name: string;
  readonly capacity: number;
  readonly equipment: readonly Equipment[];
  readonly blocked: boolean;
  readonly bookings: readonly ExistingBooking[];
}

export interface RoomFilters {
  attendees: number;
  requiredEquipment: readonly Equipment[];
}

/** Whole number >= 1, otherwise null. */
export function parseAttendees(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const n = parseInt(trimmed, 10);
  return n >= 1 ? n : null;
}

/** F1: room capacity must be greater than or equal to the requested attendees. */
export function hasCapacity(room: Room, attendees: number): boolean {
  return room.capacity >= attendees;
}

/** F2: room must contain ALL required items. No required items -> always true. */
export function hasAllEquipment(
  room: Room,
  required: readonly Equipment[]
): boolean {
  return required.every((item) => room.equipment.includes(item));
}

/**
 * Returns the rooms that satisfy both filters, in catalog order.
 * Blocked rooms are NOT removed here: they stay visible (with a "Blocked"
 * badge in the UI), and canBook() always reports them as unavailable (F3).
 */
export function filterRooms(
  rooms: readonly Room[],
  filters: RoomFilters
): Room[] {
  return rooms.filter(
    (room) =>
      hasCapacity(room, filters.attendees) &&
      hasAllEquipment(room, filters.requiredEquipment)
  );
}

/**
 * Rooms to show for the current form values.
 * An invalid attendee count (null) shows no rooms.
 */
export function roomsMatching(
  rooms: readonly Room[],
  attendees: number | null,
  requiredEquipment: readonly Equipment[]
): Room[] {
  return attendees === null
    ? []
    : filterRooms(rooms, { attendees, requiredEquipment });
}

/**
 * Checks one room for a time window. Uses that room's own blocked flag
 * and bookings (F3). A null window means the times could not be parsed.
 */
export function checkRoomAvailability(
  room: Room,
  window: TimeWindow | null,
  now: number
): AvailabilityOutcome {
  if (window === null) {
    return {
      available: false,
      reason: "Please enter valid times in 24-hour HH:MM format.",
    };
  }
  return canBook({
    start: window.start,
    end: window.end,
    now,
    blocked: room.blocked,
    existing: room.bookings,
  });
}
