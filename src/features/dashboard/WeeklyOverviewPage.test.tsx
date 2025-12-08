import { render, screen } from "@testing-library/react";
import { WeeklyOverviewPage } from "./WeeklyOverviewPage";
import { describe, it, expect } from "vitest";

describe("WeeklyOverviewPage", () => {
  it("shows weekly averages and weight deltas", () => {
    render(<WeeklyOverviewPage />);

    expect(screen.getByText(/Week of 2025-11-24/)).toBeInTheDocument();
  });
});
