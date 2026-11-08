import { describe, expect, it } from "vitest";
import {
  labelToMinutes,
  minutesToLabel,
  MINUTES_PER_DAY,
  parseTimeWindow,
  windowDuration,
} from "@/domain/time";

describe("parseTimeWindow", () => {
  it.each(["", "abc", "24:00", "9:60", "12:5"])(
    "PARSE: start time %j is rejected",
    (start) => {
      expect(parseTimeWindow(start, "12:00", false)).toBeNull();
    }
  );

  it("PARSE: an invalid end time is rejected", () => {
    expect(parseTimeWindow("10:30", "", false)).toBeNull();
  });

  it("PARSE: valid HH:MM times become minutes after midnight", () => {
    expect(parseTimeWindow("10:30", "12:30", false)).toEqual({ start: 630, end: 750 });
  });

  it("PARSE: 'End at midnight' sets the end to 1440 and ignores the end field", () => {
    expect(parseTimeWindow("22:00", "", true)).toEqual({
      start: 1320,
      end: MINUTES_PER_DAY,
    });
  });

  it("PARSE: the window is not validated here, so end before start is still returned", () => {
    const window = parseTimeWindow("12:00", "11:00", false);
    expect(window).toEqual({ start: 720, end: 660 });
    expect(windowDuration(window!)).toBe(-60);
  });
});

describe("time labels", () => {
  it("TIME: labelToMinutes and minutesToLabel convert both ways", () => {
    expect(labelToMinutes("09:05")).toBe(545);
    expect(minutesToLabel(545)).toBe("09:05");
    expect(minutesToLabel(MINUTES_PER_DAY)).toBe("24:00");
  });
});
