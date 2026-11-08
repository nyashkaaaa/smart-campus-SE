import { describe, expect, it } from "vitest";
import {
  canBook,
  MAX_DURATION_MINUTES,
  type AvailabilityInput,
  type ExistingBooking,
} from "@/domain/availability";
import { MINUTES_PER_DAY } from "@/domain/time";

const NOW = 600; // 10:00, same as src/data/rooms.ts

// One existing booking from 12:00 to 13:00, used by the overlap tests.
const NOON_BOOKING: ExistingBooking = {
  id: "t-1",
  start: 720,
  end: 780,
  label: "Test Lecture",
};

/** Builds a valid request; each test overrides only what it is about. */
function input(overrides: Partial<AvailabilityInput> = {}): AvailabilityInput {
  return {
    start: 660, // 11:00
    end: 720, // 12:00
    now: NOW,
    blocked: false,
    existing: [],
    ...overrides,
  };
}

describe("AC1 – valid time", () => {
  it("AC1: start equal to now is rejected", () => {
    const result = canBook(input({ start: NOW, end: NOW + 60 }));
    expect(result).toEqual({
      available: false,
      reason: "The start time must be in the future (right now it is 10:00).",
    });
  });

  it("AC1: start one minute after now is allowed", () => {
    expect(canBook(input({ start: NOW + 1, end: NOW + 61 }))).toEqual({
      available: true,
    });
  });

  it("AC1: end equal to start is rejected", () => {
    const result = canBook(input({ start: 700, end: 700 }));
    expect(result).toEqual({
      available: false,
      reason:
        "Please enter a valid time range: start before end, between 00:00 and 24:00.",
    });
  });

  it("AC1: end before start is rejected", () => {
    expect(canBook(input({ start: 700, end: 690 })).available).toBe(false);
  });

  it("AC1: end exactly at 1440 (24:00) is allowed", () => {
    expect(
      canBook(input({ start: MINUTES_PER_DAY - 60, end: MINUTES_PER_DAY }))
    ).toEqual({ available: true });
  });

  it("AC1: end after 1440 is rejected", () => {
    const result = canBook(
      input({ start: MINUTES_PER_DAY - 60, end: MINUTES_PER_DAY + 1 })
    );
    expect(result).toEqual({
      available: false,
      reason:
        "Please enter a valid time range: start before end, between 00:00 and 24:00.",
    });
  });
});

describe("AC2 – duration", () => {
  it("AC2: exactly 120 minutes is allowed", () => {
    expect(MAX_DURATION_MINUTES).toBe(120);
    expect(canBook(input({ start: 660, end: 780 }))).toEqual({
      available: true,
    });
  });

  it("AC2: 121 minutes is rejected", () => {
    expect(canBook(input({ start: 660, end: 781 }))).toEqual({
      available: false,
      reason:
        "The requested duration is 121 minutes. The maximum allowed is 120 minutes.",
    });
  });
});

describe("AC3 – blocked room", () => {
  it("AC3: a blocked room is unavailable even with no bookings and a valid time", () => {
    expect(canBook(input({ blocked: true, existing: [] }))).toEqual({
      available: false,
      reason: "This room is currently blocked and cannot be booked at any time.",
    });
  });
});

describe("AC4 – overlapping bookings", () => {
  it("AC4: a request ending exactly when a booking starts is allowed", () => {
    // 11:00–12:00 touches 12:00–13:00
    expect(
      canBook(input({ start: 660, end: 720, existing: [NOON_BOOKING] }))
    ).toEqual({ available: true });
  });

  it("AC4: a request starting exactly when a booking ends is allowed", () => {
    // 13:00–14:00 touches 12:00–13:00
    expect(
      canBook(input({ start: 780, end: 840, existing: [NOON_BOOKING] }))
    ).toEqual({ available: true });
  });

  it("AC4: overlapping a booking by 1 minute is rejected", () => {
    // 11:00–12:01 overlaps 12:00–13:00 by one minute
    expect(
      canBook(input({ start: 660, end: 721, existing: [NOON_BOOKING] }))
    ).toEqual({
      available: false,
      reason:
        "The requested time overlaps an existing booking (Test Lecture: 12:00–13:00).",
    });
  });

  it("AC4: a request fully containing a booking is rejected", () => {
    // 11:30–13:30 contains 12:00–13:00
    expect(
      canBook(input({ start: 690, end: 810, existing: [NOON_BOOKING] })).available
    ).toBe(false);
  });
});

describe("AC5 – bookings are never changed", () => {
  it("AC5: canBook() does not change the bookings array", () => {
    const existing: ExistingBooking[] = [
      NOON_BOOKING,
      { id: "t-2", start: 900, end: 960, label: "Other" },
    ];
    const before = structuredClone(existing);

    canBook(input({ existing })); // available
    canBook(input({ start: 700, end: 760, existing })); // overlap

    expect(existing).toEqual(before);
  });
});
