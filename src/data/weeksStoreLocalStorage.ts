import {
  DAY_IDS,
  type DayId,
  type DayEntry,
  type WeekEntry,
} from "../domain/week";
import type { WeeksStore } from "./weeksStore";

export const WEEKS_STORAGE_KEY = "fitness-dashboard.weeks.v1";

type PersistedWeeks = {
  version: number;
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
    isDayEntry((v as Record<string, unknown>)[dayId]),
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
  if (Array.isArray(parsed)) return parsed;

  if (isObject(parsed) && (parsed as PersistedWeeks).version === 1) {
    const weeks = (parsed as PersistedWeeks).weeks;
    return Array.isArray(weeks) ? weeks : null;
  }

  return null;
};

export function createLocalStorageWeeksStore(storage: Storage): WeeksStore {
  return {
    load(): WeekEntry[] | null {
      try {
        const storedWeeks = storage.getItem(WEEKS_STORAGE_KEY);
        if (!storedWeeks) return null;

        const parsed: unknown = JSON.parse(storedWeeks);
        const extractedWeeks = extractWeeksArray(parsed);
        if (!extractedWeeks) return null;

        const allEntriesAreValid = extractedWeeks.every(isWeekEntry);
        if (!allEntriesAreValid) return null;

        return extractedWeeks;
      } catch {
        return null;
      }
    },

    save(weeks: WeekEntry[]): void {
      try {
        const payload: PersistedWeeks = { version: 1, weeks };
        storage.setItem(WEEKS_STORAGE_KEY, JSON.stringify(payload));
      } catch {
        throw new Error("Could not store weeks");
      }
    },
  };
}
