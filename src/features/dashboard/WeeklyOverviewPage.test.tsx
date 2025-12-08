// pseudo-test
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { WeeklyOverviewPage } from "./WeeklyOverviewPage";
import { describe, it, expect } from "vitest";

describe("WeeklyOverviewPage", () => {
  it("renders weekly overview with correct data", () => {
    render(<WeeklyOverviewPage />);

    // Check for presence of week headings
    expect(screen.getByText("Week of 2025-11-24")).toBeInTheDocument();
    expect(screen.getByText("Week of 2025-12-01")).toBeInTheDocument();
    // Check for average weight display
    expect(screen.getByText(/Avg weight:/)).toBeInTheDocument();
    // Check for average calories display
    expect(screen.getByText(/Avg calories:/)).toBeInTheDocument();
    // Check for average protein display
    expect(screen.getByText(/Avg protein:/)).toBeInTheDocument();
  });
});
