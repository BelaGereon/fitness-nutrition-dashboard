import { beforeEach, describe, expect, it } from "vitest";
import { sampleWeeks } from "./sample-data/sampleWeek";
import {
  createLocalStorageWeeksStore,
  WEEKS_STORAGE_KEY,
} from "./weeksStoreLocalStorage";

beforeEach(() => {
  localStorage.clear();
});

describe("createLocalStorageWeeksStore (adapter)", () => {
  it("load: returns null when empty", () => {
    const store = createLocalStorageWeeksStore(localStorage);
    expect(store.load()).toBeNull();
  });

  it("save+load: roundtrips week ids and core fields", () => {
    const store = createLocalStorageWeeksStore(localStorage);

    store.save(sampleWeeks);
    const loaded = store.load();

    expect(loaded).not.toBeNull();
    expect(loaded!.map((w) => w.id)).toEqual(sampleWeeks.map((w) => w.id));
    expect(loaded!.map((w) => w.weekOf)).toEqual(
      sampleWeeks.map((w) => w.weekOf)
    );

    // spot-check a stable day field (avoid undefined-vs-omitted JSON noise)
    expect(loaded![0].days.mon).toEqual(sampleWeeks[0].days.mon);
  });

  it("load: returns null for invalid JSON (does not throw)", () => {
    localStorage.setItem(WEEKS_STORAGE_KEY, "{not-json");

    const store = createLocalStorageWeeksStore(localStorage);
    expect(store.load()).toBeNull();
  });

  it("load: returns null for wrong shape", () => {
    localStorage.setItem(
      WEEKS_STORAGE_KEY,
      JSON.stringify({ version: 1, weeks: { nope: true } })
    );

    const store = createLocalStorageWeeksStore(localStorage);
    expect(store.load()).toBeNull();
  });
});
