// src/data/weeksStoreLocalStorage.ts
import {
  DAY_IDS,
  type DayId,
  type DayEntry,
  type WeekEntry,
} from "../domain/week";
import type { WeeksStore } from "./weeksStore";

export const WEEKS_STORAGE_KEY = "fitness-dashboard.weeks.v1";

type PersistedWeeksV1 = {
  version: 1;
  weeks: unknown;
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const isNumberOrUndefined = (v: unknown): v is number | undefined =>
  v === undefined || typeof v === "number";

const isDayEntry = (v: unknown): v is DayEntry => {
  if (!isObject(v)) return false;

  return (
    isNumberOrUndefined(v.weightKg) &&
    isNumberOrUndefined(v.calories) &&
    isNumberOrUndefined(v.proteinG)
  );
};

const isDaysRecord = (v: unknown): v is Record<DayId, DayEntry> => {
  if (!isObject(v)) return false;
  return DAY_IDS.every((dayId) =>
    isDayEntry((v as Record<string, unknown>)[dayId])
  );
};

const isWeekEntry = (v: unknown): v is WeekEntry => {
  if (!isObject(v)) return false;

  return (
    typeof v.id === "string" &&
    typeof v.weekOf === "string" &&
    isDaysRecord(v.days) &&
    isNumberOrUndefined(v.avgStepsPerDay) &&
    (v.trainingSessionsDescription === undefined ||
      typeof v.trainingSessionsDescription === "string") &&
    (v.totalSets === undefined || typeof v.totalSets === "number") &&
    (v.totalVolumeKg === undefined || typeof v.totalVolumeKg === "number") &&
    (v.notes === undefined || typeof v.notes === "string") &&
    (v.otherNotes === undefined || typeof v.otherNotes === "string")
  );
};

const extractWeeksArray = (parsed: unknown): unknown[] | null => {
  // Support both legacy array format and versioned payload
  if (Array.isArray(parsed)) return parsed;

  if (isObject(parsed) && (parsed as PersistedWeeksV1).version === 1) {
    const weeks = (parsed as PersistedWeeksV1).weeks;
    return Array.isArray(weeks) ? weeks : null;
  }

  return null;
};

export function createLocalStorageWeeksStore(storage: Storage): WeeksStore {
  return {
    load(): WeekEntry[] | null {
      try {
        const raw = storage.getItem(WEEKS_STORAGE_KEY);
        if (!raw) return null;

        const parsed: unknown = JSON.parse(raw);
        const arr = extractWeeksArray(parsed);
        if (!arr) return null;

        // Strict: if any entry is invalid, ignore everything
        if (!arr.every(isWeekEntry)) return null;

        return arr;
      } catch {
        return null;
      }
    },

    save(weeks: WeekEntry[]): void {
      try {
        const payload: PersistedWeeksV1 = { version: 1, weeks };
        storage.setItem(WEEKS_STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // Ignore quota/privacy errors for MVP
      }
    },
  };
}
