import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { WeeklyOverviewPage } from "./WeeklyOverviewPage";
import { describe, it, expect, beforeEach } from "vitest";
import { sampleWeeks } from "../../data/sample-data/sampleWeek";
import { computeTrendMetrics } from "../../domain/weekTrend";
import {
  cancelEdit,
  extractFirstNumber,
  numberOf,
  openWeek,
  queryWeekDetails,
  saveEdit,
  setDraftNumberField,
  textOf,
  weekToggleButton,
  weekDetails,
} from "./util/testUtils";

const trend = computeTrendMetrics(sampleWeeks);
const [firstTrendWeek, secondTrendWeek] = trend;

describe("WeeklyOverviewPage", () => {
  beforeEach(() => {
    render(<WeeklyOverviewPage />);
  });

  it("renders one card per trend week", () => {
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings).toHaveLength(trend.length);
  });

  it("shows a details panel with the expected fields when a week is opened", async () => {
    const user = userEvent.setup();
    const weekDetails = await openWeek(user, firstTrendWeek);

    expect(weekDetails.getByText(/avg weight:/i)).toBeInTheDocument();
    expect(weekDetails.getByText(/min \/ max:/i)).toBeInTheDocument();
    expect(weekDetails.getByText(/avg calories:/i)).toBeInTheDocument();
    expect(weekDetails.getByText(/avg protein:/i)).toBeInTheDocument();
    expect(weekDetails.getByText(/avg protein per kg:/i)).toBeInTheDocument();
    expect(weekDetails.getByText(/avg steps:/i)).toBeInTheDocument();
    expect(weekDetails.getByText(/Δ weight vs prev:/i)).toBeInTheDocument();
  });

  it("renders no delta for a week with no previous avg weight", async () => {
    const user = userEvent.setup();
    const weekDetails = await openWeek(user, firstTrendWeek);

    expect(weekDetails.getByText(/Δ weight vs prev:/i)).toHaveTextContent(
      /n\/a/i
    );
  });

  it("renders a delta for a week with previous avg weight", async () => {
    const user = userEvent.setup();
    const weekDetails = await openWeek(user, secondTrendWeek);

    const deltaText = weekDetails.getByText(/Δ weight vs prev:/i);
    expect(deltaText).not.toHaveTextContent(/n\/a/i);
    expect(deltaText).toHaveTextContent(/kg/);
  });

  it("only allows one week card to be open at a time", async () => {
    const user = userEvent.setup();

    await user.click(weekToggleButton(firstTrendWeek));
    expect(weekDetails(firstTrendWeek)).toBeInTheDocument();
    expect(queryWeekDetails(secondTrendWeek)).not.toBeInTheDocument();

    await user.click(weekToggleButton(secondTrendWeek));
    expect(queryWeekDetails(firstTrendWeek)).not.toBeInTheDocument();
    expect(weekDetails(secondTrendWeek)).toBeInTheDocument();

    await user.click(weekToggleButton(secondTrendWeek));
    expect(queryWeekDetails(firstTrendWeek)).not.toBeInTheDocument();
    expect(queryWeekDetails(secondTrendWeek)).not.toBeInTheDocument();
  });

  it("wires the correct week data into the opened card", async () => {
    const user = userEvent.setup();
    const weekDetails = await openWeek(user, firstTrendWeek);

    const renderedAvgWeight = numberOf(weekDetails, /avg weight:/i);
    expect(renderedAvgWeight).toBeCloseTo(firstTrendWeek.avgWeightKg!, 1);
  });

  it("allows editing avg steps and reflects the change in the UI", async () => {
    const user = userEvent.setup();
    const weekDetails = await openWeek(user, firstTrendWeek);

    const avgStepsLine = () => weekDetails.getByText(/avg steps:/i);

    await setDraftNumberField({
      user,
      scope: weekDetails,
      editButtonName: /edit steps/i,
      inputName: /avg steps/i,
      value: "10000",
    });

    // unchanged until save
    expect(avgStepsLine()).not.toHaveTextContent("10000");

    await saveEdit(user, weekDetails, /save steps/i);

    // re-query line after save (more robust)
    expect(avgStepsLine()).toHaveTextContent("10000");
  });

  it("does not edit steps when input is cancelled", async () => {
    const user = userEvent.setup();
    const weekDetails = await openWeek(user, firstTrendWeek);

    const avgStepsLine = () => weekDetails.getByText(/avg steps:/i);
    expect(avgStepsLine()).not.toHaveTextContent("20000");

    await setDraftNumberField({
      user,
      scope: weekDetails,
      editButtonName: /edit steps/i,
      inputName: /avg steps/i,
      value: "20000",
    });

    // unchanged until save
    expect(avgStepsLine()).not.toHaveTextContent("20000");

    await cancelEdit(user, weekDetails);

    expect(avgStepsLine()).not.toHaveTextContent("20000");
  });

  it("allows editing Monday weight and recomputes avg weight after saving", async () => {
    const user = userEvent.setup();
    const weekDetails = await openWeek(user, firstTrendWeek);

    const avgWeightBefore = numberOf(weekDetails, /avg weight:/i);
    const monWeightBefore = numberOf(weekDetails, /mon weight:/i);

    await setDraftNumberField({
      user,
      scope: weekDetails,
      editButtonName: /edit monday weight/i,
      inputName: /monday weight/i,
      value: "80",
    });

    // unchanged until save
    expect(numberOf(weekDetails, /avg weight:/i)).toBeCloseTo(
      avgWeightBefore,
      1
    );
    expect(numberOf(weekDetails, /mon weight:/i)).toBeCloseTo(
      monWeightBefore,
      1
    );

    await saveEdit(user, weekDetails, /save monday weight/i);

    // expected recomputed avg using the same domain function
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

    expect(numberOf(weekDetails, /mon weight:/i)).toBeCloseTo(80, 1);
    expect(numberOf(weekDetails, /avg weight:/i)).toBeCloseTo(
      expectedAvgWeightAfter,
      1
    );
  });

  it("does not change monday and avg weight values when input is cancelled", async () => {
    const user = userEvent.setup();
    const weekDetails = await openWeek(user, firstTrendWeek);

    const avgWeightBefore = numberOf(weekDetails, /avg weight:/i);
    const monWeightBefore = numberOf(weekDetails, /mon weight:/i);

    await setDraftNumberField({
      user,
      scope: weekDetails,
      editButtonName: /edit monday weight/i,
      inputName: /monday weight/i,
      value: "80",
    });

    await cancelEdit(user, weekDetails);

    expect(numberOf(weekDetails, /avg weight:/i)).toBeCloseTo(
      avgWeightBefore,
      1
    );
    expect(numberOf(weekDetails, /mon weight:/i)).toBeCloseTo(
      monWeightBefore,
      1
    );
  });

  it("treats an empty Monday weight input as undefined (renders 'n/a')", async () => {
    const user = userEvent.setup();
    const weekDetails = await openWeek(user, firstTrendWeek);

    // Save an empty input (clear + save) => undefined
    await setDraftNumberField({
      user,
      scope: weekDetails,
      editButtonName: /edit monday weight/i,
      inputName: /monday weight/i,
      value: "",
    });

    await saveEdit(user, weekDetails, /save monday weight/i);

    expect(weekDetails.getByText(/mon weight:/i)).toHaveTextContent(/n\/a/i);

    // Optional: assert avg weight matches domain expectation (handles undefined)
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

    const avgWeightAfterText = textOf(weekDetails, /avg weight:/i);

    if (expectedAvgWeightAfter === undefined) {
      expect(avgWeightAfterText).toMatch(/n\/a/i);
    } else {
      expect(extractFirstNumber(avgWeightAfterText)).toBeCloseTo(
        expectedAvgWeightAfter,
        1
      );
    }
  });
});
