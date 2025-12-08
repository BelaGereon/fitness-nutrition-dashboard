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
  const trendMetrics: WeekTrendMetrics[] = [];

  for (let i = 0; i < sortedWeeks.length; i++) {
    const hasPrevWeek = i > 0;
    const week = sortedWeeks[i];
    const weekMetrics = computeWeekMetrics(week);

    const trendMetric: WeekTrendMetrics = {
      weekOf: week.weekOf,
      ...weekMetrics,
    };

    if (hasPrevWeek) {
      const prevWeekMetrics = trendMetrics[i - 1];
      const weightDiffKg = calcWeightChangeVsPrevKg(
        weekMetrics,
        prevWeekMetrics
      );
      const weightDiffPerc = calcWeightChangeVsPrevPercent(
        weekMetrics,
        prevWeekMetrics
      );

      trendMetric.weightChangeVsPrevKg =
        weightDiffKg !== undefined
          ? parseFloat(weightDiffKg.toFixed(2))
          : undefined;
      trendMetric.weightChangeVsPrevPercent =
        weightDiffPerc !== undefined
          ? parseFloat(weightDiffPerc.toFixed(2))
          : undefined;
    }
    trendMetrics.push(trendMetric);
  }
  return trendMetrics;
}

const calcWeightChangeVsPrevKg = (
  weekMetrics: WeekMetrics | undefined,
  prevWeekMetrics: WeekMetrics | undefined
): number | undefined => {
  if (
    weekMetrics?.avgWeightKg !== undefined &&
    prevWeekMetrics?.avgWeightKg !== undefined
  ) {
    return weekMetrics.avgWeightKg - prevWeekMetrics.avgWeightKg;
  }
  return undefined;
};

const calcWeightChangeVsPrevPercent = (
  weekMetrics: WeekMetrics | undefined,
  prevWeekMetrics: WeekMetrics | undefined
): number | undefined => {
  if (
    weekMetrics?.avgWeightKg !== undefined &&
    prevWeekMetrics?.avgWeightKg !== undefined &&
    prevWeekMetrics.avgWeightKg !== 0
  ) {
    const weightDiffKg = weekMetrics.avgWeightKg - prevWeekMetrics.avgWeightKg;
    return (weightDiffKg / prevWeekMetrics.avgWeightKg) * 100;
  }
  return undefined;
};
