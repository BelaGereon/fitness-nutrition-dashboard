import { render, screen } from "@testing-library/react";
import { WeeklyOverviewPage } from "./WeeklyOverviewPage";
import { describe, it, expect, beforeEach } from "vitest";

describe("WeeklyOverviewPage", () => {
  beforeEach(() => {
    render(WeeklyOverviewPage());
  });

  it("renders the correct number of weeks", () => {
    const weekItems = screen.getAllByText(/Week of/);
    expect(weekItems.length).toBe(2);
  });

  it("renders the computed values for the correct week", () => {
    const expectedFirstWeekAvgCalories =
      (2800 + 2700 + 2980 + 2600 + 2900 + 3000 + 2990) / 7;
    const expectedSecondWeekAvgCalories =
      (3077 + 2724 + 2574 + 2323 + 2692 + 2518 + 2965) / 7;

    const firstWeek = screen.getByText("Week of 2025-11-24");
    const secondWeek = screen.getByText("Week of 2025-12-01");

    const firstWeekAvgWeight = screen.getByText("Avg weight: 78.5kg");
    const firstWeekMinMaxWeight = screen.getByText(
      "Min / Max: 77.8kg / 79.0kg"
    );
    const firstWeekAvgCalories = screen.getByText(
      `Avg calories: ${expectedFirstWeekAvgCalories.toFixed(0)} kcal`
    );

    const secondWeekAvgWeight = screen.getByText("Avg weight: 78.7kg");
    const secondWeekMinMaxWeight = screen.getByText(
      "Min / Max: 78.2kg / 79.5kg"
    );

    const secondWeekAvgCalories = screen.getByText(
      `Avg calories: ${expectedSecondWeekAvgCalories.toFixed(0)} kcal`
    );

    expect(firstWeek).toBeInTheDocument();
    expect(firstWeekAvgWeight).toBeInTheDocument();
    expect(firstWeekMinMaxWeight).toBeInTheDocument();
    expect(firstWeekAvgCalories).toBeInTheDocument();

    expect(secondWeek).toBeInTheDocument();
    expect(secondWeekAvgWeight).toBeInTheDocument();
    expect(secondWeekMinMaxWeight).toBeInTheDocument();
    expect(secondWeekAvgCalories).toBeInTheDocument();
  });

  it.todo("renders no delta for a week with no previous avg weight");
});
