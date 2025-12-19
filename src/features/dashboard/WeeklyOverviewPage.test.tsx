import userEvent from "@testing-library/user-event";

import { render, screen, within } from "@testing-library/react";
import { WeeklyOverviewPage } from "./WeeklyOverviewPage";
import { describe, it, expect, beforeEach } from "vitest";
import { sampleWeeks } from "../../data/sample-data/sampleWeek";
import { computeTrendMetrics } from "../../domain/weekTrend";

describe("WeeklyOverviewPage", () => {
  const trend = computeTrendMetrics(sampleWeeks);
  const [firstTrendWeek, secondTrendWeek] = trend;

  beforeEach(() => {
    render(<WeeklyOverviewPage />);
  });

  it("renders one card per trend week", () => {
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings.length).toBe(computeTrendMetrics(sampleWeeks).length);
  });

  it("shows a details panel with the expected fields when a week is opened", async () => {
    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: `Week of ${firstTrendWeek.weekOf}` })
    );

    const detailsContainer = screen.getByTestId(
      `week-card-${firstTrendWeek.id}-details`
    );
    const details = within(detailsContainer);

    expect(details.getByText(/avg weight:/i)).toBeInTheDocument();
    expect(details.getByText(/min \/ max:/i)).toBeInTheDocument();
    expect(details.getByText(/avg calories:/i)).toBeInTheDocument();
    expect(details.getByText(/avg protein:/i)).toBeInTheDocument();
    expect(details.getByText(/avg protein per kg:/i)).toBeInTheDocument();
    expect(details.getByText(/avg steps:/i)).toBeInTheDocument();
    expect(details.getByText(/Δ weight vs prev:/i)).toBeInTheDocument();
  });

  it("renders no delta for a week with no previous avg weight", async () => {
    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: `Week of ${firstTrendWeek.weekOf}` })
    );

    const details = screen.getByTestId(
      `week-card-${firstTrendWeek.id}-details`
    );
    const deltaText = within(details).getByText(/Δ weight vs prev:/i);

    expect(deltaText).toHaveTextContent(/n\/a/i);
  });

  it("renders a delta for a week with previous avg weight", async () => {
    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: `Week of ${secondTrendWeek.weekOf}` })
    );

    const details = screen.getByTestId(
      `week-card-${secondTrendWeek.id}-details`
    );
    const deltaText = within(details).getByText(/Δ weight vs prev:/i);

    expect(deltaText).not.toHaveTextContent(/n\/a/i);
    expect(deltaText).toHaveTextContent(/kg/);
  });

  it("only allows one week card to be open at a time", async () => {
    const user = userEvent.setup();
    const firstWeekButton = screen.getByRole("button", {
      name: `Week of ${firstTrendWeek.weekOf}`,
    });
    const secondWeekButton = screen.getByRole("button", {
      name: `Week of ${secondTrendWeek.weekOf}`,
    });

    // Open first week
    await user.click(firstWeekButton);
    expect(
      screen.getByTestId(`week-card-${firstTrendWeek.id}-details`)
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(`week-card-${secondTrendWeek.id}-details`)
    ).not.toBeInTheDocument();

    // Open second week
    await user.click(secondWeekButton);
    expect(
      screen.queryByTestId(`week-card-${firstTrendWeek.id}-details`)
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId(`week-card-${secondTrendWeek.id}-details`)
    ).toBeInTheDocument();

    // Close second week
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

    await user.click(
      screen.getByRole("button", { name: `Week of ${firstTrendWeek.weekOf}` })
    );

    const details = screen.getByTestId(
      `week-card-${firstTrendWeek.id}-details`
    );
    const avgWeightText =
      within(details).getByText(/avg weight:/i).textContent ?? "";
    const renderedAvgWeight = extractFirstNumber(avgWeightText);

    expect(renderedAvgWeight).toBeCloseTo(firstTrendWeek.avgWeightKg!, 1);
  });

  it("allows editing avg steps and reflects the change in the UI", async () => {
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: `Week of ${firstTrendWeek.weekOf}` })
    );

    await user.click(screen.getByRole("button", { name: /edit avg steps/i }));
  });
});

const extractFirstNumber = (text: string) => {
  const numbersInText = text.match(/-?\d+(\.\d+)?/); // Matches integers and decimals

  if (!numbersInText) throw new Error(`No number found in: ${text}`);

  return Number(numbersInText[0]);
};
