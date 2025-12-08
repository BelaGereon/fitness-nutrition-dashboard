import { beforeEach, describe, expect, it } from "vitest";
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

describe("computeTrendMetrics", () => {
  let week1: WeekEntry;
  let week2: WeekEntry;
  let week3: WeekEntry;

  beforeEach(() => {
    week1 = makeWeekWithAvgWeight("2025-11-17", 80);
    week2 = makeWeekWithAvgWeight("2025-11-24", 78);
    week3 = makeWeekWithAvgWeight("2025-12-01", 79);
  });

  it("sorts weeks by weekOf date", () => {
    const weeksOutOfOrder = [week3, week1, week2];

    const trends = computeTrendMetrics([...weeksOutOfOrder]);

    expect(trends[0].weekOf).toBe("2025-11-17");
    expect(trends[1].weekOf).toBe("2025-11-24");
    expect(trends[2].weekOf).toBe("2025-12-01");
  });

  it("computes weight change vs previous week in kg", () => {
    const weeks = [week1, week2, week3];

    const trends = computeTrendMetrics(weeks);

    expect(trends[1].weightChangeVsPrevKg).toEqual(-2);
    expect(trends[2].weightChangeVsPrevKg).toEqual(1);
  });

  it("computes weight change vs previous week in percent", () => {
    const weeks = [week1, week2, week3];

    const trends = computeTrendMetrics(weeks);

    expect(trends[1].weightChangeVsPrevPercent).toBeCloseTo(-2.5);
    expect(trends[2].weightChangeVsPrevPercent).toBeCloseTo(1.28, 2);
  });

  it("handles weeks with no metric data without throwing", () => {
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

  it("skips weeks without avgWeight when computing deltas", () => {
    const week1 = makeWeekWithAvgWeight("2025-11-17", 80);
    const weekMiss = {
      id: "w-miss",
      weekOf: "2025-11-24",
      days: { mon: {}, tue: {}, wed: {}, thu: {}, fri: {}, sat: {}, sun: {} },
    };
    const week3 = makeWeekWithAvgWeight("2025-12-01", 79);

    const trends = computeTrendMetrics([week1, weekMiss, week3]);

    expect(trends[0].weightChangeVsPrevKg).toBeUndefined();
    expect(trends[1].weightChangeVsPrevKg).toBeUndefined();
    expect(trends[2].weightChangeVsPrevKg).toBe(-1); // or -1.00 depending on rounding
  });
});
