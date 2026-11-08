import { describe, expect, it } from "vitest";
import { NOW, ROOMS } from "@/data/rooms";
import {
  checkRoomAvailability,
  filterRooms,
  hasAllEquipment,
  hasCapacity,
  parseAttendees,
  roomsMatching,
  type Room,
} from "@/domain/rooms";

function room(id: string): Room {
  const found = ROOMS.find((r) => r.id === id);
  if (!found) throw new Error(`Room ${id} not in test data`);
  return found;
}

const ids = (rooms: readonly Room[]) => rooms.map((r) => r.id);

describe("F1 – capacity filter", () => {
  it("F1: a room with exactly the requested capacity is included (12 for C-310)", () => {
    expect(hasCapacity(room("C-310"), 12)).toBe(true);
    expect(ids(filterRooms(ROOMS, { attendees: 12, requiredEquipment: [] }))).toContain(
      "C-310"
    );
  });

  it("F1: a room with capacity one below the request is excluded (13 for C-310)", () => {
    expect(hasCapacity(room("C-310"), 13)).toBe(false);
    expect(
      ids(filterRooms(ROOMS, { attendees: 13, requiredEquipment: [] }))
    ).not.toContain("C-310");
  });
});

describe("F2 – equipment filter", () => {
  it("F2: a room must have ALL selected items, not just one", () => {
    // B-105 has Computers + Projector, but no Whiteboard
    expect(hasAllEquipment(room("B-105"), ["Computers", "Projector"])).toBe(true);
    expect(hasAllEquipment(room("B-105"), ["Computers", "Whiteboard"])).toBe(false);
    expect(
      ids(filterRooms(ROOMS, { attendees: 1, requiredEquipment: ["Projector", "Whiteboard"] }))
    ).toEqual(["A-201", "D-001"]);
  });

  it("F2: with no items selected, all rooms match", () => {
    expect(ids(filterRooms(ROOMS, { attendees: 1, requiredEquipment: [] }))).toEqual([
      "A-201",
      "B-105",
      "C-310",
      "D-001",
      "E-402",
    ]);
  });

  it("F2: an impossible combination returns an empty list", () => {
    // No room has both Computers and Video conferencing
    expect(
      filterRooms(ROOMS, {
        attendees: 1,
        requiredEquipment: ["Computers", "Video conferencing"],
      })
    ).toEqual([]);
  });
});

describe("F3 – blocked room", () => {
  it("F3: a blocked room can appear in filter results but is never reported as available", () => {
    const matches = filterRooms(ROOMS, { attendees: 100, requiredEquipment: [] });
    expect(ids(matches)).toEqual(["D-001"]);
    expect(matches[0].blocked).toBe(true);

    // D-001 has no bookings, and 11:00–12:00 is otherwise a valid request
    const result = checkRoomAvailability(matches[0], { start: 660, end: 720 }, NOW);
    expect(result).toEqual({
      available: false,
      reason: "This room is currently blocked and cannot be booked at any time.",
    });
  });
});

describe("parseAttendees", () => {
  it.each(["", "0", "abc", "2.5", "-3"])(
    "PARSE: attendees input %j is rejected",
    (value) => {
      expect(parseAttendees(value)).toBeNull();
    }
  );

  it("PARSE: a whole number of 1 or more is accepted", () => {
    expect(parseAttendees("1")).toBe(1);
    expect(parseAttendees(" 25 ")).toBe(25);
  });

  it("PARSE: invalid attendees show no rooms at all", () => {
    expect(roomsMatching(ROOMS, parseAttendees("abc"), [])).toEqual([]);
  });
});

describe("checkRoomAvailability", () => {
  it("ROOM: uses the selected room's own bookings", () => {
    const window = { start: 750, end: 840 }; // 12:30–14:00
    expect(checkRoomAvailability(room("A-201"), window, NOW)).toEqual({
      available: true,
    });
    expect(checkRoomAvailability(room("C-310"), window, NOW)).toEqual({
      available: false,
      reason:
        "The requested time overlaps an existing booking (Thesis Seminar: 13:00–14:00).",
    });
  });

  it("ROOM: an unparseable time window gives the HH:MM message", () => {
    expect(checkRoomAvailability(room("E-402"), null, NOW)).toEqual({
      available: false,
      reason: "Please enter valid times in 24-hour HH:MM format.",
    });
  });

  it("AC5: checkRoomAvailability() does not change the room's bookings", () => {
    const before = structuredClone(ROOMS);
    checkRoomAvailability(room("A-201"), { start: 630, end: 750 }, NOW); // overlap
    checkRoomAvailability(room("A-201"), { start: 750, end: 840 }, NOW); // available
    expect(ROOMS).toEqual(before);
  });
});
