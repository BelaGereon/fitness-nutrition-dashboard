import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
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

const sampleWeeksTrend = computeTrendMetrics(sampleWeeks);
const [firstTrendWeek, secondTrendWeek] = sampleWeeksTrend;

const setup = (weeksStore?: WeeksStore) => {
  render(<WeeklyOverviewPage weeksStore={weeksStore} />);
  const user = userEvent.setup();
  return { user };
};

const createStoreStub = (loaded: WeekEntry[] | null): WeeksStore => ({
  load: vi.fn(() => loaded),
  save: vi.fn(),
});

beforeEach(() => {
  localStorage.clear();
});

describe("WeeklyOverviewPage", () => {
  it("renders: one card per trend week", () => {
    setup();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(
      sampleWeeksTrend.length
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
      gridCell(details, { dayId: "mon", metric: "weight" })
    ).toBeInTheDocument();
    expect(
      gridCell(details, { dayId: "sun", metric: "protein" })
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
      1
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
          }
    );

    const expectedAvgWeightAfter = computeTrendMetrics(updatedWeeks).find(
      (w) => w.id === firstTrendWeek.id
    )!.avgWeightKg!;

    expect(
      extractFirstNumber(
        gridCell(details, { dayId: "mon", metric: "weight" }).textContent ?? ""
      )
    ).toBeCloseTo(80, 1);

    expect(numberOf(details, /avg weight:/i)).toBeCloseTo(
      expectedAvgWeightAfter,
      1
    );
  });

  it("cancel: does not change Monday + avg weight when edit is cancelled", async () => {
    const { user } = setup();
    const details = await openWeek(user, firstTrendWeek);

    const avgWeightBefore = numberOf(details, /avg weight:/i);
    const monWeightBefore = extractFirstNumber(
      gridCell(details, { dayId: "mon", metric: "weight" }).textContent ?? ""
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
        gridCell(details, { dayId: "mon", metric: "weight" }).textContent ?? ""
      )
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
      gridCell(details, { dayId: "mon", metric: "weight" })
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
          }
    );

    const expectedAvgWeightAfter = computeTrendMetrics(updatedWeeks).find(
      (w) => w.id === firstTrendWeek.id
    )?.avgWeightKg;

    const avgWeightAfterText = textOf(details, /avg weight:/i);

    if (expectedAvgWeightAfter === undefined) {
      expect(avgWeightAfterText).toMatch(/n\/a/i);
    } else {
      expect(extractFirstNumber(avgWeightAfterText)).toBeCloseTo(
        expectedAvgWeightAfter,
        1
      );
    }
  });

  it("persistence: initializes from WeeksStore.load when it returns weeks", async () => {
    const storedWeeks = sampleWeeks.map((w) =>
      w.id !== firstTrendWeek.id ? w : { ...w, avgStepsPerDay: 12345 }
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
      sampleWeeksTrend.length
    );
  });
});
