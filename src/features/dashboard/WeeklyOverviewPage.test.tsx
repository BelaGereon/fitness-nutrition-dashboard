import userEvent from "@testing-library/user-event";

import { render, screen, within } from "@testing-library/react";
import { WeeklyOverviewPage } from "./WeeklyOverviewPage";
import { describe, it, expect, beforeEach } from "vitest";
import { sampleWeeks } from "../../data/sample-data/sampleWeek";
import {
  computeTrendMetrics,
  type WeekTrendMetrics,
} from "../../domain/weekTrend";

const trend = computeTrendMetrics(sampleWeeks);
const [firstTrendWeek, secondTrendWeek] = trend;

const extractFirstNumber = (text: string) => {
  const numbersInText = text.match(/-?\d+(\.\d+)?/); // Matches integers and decimals

  if (!numbersInText) throw new Error(`No number found in: ${text}`);

  return Number(numbersInText[0]);
};

const button = (buttonName: string | RegExp) =>
  screen.getByRole("button", { name: buttonName });

const details = (week: WeekTrendMetrics) =>
  screen.getByTestId(`week-card-${week.id}-details`);

describe("WeeklyOverviewPage", () => {
  beforeEach(() => {
    render(<WeeklyOverviewPage />);
  });

  it("renders one card per trend week", () => {
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings.length).toBe(computeTrendMetrics(sampleWeeks).length);
  });

  it("shows a details panel with the expected fields when a week is opened", async () => {
    const user = userEvent.setup();
    await user.click(button(`Week of ${firstTrendWeek.weekOf}`));

    const weekDetails = within(details(firstTrendWeek));

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
    await user.click(button(`Week of ${firstTrendWeek.weekOf}`));

    const deltaText = within(details(firstTrendWeek)).getByText(
      /Δ weight vs prev:/i
    );

    expect(deltaText).toHaveTextContent(/n\/a/i);
  });

  it("renders a delta for a week with previous avg weight", async () => {
    const user = userEvent.setup();
    await user.click(button(`Week of ${secondTrendWeek.weekOf}`));

    const deltaText = within(details(secondTrendWeek)).getByText(
      /Δ weight vs prev:/i
    );

    expect(deltaText).not.toHaveTextContent(/n\/a/i);
    expect(deltaText).toHaveTextContent(/kg/);
  });

  it("only allows one week card to be open at a time", async () => {
    const user = userEvent.setup();

    const firstWeekButton = button(`Week of ${firstTrendWeek.weekOf}`);
    const secondWeekButton = button(`Week of ${secondTrendWeek.weekOf}`);

    await user.click(firstWeekButton);
    expect(details(firstTrendWeek)).toBeInTheDocument();
    expect(
      screen.queryByTestId(`week-card-${secondTrendWeek.id}-details`)
    ).not.toBeInTheDocument();

    await user.click(secondWeekButton);
    expect(
      screen.queryByTestId(`week-card-${firstTrendWeek.id}-details`)
    ).not.toBeInTheDocument();
    expect(details(secondTrendWeek)).toBeInTheDocument();

    await user.click(secondWeekButton);
    expect(
      screen.queryByTestId(`week-card-${firstTrendWeek.id}-details`)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`week-card-${secondTrendWeek.id}-details`)
    ).not.toBeInTheDocument();
  });

  it("wires the correct week data into the opened card", async () => {
    const user = userEvent.setup();

    await user.click(button(`Week of ${firstTrendWeek.weekOf}`));

    const avgWeightText =
      within(details(firstTrendWeek)).getByText(/avg weight:/i).textContent ??
      "";
    const renderedAvgWeight = extractFirstNumber(avgWeightText);

    expect(renderedAvgWeight).toBeCloseTo(firstTrendWeek.avgWeightKg!, 1);
  });

  it("allows editing avg steps and reflects the change in the UI", async () => {
    const user = userEvent.setup();
    const newStepCount = "10000";

    await user.click(button(`Week of ${firstTrendWeek.weekOf}`));
    await user.click(button(/edit steps/i));

    const input = screen.getByRole("spinbutton", { name: /avg steps/i });

    await user.clear(input);
    await user.type(input, newStepCount);

    const avgStepsField = within(details(firstTrendWeek)).getByText(
      /avg steps:/i
    );

    expect(avgStepsField).not.toHaveTextContent(newStepCount);

    await user.click(button(/save steps/i));

    expect(avgStepsField).toHaveTextContent(newStepCount);
  });
});
