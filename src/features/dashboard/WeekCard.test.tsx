// src/features/dashboard/WeekCard.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { WeekCard } from "./WeekCard";
import type { WeekEntry } from "../../domain/week";
import type { WeekTrendMetrics } from "../../domain/weekTrend";

describe("WeekCard", () => {
  const base: WeekEntry = {
    id: "test-week",
    weekOf: "2025-12-01",
    avgStepsPerDay: 9000,
    days: {
      mon: { weightKg: 78.5, calories: 2800, proteinG: 150 },
      tue: { weightKg: 78.2, calories: 2700, proteinG: 160 },
      wed: {},
      thu: {},
      fri: {},
      sat: {},
      sun: {},
    },
    totalSets: 40,
    trainingSessionsDescription: "2x Full Body",
  };

  const trend: WeekTrendMetrics = {
    id: "test-week",
    weekOf: "2025-12-01",
    avgWeightKg: 78.4,
    minWeightKg: 78.2,
    maxWeightKg: 78.5,
    avgCalories: 2750,
    avgProteinG: 155,
    avgProteinPerKg: 1.98,
    weightChangeVsPrevKg: 0.3,
    weightChangeVsPrevPercent: 0.4,
  };

  it("renders trend and base metrics for a week", () => {
    render(<WeekCard trend={trend} base={base} />);

    expect(screen.getByText("Week of 2025-12-01")).toBeInTheDocument();
    expect(screen.getByText("Avg weight: 78.4 kg")).toBeInTheDocument();
    expect(
      screen.getByText("Min / Max: 78.2 kg / 78.5 kg")
    ).toBeInTheDocument();
    expect(screen.getByText("Avg calories: 2750 kcal")).toBeInTheDocument();
    expect(screen.getByText("Avg protein: 155 g")).toBeInTheDocument();
    expect(
      screen.getByText("Avg protein per kg: 1.98 g/kg")
    ).toBeInTheDocument();
    expect(screen.getByText("Avg steps: 9000")).toBeInTheDocument();
    expect(
      screen.getByText("Δ weight vs prev: 0.3 kg (0.4%)")
    ).toBeInTheDocument();
  });

  it("renders the week title as an accessible button so the card can be interacted with", () => {
    render(<WeekCard trend={trend} base={base} />);

    expect(
      screen.getByRole("button", { name: `Week of ${trend.weekOf}` })
    ).toBeInTheDocument();
  });

  it.todo("renders details when selected=true");
  it.todo("hides details when selected=false");
});
