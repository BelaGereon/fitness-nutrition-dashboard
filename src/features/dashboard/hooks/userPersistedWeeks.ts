import React from "react";
import type { WeeksStore } from "../../../data/weeksStore";
import type { WeekEntry } from "../../../domain/week";

type UserPersistedWeeksArgs = {
  store: WeeksStore;
  fallback: WeekEntry[];
};

const loadFromStoreOrFallback = (
  store: WeeksStore,
  fallback: WeekEntry[],
): WeekEntry[] => {
  return store.load() ?? fallback;
};

export function usePersistedWeeks({ store, fallback }: UserPersistedWeeksArgs) {
  const [weeks, setWeeks] = React.useState<WeekEntry[]>(() => {
    return loadFromStoreOrFallback(store, fallback);
  });

  const didMountRef = React.useRef(false);
  React.useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    store.save(weeks);
  }, [weeks, store]);

  return { weeks, setWeeks } as const;
}
