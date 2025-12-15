import { act, render, screen, within } from "@testing-library/react";
import { WeeklyOverviewPage } from "./WeeklyOverviewPage";
import { describe, it, expect, beforeEach } from "vitest";
import { sampleWeeks } from "../../data/sample-data/sampleWeek";
import {
  computeTrendMetrics,
  type WeekTrendMetrics,
} from "../../domain/weekTrend";

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

  describe("renders the computed values for the correct week", () => {
    testRenderingOfWeekData(firstTrendWeek);
    testRenderingOfWeekData(secondTrendWeek);
  });

  it("renders no delta for a week with no previous avg weight", () => {
    act(() => {
      screen
        .getByRole("button", { name: `Week of ${firstTrendWeek.weekOf}` })
        .click();
    });

    const firstWeekDelta = screen.getByText(/Δ weight vs prev:\s*n\/a/i);
    expect(firstWeekDelta).toBeInTheDocument();
  });

  it("renders correct delta week with previous avg weight", () => {
    act(() => {
      screen
        .getByRole("button", { name: `Week of ${secondTrendWeek.weekOf}` })
        .click();
    });

    const expected = `Δ weight vs prev: ${secondTrendWeek.weightChangeVsPrevKg?.toFixed(
      1
    )} kg (${secondTrendWeek.weightChangeVsPrevPercent?.toFixed(1)}%)`;
    const secondWeekDelta = screen.getByText(expected);
    expect(secondWeekDelta).toBeInTheDocument();
  });
});

const testRenderingOfWeekData = (week: WeekTrendMetrics) => {
  describe(`Week of ${week.weekOf}`, () => {
    let card: HTMLElement;

    beforeEach(() => {
      const heading = screen.getByRole("heading", {
        level: 2,
        name: `Week of ${week.weekOf}`,
      });

      const li = heading.closest("li");
      if (!li) {
        throw new Error(`No <li> found for week ${week.weekOf}`);
      }

      card = li;

      act(() => {
        screen.getByRole("button", { name: `Week of ${week.weekOf}` }).click();
      });
    });

    it("renders the avg weight", () => {
      const avgWeight = within(card).getByText(
        `Avg weight: ${week.avgWeightKg?.toFixed(1)} kg`
      );
      expect(avgWeight).toBeInTheDocument();
    });

    it("renders min and max weights in kg", () => {
      const minMaxWeight = within(card).getByText(
        `Min / Max: ${week.minWeightKg?.toFixed(
          1
        )} kg / ${week.maxWeightKg?.toFixed(1)} kg`
      );
      expect(minMaxWeight).toBeInTheDocument();
    });

    it("renders avg calories", () => {
      const avgCalories = within(card).getByText(
        `Avg calories: ${week.avgCalories?.toFixed(0)} kcal`
      );
      expect(avgCalories).toBeInTheDocument();
    });

    it("renders avg protein and avg protein per kg", () => {
      const avgProtein = within(card).getByText(
        `Avg protein: ${week.avgProteinG?.toFixed(0)} g`
      );
      expect(avgProtein).toBeInTheDocument();

      const avgProteinPerKg = within(card).getByText(
        `Avg protein per kg: ${week.avgProteinPerKg?.toFixed(2)} g/kg`
      );
      expect(avgProteinPerKg).toBeInTheDocument();
    });
  });
};
