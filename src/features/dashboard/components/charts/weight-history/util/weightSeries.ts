// src/features/weeklyOverview/charts/weightSeries.ts
import { type WeekEntry, DAY_IDS } from "../../../../../../domain/week";
import {
  addDaysToISODate,
  mondayOfWeek,
  toLocalMiddayTimestampMs,
} from "../../../../util/date/dateHelpers";

export type Point = { x: number; y: number }; // x = timestamp (ms), y = weight

const baseDateFromIso = (isoDate: string) => new Date(`${isoDate}T12:00:00`);

export function buildWeightPointsFromWeeks(weeks: WeekEntry[]): Point[] {
  const points: Point[] = [];

  for (const week of weeks) {
    const mondayIso = mondayOfWeek(baseDateFromIso(week.weekOf));
    for (const dayId of DAY_IDS) {
      const day = week.days[dayId];
      const w = day?.weightKg;
      if (w === undefined) continue;

      const offset = DAY_IDS.indexOf(dayId);
      const dayIso = addDaysToISODate(mondayIso, offset);
      const x = toLocalMiddayTimestampMs(dayIso);

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
