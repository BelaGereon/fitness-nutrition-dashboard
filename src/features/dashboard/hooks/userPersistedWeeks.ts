import React from "react";
import type { WeeksStore } from "../../../data/weeksStore";
import type { WeekEntry } from "../../../domain/week";

type UsePersistedWeeksArgs = {
  store: WeeksStore;
  fallback: WeekEntry[];
};

const loadFromStoreOrFallback = (store: WeeksStore, fallback: WeekEntry[]) =>
  store.load() ?? fallback;

function useWeeksLoadedOnMount(store: WeeksStore, fallback: WeekEntry[]) {
  return React.useState<WeekEntry[]>(() =>
    loadFromStoreOrFallback(store, fallback),
  );
}

function useSaveWeeksOnChange(store: WeeksStore, weeks: WeekEntry[]) {
  const hasRenderedOnceRef = React.useRef(false);

  React.useEffect(() => {
    // skip initial mount (so we don't save immediately after load)
    if (!hasRenderedOnceRef.current) {
      hasRenderedOnceRef.current = true;
      return;
    }

    store.save(weeks);
  }, [store, weeks]);
}

export function usePersistedWeeks({ store, fallback }: UsePersistedWeeksArgs) {
  const [weeks, setWeeks] = useWeeksLoadedOnMount(store, fallback);
  useSaveWeeksOnChange(store, weeks);

  return { weeks, setWeeks } as const;
}
