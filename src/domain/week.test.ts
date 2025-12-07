import { beforeEach, describe, expect, it } from "vitest";
import { computeWeekMetrics, type WeekEntry, type WeekMetrics } from "./week";

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

const week: WeekEntry = makeEmptyWeek({
  days: {
    mon: { weightKg: 78.7, calories: 2800, proteinG: 150 },
    tue: { weightKg: 78.0, calories: 2700, proteinG: 160 },
    wed: {
      /* no data */
    },
    thu: { weightKg: 77.8, calories: 2600, proteinG: 155 },
    fri: { weightKg: 78.7, calories: 2900, proteinG: 170 },
    sat: { weightKg: 78.5, calories: 3000, proteinG: 165 },
    sun: { weightKg: 79.0, calories: 3100, proteinG: 180 },
  },
});

describe("computeWeekMetrics", () => {
  let metrics: WeekMetrics | undefined;

  beforeEach(() => {
    metrics = computeWeekMetrics(week);
  });

  it("computes the average weight correctly", () => {
    expect(metrics?.avgWeightKg).toBeCloseTo(
      (78.7 + 78.0 + 77.8 + 78.7 + 78.5 + 79.0) / 6
    );
  });

  it("computes min and max weight correctly", () => {
    expect(metrics?.minWeightKg).toBe(77.8);
    expect(metrics?.maxWeightKg).toBe(79.0);
  });

  it("computes average calories correctly", () => {
    expect(metrics?.avgCalories).toBeCloseTo(
      (2800 + 2700 + 2600 + 2900 + 3000 + 3100) / 6
    );
  });

  it("computes average protein correctly", () => {
    expect(metrics?.avgProteinG).toBeCloseTo(
      (150 + 160 + 155 + 170 + 165 + 180) / 6
    );
  });

  it("computes average protein per kg correctly", () => {
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

  it("returns undefined for all metrics if no data is present", () => {
    const emptyWeek = makeEmptyWeek();
    const emptyMetrics = computeWeekMetrics(emptyWeek);

    expect(emptyMetrics).toBeUndefined();
  });

  it("computes calorie averages even when no weight/protein is present", () => {
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

    const metrics = computeWeekMetrics(week);

    expect(metrics).toBeDefined();
    expect(metrics?.avgCalories).toBeCloseTo((2500 + 2700 + 2600) / 3, 5);
    expect(metrics?.avgWeightKg).toBeUndefined();
    expect(metrics?.avgProteinG).toBeUndefined();
  });

  it("does not produce Infinity/-Infinity when no weights are present", () => {
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

    const metrics = computeWeekMetrics(week);

    expect(metrics?.avgWeightKg).toBeUndefined();
    expect(metrics?.minWeightKg).toBeUndefined();
    expect(metrics?.maxWeightKg).toBeUndefined();
  });

  it("returns undefined for avgProteinPerKG when no weight is present", () => {
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
    const metrics = computeWeekMetrics(week);

    expect(metrics?.avgProteinG).toBeCloseTo((150 + 160 + 155) / 3, 5);
    expect(metrics?.avgProteinPerKg).toBeUndefined();
  });

  it("returns undefined for avgProteinPerKG when no protein is present", () => {
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
    const metrics = computeWeekMetrics(week);

    expect(metrics?.avgProteinPerKg).toBeUndefined();
  });
});
