import userEvent from "@testing-library/user-event";
import { render, screen, waitFor, within } from "@testing-library/react";
import { WeeklyOverviewPage } from "./WeeklyOverviewPage";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { sampleWeeks } from "../../data/sample-data/sampleWeek";
import { computeTrendMetrics } from "../../domain/weekTrend";
import {
  extractFirstNumber,
  cancelEdit,
  enterEditMode,
  gridCell,
  numberOf,
  openWeek,
  queryWeekDetails,
  saveEdit,
  setNumberField,
  textOf,
  weekToggleButton,
  weekDetails as weekDetailsElement,
} from "./util/testUtils";
import type { WeeksStore } from "../../data/weeksStore";
import type { WeekEntry } from "../../domain/week";
import type { Mock } from "vitest";
import type { WeeksExportService } from "../../data/weeksExport";

const sampleWeeksTrend = computeTrendMetrics(sampleWeeks);
const [firstTrendWeek, secondTrendWeek] = sampleWeeksTrend;

const setup = (
  weeksStore?: WeeksStore,
  opts?: {
    now?: Date;
    createWeekId?: () => string;
    exportService?: WeeksExportService;
  },
) => {
  const getNow = opts?.now ? () => opts.now as Date : undefined;

  render(
    <WeeklyOverviewPage
      weeksStore={weeksStore}
      getTodaysDate={getNow}
      createWeekId={opts?.createWeekId}
      weeksExportService={opts?.exportService}
    />,
  );

  const user = userEvent.setup();
  return { user };
};

