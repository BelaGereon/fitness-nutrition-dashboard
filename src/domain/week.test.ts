import { describe, expect, it } from "vitest";
import { computeWeekMetrics, type WeekEntry } from "./week";

const makeEmptyWeek = (overrides: Partial<WeekEntry> = {}): WeekEntry => ({
  id: "week-1",
  weekOf: "2025-11-24",
  avgStepsPerDay: undefined,
  days: {
    mon: {},
    tue: {},
    wed: {},
    thu: {},
    fri: {},
    sat: {},
    sun: {},
  },
  trainingSessionsDescription: undefined,
  totalSets: undefined,
  totalVolumeKg: undefined,
  notes: undefined,
  otherNotes: undefined,
  ...overrides,
});

describe("computeWeekMetrics", () => {
  it("computes the averare weight correctly", () => {
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

    const metrics = computeWeekMetrics(week);

    expect(metrics.avgWeightKg).toBeCloseTo(
      (78.7 + 78.0 + 77.8 + 78.7 + 78.5 + 79.0) / 6
    );
  });

  it.todo("computes min and max weight correctly");
  it.todo("computes average calories correctly");
  it.todo("computes average protein correctly");
  it.todo("computes average protein per kg correctly");
  it.todo("returns undefined for all metrics if no data is present");
});
