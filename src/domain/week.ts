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
