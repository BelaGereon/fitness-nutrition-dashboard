import { render, screen } from "@testing-library/react";
import { WeeklyOverviewPage } from "./WeeklyOverviewPage";
import { describe, it, expect, beforeEach } from "vitest";
import { sampleWeeks } from "../../data/sample-data/sampleWeek";
import {
  computeTrendMetrics,
  type WeekTrendMetrics,
} from "../../domain/weekTrend";

describe("WeeklyOverviewPage", () => {
  const [firstTrendWeek, secondTrendWeek] = computeTrendMetrics(sampleWeeks);

  beforeEach(() => {
    render(<WeeklyOverviewPage />);
  });

  it("renders the correct number of weeks", () => {
    const weekItems = screen.getAllByText(/Week of/);
    expect(weekItems.length).toBe(2);
  });

  describe("renders the computed values for the correct week", () => {
    testRenderingOfWeekData(firstTrendWeek);
    testRenderingOfWeekData(secondTrendWeek);
  });

  it("renders no delta for a week with no previous avg weight", () => {
    const firstWeekDelta = screen.getByText("Δ weight vs prev: n/a");
    expect(firstWeekDelta).toBeInTheDocument();
  });

  it("renders correct delta week with previous avg weight", () => {
    const secondWeekDelta = screen.getByText("Δ weight vs prev: 0.3 kg (0.4%)");
    expect(secondWeekDelta).toBeInTheDocument();
  });
});

const testRenderingOfWeekData = (week: WeekTrendMetrics) => {
  describe(`Week of ${week.weekOf}`, () => {
    it(`renders heading`, () => {
      const weekHeader = screen.getByText(`Week of ${week.weekOf}`);
      expect(weekHeader).toBeInTheDocument();
    });

    it(`renders the avg weight`, () => {
      const avgWeight = screen.getByText(
        `Avg weight: ${week.avgWeightKg?.toFixed(1)} kg`
      );
      expect(avgWeight).toBeInTheDocument();
    });

    it(`renders min and max weights in kg`, () => {
      const minMaxWeight = screen.getByText(
        `Min / Max: ${week.minWeightKg?.toFixed(
          1
        )} kg / ${week.maxWeightKg?.toFixed(1)} kg`
      );
      expect(minMaxWeight).toBeInTheDocument();
    });

    it(`renders avg calories`, () => {
      const avgCalories = screen.getByText(
        `Avg calories: ${week.avgCalories?.toFixed(0)} kcal`
      );
      expect(avgCalories).toBeInTheDocument();
    });

    it(`renders avg protein and avg protein per kg`, () => {
      const avgProtein = screen.getByText(
        `Avg protein: ${week.avgProteinG?.toFixed(0)} g`
      );
      expect(avgProtein).toBeInTheDocument();

      const avgProteinPerKg = screen.getByText(
        `Avg protein per kg: ${week.avgProteinPerKg?.toFixed(2)} g/kg`
      );
      expect(avgProteinPerKg).toBeInTheDocument();
    });
  });
};
