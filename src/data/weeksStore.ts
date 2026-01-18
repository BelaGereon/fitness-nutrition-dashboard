import type { WeekEntry } from "../domain/week";

export type WeeksStore = {
  load(): WeekEntry[] | null;
  save(weeks: WeekEntry[]): void;
};
