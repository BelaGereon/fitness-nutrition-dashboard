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

  it.todo("renders the computed values for the correct week");
  it.todo("renders no delta for a week with no previous avg weight");
});
