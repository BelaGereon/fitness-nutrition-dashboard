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

const total = (numbers: number[]): number | undefined => {
  if (numbers.length === 0) return undefined;
  return numbers.reduce((sum, n) => sum + n, 0);
};

const avg = (numbers: number[]): number | undefined => {
  if (numbers.length === 0) return undefined;

  const sum = total(numbers);

  if (sum === undefined) return undefined;
  return sum / numbers.length;
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
