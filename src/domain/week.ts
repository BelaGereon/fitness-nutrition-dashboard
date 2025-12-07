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
  const weights: number[] = [];

  for (const dayId of Object.keys(week.days) as DayId[]) {
    const day = week.days[dayId];
    if (day.weightKg !== undefined) {
      weights.push(day.weightKg);
    }
  }

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const avgWeightKg = totalWeight / weights.length;

  return {
    avgWeightKg,
  };
}
