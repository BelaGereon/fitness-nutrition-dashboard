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

export function computeWeekMetrics(week: WeekEntry): WeekMetrics {
  const weights: number[] = gatherDataFromWeekDays(week, "weightKg");
  const calories: number[] = gatherDataFromWeekDays(week, "calories");
  const protein: number[] = gatherDataFromWeekDays(week, "proteinG");

  const isWeekDataEmpty =
    weights.length === 0 && calories.length === 0 && protein.length === 0;

  if (isWeekDataEmpty) {
    return {};
  }

  const avgWeightKg = avg(weights);
  const minWeightKg = Math.min(...weights);
  const maxWeightKg = Math.max(...weights);

  const avgCalories = avg(calories);

  const avgProteinG = avg(protein);
  const avgProteinPerKg =
    avgProteinG !== undefined && avgWeightKg !== undefined
      ? avgProteinG / avgWeightKg
      : undefined;

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

const total = (numbers: number[]): number => {
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
  for (const dayId of Object.keys(week.days) as DayId[]) {
    const day = week.days[dayId];
    if (day[key] !== undefined) {
      data.push(day[key] as number);
    }
  }
  return data;
};
