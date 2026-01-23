// src/features/weeklyOverview/charts/weightSeries.ts
import type { WeekEntry, DayId } from "../../../../../domain/week";

export type Point = { x: number; y: number }; // x = timestamp (ms), y = weight

const DAY_ORDER: DayId[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_OFFSET_FROM_MONDAY: Record<DayId, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
  sat: 5,
  sun: 6,
};

/**
 * Convert ISO YYYY-MM-DD into a stable local timestamp.
 * Using midday local time avoids DST / timezone "off-by-one day" surprises.
 */
export const toLocalMiddayTimestampMs = (isoDate: string): number => {
  const [yyyyStr, mmStr, ddStr] = isoDate.split("-");
  const yyyy = Number(yyyyStr);
  const mm = Number(mmStr);
  const dd = Number(ddStr);
  // month is 0-based in JS Date
  return new Date(yyyy, mm - 1, dd, 12, 0, 0, 0).getTime();
};

export function buildWeightPointsFromWeeks(weeks: WeekEntry[]): Point[] {
  const points: Point[] = [];

  for (const week of weeks) {
    for (const dayId of DAY_ORDER) {
      const day = week.days[dayId];
      const w = day?.weightKg;
      if (w === undefined) continue;

      // Derive the day's ISO date from week.weekOf (which is Monday ISO)
      const x =
        toLocalMiddayTimestampMs(week.weekOf) +
        DAY_OFFSET_FROM_MONDAY[dayId] * 24 * 60 * 60 * 1000;

      points.push({ x, y: w });
    }
  }

  // Sort by timestamp ascending
  points.sort((a, b) => a.x - b.x);

  // Optional: dedupe by x (if something ever produces duplicates)
  const deduped: Point[] = [];
  for (const p of points) {
    const last = deduped[deduped.length - 1];
    if (!last || last.x !== p.x) deduped.push(p);
    else deduped[deduped.length - 1] = p; // keep latest
  }

  return deduped;
}
