// src/sample-data/sampleWeeks.ts
import type { WeekEntry } from "../../domain/week";

export const sampleWeeks: WeekEntry[] = [
  {
    id: "2025-11-24",
    weekOf: "2025-11-24",
    avgStepsPerDay: 10925,
    days: {
      mon: { weightKg: 78.7, calories: 2800, proteinG: 150 },
      tue: { weightKg: 78.0, calories: 2700, proteinG: 160 },
      wed: {
        weightKg: undefined,
        calories: 2980,
        proteinG: 181,
      },
      thu: { weightKg: 77.8, calories: 2600, proteinG: 155 },
      fri: { weightKg: 78.7, calories: 2900, proteinG: 170 },
      sat: { weightKg: 78.5, calories: 3000, proteinG: 165 },
      sun: { weightKg: 79.0, calories: 2990, proteinG: 148 },
    },
    trainingSessionsDescription: "3x Full Body, 1x Arm at home",
    totalSets: 61,
    totalVolumeKg: 29942.5,
  },
  {
    id: "2025-12-01",
    weekOf: "2025-12-01",
    avgStepsPerDay: 8898,
    days: {
      mon: { weightKg: 79.5, calories: 3077, proteinG: 118 },
      tue: { weightKg: 78.4, calories: 2724, proteinG: 196 },
      wed: { weightKg: 79.2, calories: 2574, proteinG: 121 },
      thu: { weightKg: 78.2, calories: 2323, proteinG: 148 },
      fri: { weightKg: 78.4, calories: 2692, proteinG: 159 },
      sat: { weightKg: 78.4, calories: 2518, proteinG: 171 },
      sun: { weightKg: 79.0, calories: 2965, proteinG: 172 },
    },
    trainingSessionsDescription: "2x Full Body",
    totalSets: 38,
    totalVolumeKg: 23533,
    notes:
      "Second Week of the meso, tried to got to 2RIR on all exercises. Got a flu shot on Friday and took the rest of the week off from training.",
  },
];
