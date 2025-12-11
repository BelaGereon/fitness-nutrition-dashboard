// src/features/dashboard/WeeklyOverviewPage.tsx
import { sampleWeeks } from "../../data/sample-data/sampleWeek";
import { computeTrendMetrics } from "../../domain/weekTrend";
import { WeekCard } from "./WeekCard";

export function WeeklyOverviewPage() {
  const trend = computeTrendMetrics(sampleWeeks);
  const weeksById = new Map(sampleWeeks.map((w) => [w.id, w]));

  return (
    <main>
      <h1>Weekly Fitness Overview</h1>

      <ul>
        {trend.map((week) => {
          const base = weeksById.get(week.id);
          if (!base) {
            return null;
          }

          return <WeekCard key={week.id} trend={week} base={base} />;
        })}
      </ul>
    </main>
  );
}
