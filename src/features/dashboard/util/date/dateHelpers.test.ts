import { describe, expect, it } from "vitest";
import {
  addDaysToISODate,
  findNextUntrackedWeek,
  mondayOfWeek,
  getMondayOfWeek,
  convertDateToISO,
  toLocalMiddayTimestampMs,
} from "./dateHelpers";

describe("dateHelpers", () => {
  it("computes Monday for any date in the same week", () => {
    expect(mondayOfWeek(new Date("2026-01-07T10:00:00"))).toBe("2026-01-05"); // Wed
    expect(mondayOfWeek(new Date("2025-12-07T10:00:00"))).toBe("2025-12-01"); // Sun
  });

  it("adds days to ISO date strings while preserving local dates", () => {
    expect(addDaysToISODate("2025-12-01", 7)).toBe("2025-12-08");
    expect(addDaysToISODate("2025-12-01", -1)).toBe("2025-11-30");
  });

  it("normalizes arbitrary dates to their week's Monday", () => {
    expect(getMondayOfWeek("2025-12-04")).toBe("2025-12-01");
    expect(getMondayOfWeek("2026-01-07")).toBe("2026-01-05");
  });

  it("finds the first missing weekOf stepping by 7 days", () => {
    const existing = new Set(["2025-12-01", "2025-12-08", "2025-12-15"]);
    expect(
      findNextUntrackedWeek({
        startWeekOf: "2025-12-01",
        existingWeekOfs: existing,
      }),
    ).toBe("2025-12-22");
  });

  it("handles DST transitions and month boundaries without shifting dates", () => {
    expect(addDaysToISODate("2025-03-09", 1)).toBe("2025-03-10"); // spring forward
    expect(addDaysToISODate("2025-11-02", 1)).toBe("2025-11-03"); // fall back
    expect(mondayOfWeek(new Date("2025-03-09T01:00:00"))).toBe("2025-03-03");
    expect(mondayOfWeek(new Date("2025-11-02T01:00:00"))).toBe("2025-10-27");
  });

  it("handles end-of-month rollovers including leap years", () => {
    expect(addDaysToISODate("2025-01-31", 1)).toBe("2025-02-01");
    expect(addDaysToISODate("2024-02-29", 1)).toBe("2024-03-01");
  });

  it("formats dates as YYYY-MM-DD at local midday to avoid timezone drift", () => {
    const nearMidnight = new Date(2025, 11, 31, 23, 59, 0); // local Dec 31
    expect(convertDateToISO(nearMidnight)).toBe("2025-12-31");
  });

  describe("toLocalMiddayTimestampMs", () => {
    it("builds a local midday timestamp for the provided ISO date", () => {
      const iso = "2025-12-01";
      const expected = new Date(2025, 11, 1, 12, 0, 0, 0).getTime();

      const result = toLocalMiddayTimestampMs(iso);

      expect(result).toBe(expected);
    });

    it("handles leading zeros in month/day fields", () => {
      const iso = "2025-01-05";
      const expected = new Date(2025, 0, 5, 12, 0, 0, 0).getTime();

      const result = toLocalMiddayTimestampMs(iso);

      expect(result).toBe(expected);
    });
  });
});
