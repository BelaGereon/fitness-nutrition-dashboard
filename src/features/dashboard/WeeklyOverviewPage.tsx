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
import {
  addDaysToISODate,
  findNextUntrackedWeek,
  mondayOfWeek,
  getMondayOfWeek,
} from "./util/dateHelpers";

type WeeklyOverviewPageProps = {
  weeksStore?: WeeksStore;
  getNow?: () => Date;
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
  getNow: getTodaysDate = () => new Date(),
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

  const [weeks, setWeeks] = React.useState<WeekEntry[]>(() => {
    return store.load() ?? sampleWeeks;
  });

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

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [addWeekDate, setAddWeekDate] = React.useState("");
  const [addError, setAddError] = React.useState<string | null>(null);

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

  const addWeek = React.useCallback(
    (weekOf: string) => {
      const normalized = getMondayOfWeek(weekOf);

      if (existingWeekOfs.has(normalized)) {
        setAddError(`Week already exists for ${normalized}`);
        return;
      }

      const newWeek: WeekEntry = {
        id: createWeekId(),
        weekOf: normalized,
        days: createEmptyDays(),
      };

      setWeeks((prev) => [...prev, newWeek]);
      setOpenWeekId(newWeek.id);
      setIsAddOpen(false);
      setAddError(null);
    },
    [createWeekId, existingWeekOfs],
  );

  const onClickAddWeek = () => {
    const currentWeekOf = mondayOfWeek(getTodaysDate());

    // Fast path: if current week isn't present yet, create it immediately.
    if (!existingWeekOfs.has(currentWeekOf)) {
      addWeek(currentWeekOf);
      return;
    }

    // Otherwise, open a picker to add a different week.
    const suggested = findNextUntrackedWeek({
      startWeekOf: addDaysToISODate(currentWeekOf, 7),
      existingWeekOfs,
    });

    setAddWeekDate(suggested);
    setAddError(null);
    setIsAddOpen(true);
  };

  const cancelAdd = () => {
    setIsAddOpen(false);
    setAddError(null);
  };

  return (
    <main>
      <h1>Weekly Fitness Overview</h1>

      <section aria-label="Add week section">
        <button type="button" onClick={onClickAddWeek}>
          Add week
        </button>

        {isAddOpen && (
          <div data-testid="add-week-form">
            <h2>Add a new week</h2>

            {addError && <div role="alert">{addError}</div>}

            <label htmlFor="add-week-date">
              Week to add
              <input
                id="add-week-date"
                type="date"
                value={addWeekDate}
                onChange={(e) => setAddWeekDate(e.target.value)}
              />
            </label>

            <div>
              <button
                type="button"
                onClick={() => addWeek(addWeekDate)}
                disabled={addWeekDate.trim() === ""}
              >
                Create
              </button>
              <button type="button" onClick={cancelAdd}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

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
