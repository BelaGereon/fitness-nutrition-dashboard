import React from "react";
import { sampleWeeks } from "../../data/sample-data/sampleWeek";
import { computeTrendMetrics } from "../../domain/weekTrend";
import { WeekCard } from "./WeekCard";

export function WeeklyOverviewPage() {
  const [weeks, setWeeks] = React.useState(sampleWeeks);
  const trend = computeTrendMetrics(weeks);
  const weeksById = new Map(weeks.map((week) => [week.id, week]));

  const [openWeekId, setOpenWeekId] = React.useState<string | null>(null);

  const toggleWeek = (id: string) => {
    setOpenWeekId((prev) => (prev === id ? null : id));
  };

  const updateWeek = (id: string, patch: Partial<WeekEntry>) => {
    setWeeks((weeks) =>
      weeks.map((week) => (week.id === id ? { ...week, ...patch } : week))
    );
  };

  return (
    <main>
      <h1>Weekly Fitness Overview</h1>

      <ul>
        {trend.map((week) => {
          const base = weeksById.get(week.id);
          if (!base) return null;

          return (
            <WeekCard
              key={week.id}
              trend={week}
              base={base}
              isOpen={openWeekId === week.id}
              onToggle={() => toggleWeek(week.id)}
            />
          );
        })}
      </ul>
    </main>
  );
}
