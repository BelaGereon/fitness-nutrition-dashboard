import { describe, expect, it } from "vitest";
import type { DayEntry, DayId, WeekEntry } from "../../../../../../domain/week";
import {
  addDaysToISODate,
  toLocalMiddayTimestampMs,
} from "../../../../util/date/dateHelpers";
import {
  buildAvgWeightLineFromWeeks,
  buildWeightPointsFromWeeks,
} from "./weightSeries";

const emptyDays = (): Record<DayId, DayEntry> => ({
  mon: {},
  tue: {},
  wed: {},
  thu: {},
  fri: {},
  sat: {},
  sun: {},
});

const makeWeek = (
  id: string,
  weekOf: string,
  weights: Partial<Record<DayId, number>>,
): WeekEntry => {
  const days = emptyDays();
  for (const [dayId, weightKg] of Object.entries(weights)) {
    days[dayId as DayId] = { weightKg };
  }

  return {
    id,
    weekOf,
    days,
  };
};

describe("weightSeries", () => {
  describe("buildWeightPointsFromWeeks", () => {
    it("maps week day weights to timestamped points", () => {
      const week = makeWeek("w1", "2025-12-01", {
        mon: 80.1,
        wed: 79.7,
        sun: 79.4,
      });

      const base = toLocalMiddayTimestampMs(week.weekOf);
      const points = buildWeightPointsFromWeeks([week]);

      expect(points).toEqual([
        { x: base, y: 80.1 },
        {
          x: toLocalMiddayTimestampMs(addDaysToISODate(week.weekOf, 2)),
          y: 79.7,
        },
        {
          x: toLocalMiddayTimestampMs(addDaysToISODate(week.weekOf, 6)),
          y: 79.4,
        },
      ]);
    });

    it("skips days that do not have a weight", () => {
      const week = makeWeek("w1", "2025-12-01", {
        tue: 80.0,
      });

      const points = buildWeightPointsFromWeeks([week]);
      expect(points).toHaveLength(1);
      expect(points[0].y).toBe(80.0);
    });

    it("sorts points chronologically across multiple weeks", () => {
      const weekLate = makeWeek("w2", "2025-12-08", {
        mon: 79.0,
      });
      const weekEarly = makeWeek("w1", "2025-12-01", {
        sun: 79.5,
      });

      const points = buildWeightPointsFromWeeks([weekLate, weekEarly]);
      expect(points).toEqual([
        {
          x: toLocalMiddayTimestampMs(addDaysToISODate(weekEarly.weekOf, 6)),
          y: 79.5,
        },
        { x: toLocalMiddayTimestampMs(weekLate.weekOf), y: 79.0 },
      ]);
    });

    it("dedupes points by timestamp, keeping the last value", () => {
      const weekA = makeWeek("w1", "2025-12-01", {
        mon: 80.0,
      });
      const weekB = makeWeek("w2", "2025-12-01", {
        mon: 81.2,
      });

      const points = buildWeightPointsFromWeeks([weekA, weekB]);
      expect(points).toHaveLength(1);
      expect(points[0].y).toBe(81.2);
    });

    it("handles multiple weights across multiple weeks", () => {
      const weekA = makeWeek("w1", "2025-12-01", {
        mon: 80.0,
        fri: 79.6,
      });
      const weekB = makeWeek("w2", "2025-12-08", {
        tue: 79.3,
        sat: 78.9,
      });

      const points = buildWeightPointsFromWeeks([weekB, weekA]);
      expect(points).toEqual([
        { x: toLocalMiddayTimestampMs(weekA.weekOf), y: 80.0 },
        {
          x: toLocalMiddayTimestampMs(addDaysToISODate(weekA.weekOf, 4)),
          y: 79.6,
        },
        {
          x: toLocalMiddayTimestampMs(addDaysToISODate(weekB.weekOf, 1)),
          y: 79.3,
        },
        {
          x: toLocalMiddayTimestampMs(addDaysToISODate(weekB.weekOf, 5)),
          y: 78.9,
        },
      ]);
    });
  });

  describe("buildAvgWeightLineFromWeeks", () => {
    it("builds points for each week's average weight", () => {
      const weekA = makeWeek("w1", "2025-12-01", {
        mon: 80.0,
        wed: 79.0,
        fri: 78.0,
      }); // avg 79.0
      const weekB = makeWeek("w2", "2025-12-08", {
        tue: 77.0,
        thu: 79.0,
      }); // avg 78.0
      const weekC = makeWeek("w3", "2025-12-15", {}); // no weights

      const points = buildAvgWeightLineFromWeeks([weekA, weekB, weekC]);
      expect(points).toEqual([
        {
          x: toLocalMiddayTimestampMs(weekA.weekOf),
          y: 79.0,
        },
        {
          x: toLocalMiddayTimestampMs(weekB.weekOf),
          y: 78.0,
        },
      ]);
    });

    it("skips weeks without weight data", () => {
      const week = makeWeek("w1", "2025-12-01", {});

      const points = buildAvgWeightLineFromWeeks([week]);
      expect(points).toHaveLength(0);
    });

    it("sorts average points chronologically", () => {
      const weekLate = makeWeek("w2", "2025-12-08", { mon: 79.0 });
      const weekEarly = makeWeek("w1", "2025-12-01", { fri: 78.0 });

      const points = buildAvgWeightLineFromWeeks([weekLate, weekEarly]);
      expect(points).toEqual([
        { x: toLocalMiddayTimestampMs(weekEarly.weekOf), y: 78.0 },
        { x: toLocalMiddayTimestampMs(weekLate.weekOf), y: 79.0 },
      ]);
    });

    it("dedupes average points by timestamp, keeping the last value", () => {
      const weekA = makeWeek("w1", "2025-12-01", { mon: 80.0 });
      const weekB = makeWeek("w2", "2025-12-01", { mon: 82.0 });

      const points = buildAvgWeightLineFromWeeks([weekA, weekB]);
      expect(points).toEqual([
        { x: toLocalMiddayTimestampMs(weekA.weekOf), y: 82.0 },
      ]);
    });
  });
});
