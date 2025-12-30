import React from "react";
import { sampleWeeks } from "../../data/sample-data/sampleWeek";
import { computeTrendMetrics } from "../../domain/weekTrend";
import { WeekCard } from "./WeekCard";
import { createLocalStorageWeeksStore } from "../../data/weeksStoreLocalStorage";

import type { WeekEntry } from "../../domain/week";
import type { WeeksStore } from "../../data/weeksStore";

type WeeklyOverviewPageProps = {
  weeksStore?: WeeksStore;
};

export function WeeklyOverviewPage({ weeksStore }: WeeklyOverviewPageProps) {
  const store = React.useMemo(
    () => weeksStore ?? createLocalStorageWeeksStore(window.localStorage),
    [weeksStore]
  );

  const [weeks, setWeeks] = React.useState<WeekEntry[]>(() => {
    return store.load() ?? sampleWeeks;
  });

  // Persist only after the user actually changes weeks (don’t auto-write on mount).
  const didMountRef = React.useRef(false);
  React.useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    store.save(weeks);
  }, [weeks, store]);

  const trend = computeTrendMetrics(weeks);
  const weeksById = new Map(weeks.map((week) => [week.id, week]));

  const [openWeekId, setOpenWeekId] = React.useState<string | null>(null);

  const toggleWeek = (id: string) => {
    setOpenWeekId((prev) => (prev === id ? null : id));
  };

  const saveWeek = (updatedWeek: WeekEntry) => {
    setWeeks((weeks) =>
      weeks.map((week) => (week.id === updatedWeek.id ? updatedWeek : week))
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
              onSaveWeek={saveWeek}
            />
          );
        })}
      </ul>
    </main>
  );
}
