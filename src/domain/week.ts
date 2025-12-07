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
  const weights: number[] = gatherDailyWeightsFromWeek(week);
  const calories: number[] = [];

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const avgWeightKg = totalWeight / weights.length;
  const minWeightKg = Math.min(...weights);
  const maxWeightKg = Math.max(...weights);

  for (const dayId of Object.keys(week.days) as DayId[]) {
    const day = week.days[dayId];
    if (day.calories !== undefined) {
      calories.push(day.calories);
    }
  }

  const totalCalories = calories.reduce((sum, c) => sum + c, 0);
  const avgCalories = totalCalories / calories.length;

  return {
    avgWeightKg,
    minWeightKg,
    maxWeightKg,
    avgCalories,
  };
}

const gatherDailyWeightsFromWeek = (week: WeekEntry): number[] => {
  const weights: number[] = [];
  for (const dayId of Object.keys(week.days) as DayId[]) {
    const day = week.days[dayId];
    if (day.weightKg !== undefined) {
      weights.push(day.weightKg);
    }
  }
  return weights;
};
