import { describe, expect, it } from "vitest";
import { type WeekEntry } from "./week";
import { computeTrendMetrics } from "./weekTrend";

const makeWeekWithAvgWeight = (
  weekOf: string,
  avgWeight: number
): WeekEntry => ({
  id: weekOf,
  weekOf,
  days: {
    mon: { weightKg: avgWeight },
    tue: {},
    wed: {},
    thu: {},
    fri: {},
    sat: {},
    sun: {},
  },
});

const setup = () => {
  const week1 = makeWeekWithAvgWeight("2025-11-17", 80);
  const week2 = makeWeekWithAvgWeight("2025-11-24", 78);
  const week3 = makeWeekWithAvgWeight("2025-12-01", 79);
  return { week1, week2, week3 };
};

describe("computeTrendMetrics", () => {
  it("sorts: weeks by weekOf ascending", () => {
    const { week1, week2, week3 } = setup();
    const trends = computeTrendMetrics([week3, week1, week2]);

    expect(trends.map((t) => t.weekOf)).toEqual([
      "2025-11-17",
      "2025-11-24",
      "2025-12-01",
    ]);
  });

  it.each([
    ["2025-11-24", -2],
    ["2025-12-01", 1],
  ] as const)("computes: weightChangeVsPrevKg for %s", (weekOf, expected) => {
    const { week1, week2, week3 } = setup();
    const trends = computeTrendMetrics([week1, week2, week3]);
    const byWeekOf = Object.fromEntries(trends.map((t) => [t.weekOf, t]));

    expect(byWeekOf[weekOf].weightChangeVsPrevKg).toEqual(expected);
  });

  it.each([
    ["2025-11-24", -2.5],
    ["2025-12-01", 1.28],
  ] as const)(
    "computes: weightChangeVsPrevPercent for %s",
    (weekOf, expected) => {
      const { week1, week2, week3 } = setup();
      const trends = computeTrendMetrics([week1, week2, week3]);
      const byWeekOf = Object.fromEntries(trends.map((t) => [t.weekOf, t]));

      expect(byWeekOf[weekOf].weightChangeVsPrevPercent).toBeCloseTo(
        expected,
        weekOf === "2025-12-01" ? 2 : 1
      );
    }
  );

  it("handles: weeks with no metric data without throwing", () => {
    const w1: WeekEntry = {
      id: "w1",
      weekOf: "2025-11-17",
      days: { mon: {}, tue: {}, wed: {}, thu: {}, fri: {}, sat: {}, sun: {} },
    };
    const w2 = makeWeekWithAvgWeight("2025-11-24", 78);

    const trends = computeTrendMetrics([w1, w2]);

    expect(trends[0].avgWeightKg).toBeUndefined();
    expect(trends[1].weightChangeVsPrevKg).toBeUndefined();
  });

  it("skips: weeks without avgWeight when computing deltas", () => {
    const week1 = makeWeekWithAvgWeight("2025-11-17", 80);
    const weekMiss: WeekEntry = {
      id: "w-miss",
      weekOf: "2025-11-24",
      days: { mon: {}, tue: {}, wed: {}, thu: {}, fri: {}, sat: {}, sun: {} },
    };
    const week3 = makeWeekWithAvgWeight("2025-12-01", 79);

    const trends = computeTrendMetrics([week1, weekMiss, week3]);

    expect(trends.map((t) => t.weightChangeVsPrevKg)).toEqual([
      undefined,
      undefined,
      -1,
    ]);
  });

  it("handles: weeks with no weight data at all", () => {
    const w1: WeekEntry = {
      id: "w1",
      weekOf: "2025-11-17",
      days: { mon: {}, tue: {}, wed: {}, thu: {}, fri: {}, sat: {}, sun: {} },
    };
    const w2: WeekEntry = {
      id: "w2",
      weekOf: "2025-11-27",
      days: { mon: {}, tue: {}, wed: {}, thu: {}, fri: {}, sat: {}, sun: {} },
    };
    const w3: WeekEntry = {
      id: "w3",
      weekOf: "2025-12-04",
      days: { mon: {}, tue: {}, wed: {}, thu: {}, fri: {}, sat: {}, sun: {} },
    };

    const trends = computeTrendMetrics([w1, w2, w3]);

    expect(trends.map((t) => t.avgWeightKg)).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
  });
});
