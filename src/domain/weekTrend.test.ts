import { beforeEach, describe, expect, it } from "vitest";
import { computeTrendMetrics, type WeekEntry } from "./week";

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
});
