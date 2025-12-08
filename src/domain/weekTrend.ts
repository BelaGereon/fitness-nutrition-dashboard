import { computeWeekMetrics, type WeekEntry, type WeekMetrics } from "./week";

export interface WeekTrendMetrics extends WeekMetrics {
  weekOf: string;
  weightChangeVsPrevKg?: number;
  weightChangeVsPrevPercent?: number;
}

export function computeTrendMetrics(weeks: WeekEntry[]): WeekTrendMetrics[] {
  const sortedWeeks = [...weeks].sort((a, b) =>
    a.weekOf.localeCompare(b.weekOf)
  );
  const result: WeekTrendMetrics[] = [];

  let prevAvgWeight: number | undefined = undefined;

  for (const week of sortedWeeks) {
    const metrics = computeWeekMetrics(week);

    const trendMetric: WeekTrendMetrics = {
      weekOf: week.weekOf,
      ...(metrics ?? {}),
    };

    if (metrics?.avgWeightKg !== undefined && prevAvgWeight !== undefined) {
      const weightDiffKg = metrics.avgWeightKg - prevAvgWeight;
      const weightDiffPerc =
        prevAvgWeight === 0 ? undefined : (weightDiffKg / prevAvgWeight) * 100;

      trendMetric.weightChangeVsPrevKg = weightDiffKg;
      trendMetric.weightChangeVsPrevPercent = weightDiffPerc;
    }

    if (metrics?.avgWeightKg !== undefined) {
      prevAvgWeight = metrics.avgWeightKg;
    }

    result.push(trendMetric);
  }
  return result;
}
