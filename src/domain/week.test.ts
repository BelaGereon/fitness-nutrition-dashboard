import { describe, expect, it } from "vitest";
import { computeWeekMetrics, type WeekEntry } from "./week";

const makeEmptyWeek = (overrides: Partial<WeekEntry> = {}): WeekEntry => ({
  id: "week-1",
  weekOf: "2025-11-24",
  days: {
    mon: {},
    tue: {},
    wed: {},
    thu: {},
    fri: {},
    sat: {},
    sun: {},
  },
  ...overrides,
});

const baselineWeek: WeekEntry = makeEmptyWeek({
  days: {
    mon: { weightKg: 78.7, calories: 2800, proteinG: 150 },
    tue: { weightKg: 78.0, calories: 2700, proteinG: 160 },
    wed: {},
    thu: { weightKg: 77.8, calories: 2600, proteinG: 155 },
    fri: { weightKg: 78.7, calories: 2900, proteinG: 170 },
    sat: { weightKg: 78.5, calories: 3000, proteinG: 165 },
    sun: { weightKg: 79.0, calories: 3100, proteinG: 180 },
  },
});

const setup = (week: WeekEntry = baselineWeek) => {
  const metrics = computeWeekMetrics(week);
  return { week, metrics };
};

describe("computeWeekMetrics", () => {
  it("computes: avgWeightKg from logged weights", () => {
    const { metrics } = setup();
    expect(metrics?.avgWeightKg).toBeCloseTo(
      (78.7 + 78.0 + 77.8 + 78.7 + 78.5 + 79.0) / 6
    );
  });

  it("computes: minWeightKg from logged weights", () => {
    const { metrics } = setup();
    expect(metrics?.minWeightKg).toBe(77.8);
  });

  it("computes: maxWeightKg from logged weights", () => {
    const { metrics } = setup();
    expect(metrics?.maxWeightKg).toBe(79.0);
  });

  it("computes: avgCalories from logged calories", () => {
    const { metrics } = setup();
    expect(metrics?.avgCalories).toBeCloseTo(
      (2800 + 2700 + 2600 + 2900 + 3000 + 3100) / 6
    );
  });

  it("computes: avgProteinG from logged protein", () => {
    const { metrics } = setup();
    expect(metrics?.avgProteinG).toBeCloseTo(
      (150 + 160 + 155 + 170 + 165 + 180) / 6
    );
  });

  it("computes: avgProteinPerKg when weight+protein are present", () => {
    const { metrics } = setup();
    expect(metrics?.avgProteinPerKg).toBeCloseTo(
      (150 / 78.7 +
        160 / 78.0 +
        155 / 77.8 +
        170 / 78.7 +
        165 / 78.5 +
        180 / 79.0) /
        6
    );
  });

  it("returns: undefined when no metric data is present", () => {
    const { metrics } = setup(makeEmptyWeek());
    expect(metrics).toBeUndefined();
  });

  it("computes: avgCalories even when no weight/protein is present", () => {
    const week = makeEmptyWeek({
      days: {
        mon: { calories: 2500 },
        tue: { calories: 2700 },
        wed: {},
        thu: { calories: 2600 },
        fri: {},
        sat: {},
        sun: {},
      },
    });

    const { metrics } = setup(week);

    expect(metrics?.avgCalories).toBeCloseTo((2500 + 2700 + 2600) / 3, 5);
  });

  it("returns: weight/protein metrics undefined when only calories are present", () => {
    const week = makeEmptyWeek({
      days: {
        mon: { calories: 2500 },
        tue: { calories: 2700 },
        wed: {},
        thu: { calories: 2600 },
        fri: {},
        sat: {},
        sun: {},
      },
    });

    const { metrics } = setup(week);

    expect(metrics?.avgWeightKg).toBeUndefined();
    expect(metrics?.avgProteinG).toBeUndefined();
    expect(metrics?.avgProteinPerKg).toBeUndefined();
  });

  it("guards: does not produce Infinity/-Infinity when no weights are present", () => {
    const week = makeEmptyWeek({
      days: {
        mon: { calories: 2500, proteinG: 150 },
        tue: { calories: 2700, proteinG: 160 },
        wed: {},
        thu: {},
        fri: {},
        sat: {},
        sun: {},
      },
    });

    const { metrics } = setup(week);

    expect(metrics?.avgWeightKg).toBeUndefined();
    expect(metrics?.minWeightKg).toBeUndefined();
    expect(metrics?.maxWeightKg).toBeUndefined();
  });

  it("returns: avgProteinPerKg undefined when no weight is present", () => {
    const week = makeEmptyWeek({
      days: {
        mon: { proteinG: 150 },
        tue: { proteinG: 160 },
        wed: {},
        thu: { proteinG: 155 },
        fri: {},
        sat: {},
        sun: {},
      },
    });

    const { metrics } = setup(week);

    expect(metrics?.avgProteinG).toBeCloseTo((150 + 160 + 155) / 3, 5);
    expect(metrics?.avgProteinPerKg).toBeUndefined();
  });

  it("returns: avgProteinPerKg undefined when no protein is present", () => {
    const week = makeEmptyWeek({
      days: {
        mon: { weightKg: 78.5 },
        tue: { weightKg: 78.0 },
        wed: {},
        thu: { weightKg: 77.5 },
        fri: {},
        sat: {},
        sun: {},
      },
    });

    const { metrics } = setup(week);

    expect(metrics?.avgProteinPerKg).toBeUndefined();
  });

  it("handles: weeks with only a single logged day", () => {
    const week = makeEmptyWeek({
      days: {
        mon: { weightKg: 78, calories: 2600, proteinG: 150 },
        tue: {},
        wed: {},
        thu: {},
        fri: {},
        sat: {},
        sun: {},
      },
    });

    const { metrics } = setup(week);
    expect(metrics).toMatchObject({
      avgWeightKg: 78,
      minWeightKg: 78,
      maxWeightKg: 78,
      avgCalories: 2600,
      avgProteinG: 150,
    });
  });
});
