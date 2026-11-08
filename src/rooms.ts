// Room model and pure filtering logic, kept separate from the UI.
import type { ExistingBooking } from "@/availability";

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
