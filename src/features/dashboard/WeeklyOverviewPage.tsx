import React from "react";
import { sampleWeeks } from "../../data/sample-data/sampleWeek";
import { computeTrendMetrics } from "../../domain/weekTrend";
import { WeekCard } from "./WeekCard";
import { createLocalStorageWeeksStore } from "../../data/weeksStoreLocalStorage";
import {
  DAY_IDS,
  type DayEntry,
  type DayId,
  type WeekEntry,
} from "../../domain/week";
import type { WeeksStore } from "../../data/weeksStore";

import type { WeeksExportService } from "../../data/weeksExport";
import {
  createBrowserFileDownloader,
  createJsonWeeksExportFormatter,
  createWeeksExportService,
} from "../../data/weeksExport";
import { getMondayOfWeek } from "./util/dateHelpers";
import { AddWeekSection } from "./AddWeekSection";
import { usePersistedWeeks } from "./hooks/userPersistedWeeks";
import { WeightHistoryChart } from "./charts/WeightHistoryChart";

type WeeklyOverviewPageProps = {
  weeksStore?: WeeksStore;
  getTodaysDate?: () => Date;
  createWeekId?: () => string;
  weeksExportService?: WeeksExportService;
};

const createEmptyDays = (): Record<DayId, DayEntry> => {
  const days = {} as Record<DayId, DayEntry>;
  for (const dayId of DAY_IDS) {
    days[dayId] = {};
  }
  return days;
};

const defaultCreateWeekId = () => {
  const c: Crypto = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `w_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

export function WeeklyOverviewPage({
  weeksStore,
  getTodaysDate = () => new Date(),
  createWeekId = defaultCreateWeekId,
  weeksExportService,
}: WeeklyOverviewPageProps) {
  const store = React.useMemo(
    () => weeksStore ?? createLocalStorageWeeksStore(window.localStorage),
    [weeksStore],
  );

  const exportService = React.useMemo(() => {
    if (weeksExportService) return weeksExportService;

    return createWeeksExportService({
      formatter: createJsonWeeksExportFormatter(),
      downloader: createBrowserFileDownloader({
        document: window.document,
        url: window.URL,
      }),
    });
  }, [weeksExportService]);

  const { weeks, setWeeks } = usePersistedWeeks({
    store,
    fallback: sampleWeeks,
  });

  const trend = computeTrendMetrics(weeks);
  const weeksById = new Map(weeks.map((week) => [week.id, week]));

  const [openWeekId, setOpenWeekId] = React.useState<string | null>(null);

  const existingWeekOfs = React.useMemo(
    () => new Set(weeks.map((w) => w.weekOf)),
    [weeks],
  );

  const toggleWeek = (id: string) => {
    setOpenWeekId((prev) => (prev === id ? null : id));
  };

  const saveWeek = (updatedWeek: WeekEntry) => {
    setWeeks((weeks) =>
      weeks.map((week) => (week.id === updatedWeek.id ? updatedWeek : week)),
    );
  };

  const tryAddWeek = React.useCallback(
    (weekOf: string) => {
      const normalized = getMondayOfWeek(weekOf);

      if (existingWeekOfs.has(normalized)) {
        return {
          ok: false as const,
          error: `Week already exists for ${normalized}`,
        };
      }

      const newWeek: WeekEntry = {
        id: createWeekId(),
        weekOf: normalized,
        days: createEmptyDays(),
      };

      setWeeks((prev) => [...prev, newWeek]);
      setOpenWeekId(newWeek.id);

      return { ok: true as const };
    },
    [createWeekId, existingWeekOfs, setWeeks],
  );

  return (
    <main>
      <h1>Weekly Fitness Overview</h1>

      <WeightHistoryChart />

      <AddWeekSection
        existingWeekOfs={existingWeekOfs}
        getTodaysDate={getTodaysDate}
        onAddWeek={tryAddWeek}
      />

      <button
        type="button"
        onClick={() => exportService.exportWeeks(weeks, getTodaysDate())}
      >
        Export data
      </button>

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
