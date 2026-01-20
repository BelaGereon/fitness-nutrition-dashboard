import React from "react";
import type { WeeksStore } from "../../../data/weeksStore";
import type { WeekEntry } from "../../../domain/week";

export function usePersistedWeeks(args: {
  store: WeeksStore;
  fallback: WeekEntry[];
}) {
  const { store, fallback } = args;

  const [weeks, setWeeks] = React.useState<WeekEntry[]>(() => {
    return store.load() ?? fallback;
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
