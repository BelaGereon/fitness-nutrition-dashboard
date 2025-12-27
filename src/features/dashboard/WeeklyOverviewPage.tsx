import React from "react";
import { sampleWeeks } from "../../data/sample-data/sampleWeek";
import { computeTrendMetrics } from "../../domain/weekTrend";
import { WeekCard } from "./WeekCard";
import { type DayEntry, type DayId, type WeekEntry } from "../../domain/week";

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

  const updateDay = (
    weekId: string,
    dayId: DayId,
    patch: Partial<DayEntry>
  ) => {
    setWeeks((weeks) =>
      weeks.map((week) =>
        week.id !== weekId
          ? week
          : {
              ...week,
              days: {
                ...week.days,
                [dayId]: { ...week.days[dayId], ...patch },
              },
            }
      )
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
              onUpdateWeek={(patch) => updateWeek(week.id, patch)}
              onUpdateDay={(dayId: DayId, patch: Partial<DayEntry>) =>
                updateDay(week.id, dayId, patch)
              }
            />
          );
        })}
      </ul>
    </main>
  );
}