const createStoreStub = (loaded: WeekEntry[] | null): WeeksStore => ({
  load: vi.fn(() => loaded),
  save: vi.fn(),
});

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("WeeklyOverviewPage", () => {
  it("renders: one card per trend week", () => {
    setup();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(
      sampleWeeksTrend.length,
    );
  });

  it("open: shows summary fields when a week is opened", async () => {
    const { user } = setup();
    const details = await openWeek(user, firstTrendWeek);

    const summaryLabels = [
      /avg weight:/i,
      /min \/ max:/i,
      /avg calories:/i,
      /avg protein:/i,
      /avg protein per kg:/i,
      /avg steps:/i,
      /Δ weight vs prev:/i,
    ];

    for (const label of summaryLabels) {
      expect(details.getByText(label)).toBeInTheDocument();
    }
  });

  it("open: renders grid cells when a week is opened", async () => {
    const { user } = setup();
    const details = await openWeek(user, firstTrendWeek);

    expect(
      gridCell(details, { dayId: "mon", metric: "weight" }),
    ).toBeInTheDocument();
    expect(
      gridCell(details, { dayId: "sun", metric: "protein" }),
    ).toBeInTheDocument();
  });

  it("open: renders no delta for a week with no previous avg weight", async () => {
    const { user } = setup();
    const details = await openWeek(user, firstTrendWeek);

    expect(details.getByText(/Δ weight vs prev:/i)).toHaveTextContent(/n\/a/i);
  });

  it("open: renders a delta for a week with previous avg weight", async () => {
    const { user } = setup();
    const details = await openWeek(user, secondTrendWeek);

    const deltaText = details.getByText(/Δ weight vs prev:/i);
    expect(deltaText).not.toHaveTextContent(/n\/a/i);
    expect(deltaText).toHaveTextContent(/kg/);
  });

  it("accordion: only allows one week card to be open at a time", async () => {
    const { user } = setup();

    await user.click(weekToggleButton(firstTrendWeek));
    expect(weekDetailsElement(firstTrendWeek)).toBeInTheDocument();
    expect(queryWeekDetails(secondTrendWeek)).not.toBeInTheDocument();

    await user.click(weekToggleButton(secondTrendWeek));
    expect(queryWeekDetails(firstTrendWeek)).not.toBeInTheDocument();
    expect(weekDetailsElement(secondTrendWeek)).toBeInTheDocument();

    await user.click(weekToggleButton(secondTrendWeek));
    expect(queryWeekDetails(firstTrendWeek)).not.toBeInTheDocument();
    expect(queryWeekDetails(secondTrendWeek)).not.toBeInTheDocument();
  });

  it("wires: correct week data into the opened card", async () => {
    const { user } = setup();
    const details = await openWeek(user, firstTrendWeek);

    expect(numberOf(details, /avg weight:/i)).toBeCloseTo(
      firstTrendWeek.avgWeightKg!,
      1,
    );
  });

  it("edit: allows editing avg steps and reflects change in UI", async () => {
    const { user } = setup();
    const details = await openWeek(user, firstTrendWeek);

    const avgStepsLine = () => details.getByText(/avg steps:/i);

    await enterEditMode(user, details);
    await setNumberField({
      user,
      scope: details,
      inputName: /avg steps/i,
      value: "10000",
    });

    await saveEdit(user, details);
    expect(avgStepsLine()).toHaveTextContent("10000");
  });

  it("cancel: does not edit steps when input is cancelled", async () => {
    const { user } = setup();
    const details = await openWeek(user, firstTrendWeek);

    const avgStepsLine = () => details.getByText(/avg steps:/i);
    expect(avgStepsLine()).not.toHaveTextContent("20000");

    await enterEditMode(user, details);
    await setNumberField({
      user,
      scope: details,
      inputName: /avg steps/i,
      value: "20000",
    });

    await cancelEdit(user, details);
    expect(avgStepsLine()).not.toHaveTextContent("20000");
  });

  it("recompute: editing Monday weight recomputes avg weight after saving", async () => {
    const { user } = setup();
    const details = await openWeek(user, firstTrendWeek);

    await enterEditMode(user, details);
    await setNumberField({
      user,
      scope: details,
      inputName: /mon weight/i,
      value: "80",
    });

    await saveEdit(user, details);

    const updatedWeeks = sampleWeeks.map((w) =>
      w.id !== firstTrendWeek.id
        ? w
        : {
            ...w,
            days: {
              ...w.days,
              mon: { ...w.days.mon, weightKg: 80 },
            },
          },
    );

    const expectedAvgWeightAfter = computeTrendMetrics(updatedWeeks).find(
      (w) => w.id === firstTrendWeek.id,
    )!.avgWeightKg!;

    expect(
      extractFirstNumber(
        gridCell(details, { dayId: "mon", metric: "weight" }).textContent ?? "",
      ),
    ).toBeCloseTo(80, 1);

    expect(numberOf(details, /avg weight:/i)).toBeCloseTo(
      expectedAvgWeightAfter,
      1,
    );
  });

  it("cancel: does not change Monday + avg weight when edit is cancelled", async () => {
    const { user } = setup();
    const details = await openWeek(user, firstTrendWeek);

    const avgWeightBefore = numberOf(details, /avg weight:/i);
    const monWeightBefore = extractFirstNumber(
      gridCell(details, { dayId: "mon", metric: "weight" }).textContent ?? "",
    );

    await enterEditMode(user, details);
    await setNumberField({
      user,
      scope: details,
      inputName: /mon weight/i,
      value: "80",
    });

    await cancelEdit(user, details);

    expect(numberOf(details, /avg weight:/i)).toBeCloseTo(avgWeightBefore, 1);
    expect(
      extractFirstNumber(
        gridCell(details, { dayId: "mon", metric: "weight" }).textContent ?? "",
      ),
    ).toBeCloseTo(monWeightBefore, 1);
  });

  it("normalizes: empty Monday weight becomes undefined (renders 'n/a')", async () => {
    const { user } = setup();
    const details = await openWeek(user, firstTrendWeek);

    await enterEditMode(user, details);
    await setNumberField({
      user,
      scope: details,
      inputName: /mon weight/i,
      value: "",
    });

    await saveEdit(user, details);

    expect(
      gridCell(details, { dayId: "mon", metric: "weight" }),
    ).toHaveTextContent(/n\/a/i);

    const updatedWeeks = sampleWeeks.map((w) =>
      w.id !== firstTrendWeek.id
        ? w
        : {
            ...w,
            days: {
              ...w.days,
              mon: { ...w.days.mon, weightKg: undefined },
            },
          },
    );

    const expectedAvgWeightAfter = computeTrendMetrics(updatedWeeks).find(
      (w) => w.id === firstTrendWeek.id,
    )?.avgWeightKg;

    const avgWeightAfterText = textOf(details, /avg weight:/i);

    if (expectedAvgWeightAfter === undefined) {
      expect(avgWeightAfterText).toMatch(/n\/a/i);
    } else {
      expect(extractFirstNumber(avgWeightAfterText)).toBeCloseTo(
        expectedAvgWeightAfter,
        1,
      );
    }
  });

  it("persistence: initializes from WeeksStore.load when it returns weeks", async () => {
    const storedWeeks = sampleWeeks.map((w) =>
      w.id !== firstTrendWeek.id ? w : { ...w, avgStepsPerDay: 12345 },
    );

    const store = createStoreStub(storedWeeks);
    const { user } = setup(store);

    const details = await openWeek(user, firstTrendWeek);

    expect(details.getByText(/avg steps:/i)).toHaveTextContent("12345");
    expect(store.load).toHaveBeenCalledTimes(1);
  });

  it("persistence: falls back to sampleWeeks when WeeksStore.load returns null", () => {
    const store = createStoreStub(null);

    setup(store);

    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(
      sampleWeeksTrend.length,
    );
  });

  it("persistence: calls WeeksStore.save with updated weeks after saving an edit", async () => {
    const store = createStoreStub(sampleWeeks);

    const { user } = setup(store);
    const details = await openWeek(user, firstTrendWeek);

    await enterEditMode(user, details);
    await setNumberField({
      user,
      scope: details,
      inputName: /avg steps/i,
      value: "10000",
    });
    await saveEdit(user, details);

    expect(store.save).toHaveBeenCalledTimes(1);

    const savedWeeks = (store.save as Mock).mock.calls[0][0] as WeekEntry[];
    const savedWeek = savedWeeks.find((week) => week.id === firstTrendWeek.id)!;

    expect(savedWeek.avgStepsPerDay).toBe(10000);
  });

  it("add week: creates the current week immediately if it does not exist yet", async () => {
    const store = createStoreStub(sampleWeeks);

    const { user } = setup(store, {
      now: new Date("2026-01-07T10:00:00"), // Wed -> Monday is 2026-01-05
      createWeekId: () => "new-week-id",
    });

    await user.click(screen.getByRole("button", { name: /add week/i }));

    expect(
      screen.getByRole("button", { name: "Week of 2026-01-05" }),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("week-card-new-week-id-details"),
    ).toBeInTheDocument();

    await waitFor(() => expect(store.save).toHaveBeenCalledTimes(1));
  });

  it("add week: opens a picker when the current week already exists", async () => {
    const store = createStoreStub(sampleWeeks);

    const { user } = setup(store, {
      now: new Date("2025-12-03T10:00:00"), // within the weekOf=2025-12-01
    });

    await user.click(screen.getByRole("button", { name: /add week/i }));

    const form = screen.getByTestId("add-week-form");
    expect(within(form).getByLabelText(/week to add/i)).toBeInTheDocument();
    expect(
      within(form).getByRole("button", { name: /create/i }),
    ).toBeInTheDocument();
    expect(
      within(form).getByRole("button", { name: /cancel/i }),
    ).toBeInTheDocument();
  });

  it("add week: rejects selecting a date that belongs to an existing week", async () => {
    const store = createStoreStub(sampleWeeks);

    const { user } = setup(store, {
      now: new Date("2025-12-03T10:00:00"),
    });

    await user.click(screen.getByRole("button", { name: /add week/i }));
    const form = screen.getByTestId("add-week-form");
    const scope = within(form);

    // Pick any day inside the existing current week; it will normalize to Monday 2025-12-01.
    const input = scope.getByLabelText(/week to add/i);
    await user.clear(input);
    await user.type(input, "2025-12-04");

    await user.click(scope.getByRole("button", { name: /create/i }));

    expect(scope.getByRole("alert")).toHaveTextContent(/already exists/i);
  });

  it("add week: allows selecting a different week and adds it (normalized to Monday)", async () => {
    const store = createStoreStub(sampleWeeks);

    const { user } = setup(store, {
      now: new Date("2025-12-03T10:00:00"),
      createWeekId: () => "new-week-id",
    });

    await user.click(screen.getByRole("button", { name: /add week/i }));
    const form = screen.getByTestId("add-week-form");
    const scope = within(form);

    const input = scope.getByLabelText(/week to add/i);
    await user.clear(input);
    await user.type(input, "2026-01-07"); // Wed -> Monday is 2026-01-05

    await user.click(scope.getByRole("button", { name: /create/i }));

    expect(screen.queryByTestId("add-week-form")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Week of 2026-01-05" }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("week-card-new-week-id-details"),
    ).toBeInTheDocument();
  });

  it("add week: cancel closes the picker without adding anything", async () => {
    const store = createStoreStub(sampleWeeks);

    const { user } = setup(store, {
      now: new Date("2025-12-03T10:00:00"),
    });

    await user.click(screen.getByRole("button", { name: /add week/i }));
    const form = screen.getByTestId("add-week-form");
    const scope = within(form);

    await user.click(scope.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByTestId("add-week-form")).not.toBeInTheDocument();
    // no persistence call because no change was made
    expect(store.save).toHaveBeenCalledTimes(0);
  });

  it("export data: calls export service with current weeks and now", async () => {
    const store = createStoreStub(sampleWeeks);
    const exportService = { exportWeeks: vi.fn() };

    const now = new Date("2026-01-07T10:00:00.000Z");
    const { user } = setup(store, { now, exportService });

    await user.click(screen.getByRole("button", { name: /export data/i }));

    expect(exportService.exportWeeks).toHaveBeenCalledTimes(1);
    const [weeksArg, nowArg] = exportService.exportWeeks.mock.calls[0];

    // weeks passed are whatever the page currently holds (loaded from store)
    expect(Array.isArray(weeksArg)).toBe(true);
    expect(nowArg).toEqual(now);
  });
});
