// src/domain/week.ts
export type DayId = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface DayEntry {
  weightKg?: number;
  calories?: number;
  proteinG?: number;
}

export interface WeekEntry {
  id: string;
  weekOf: string; // ISO date string (Monday of that week)
  avgStepsPerDay?: number;
  days: Record<DayId, DayEntry>;
  trainingSessionsDescription?: string;
  totalSets?: number;
  totalVolumeKg?: number;
  notes?: string;
  otherNotes?: string;
}

export interface WeekMetrics {
  avgWeightKg?: number;
  minWeightKg?: number;
  maxWeightKg?: number;
  avgCalories?: number;
  avgProteinG?: number;
  avgProteinPerKg?: number;
}

export interface WeekTrendMetrics extends WeekMetrics {
  weekOf: string;
  weightChangeVsPrevKg?: number;
  weightChangeVsPrevPercent?: number;
}

export const DAY_IDS: DayId[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

export function computeWeekMetrics(week: WeekEntry): WeekMetrics | undefined {
  const weights: number[] = gatherDataFromWeekDays(week, "weightKg");
  const calories: number[] = gatherDataFromWeekDays(week, "calories");
  const protein: number[] = gatherDataFromWeekDays(week, "proteinG");

  const isWeightDataEmpty = weights.length === 0;
  const isCaloriesDataEmpty = calories.length === 0;
  const isProteinDataEmpty = protein.length === 0;
  const isWeekDataEmpty =
    isWeightDataEmpty && isCaloriesDataEmpty && isProteinDataEmpty;

  if (isWeekDataEmpty) {
    return undefined;
  }

  const avgWeightKg = avg(weights);
  const avgCalories = avg(calories);
  const avgProteinG = avg(protein);

  const minWeightKg = !isWeightDataEmpty ? Math.min(...weights) : undefined;
  const maxWeightKg = !isWeightDataEmpty ? Math.max(...weights) : undefined;

  const perDayProteinPerKg: number[] = calcDailyProteinRatios(week);
  const avgProteinPerKg = avg(perDayProteinPerKg);

  const weekMetrics: WeekMetrics = {
    avgWeightKg,
    minWeightKg,
    maxWeightKg,
    avgCalories,
    avgProteinG,
    avgProteinPerKg,
  };

  return weekMetrics;
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

      trendMetric.weightChangeVsPrevKg = parseFloat(
        weightDiffKg?.toFixed(2) ?? "0"
      );
      trendMetric.weightChangeVsPrevPercent = parseFloat(
        weightDiffPerc?.toFixed(2) ?? "0"
      );
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

const total = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0);
};

const avg = (numbers: number[]): number | undefined => {
  if (numbers.length === 0) return undefined;
  return total(numbers) / numbers.length;
};

const gatherDataFromWeekDays = (
  week: WeekEntry,
  key: keyof DayEntry
): number[] => {
  const data: number[] = [];
  for (const dayId of DAY_IDS) {
    const day = week.days[dayId];
    if (day[key] !== undefined) {
      data.push(day[key] as number);
    }
  }
  return data;
};

const calcDailyProteinRatios = (week: WeekEntry): number[] => {
  const dailyProteinRatios: number[] = [];
  for (const dayId of DAY_IDS) {
    const day = week.days[dayId];
    if (day.proteinG !== undefined && day.weightKg !== undefined) {
      dailyProteinRatios.push(day.proteinG / day.weightKg);
    }
  }
  return dailyProteinRatios;
};
