import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
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

  it("renders the week title as an accessible button so the card can be interacted with", () => {
    render(
      <WeekCard trend={trend} base={base} isOpen={false} onToggle={vi.fn()} />
    );

    expect(
      screen.getByRole("button", { name: `Week of ${trend.weekOf}` })
    ).toBeInTheDocument();
  });

  it("calls onToggle when the week title button is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <WeekCard trend={trend} base={base} isOpen={false} onToggle={onToggle} />
    );

    await user.click(
      screen.getByRole("button", { name: `Week of ${trend.weekOf}` })
    );
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("renders details only when isOpen=true", () => {
    const detailsTestId = `week-card-${trend.id}-details`;

    const { rerender } = render(
      <WeekCard trend={trend} base={base} isOpen={false} onToggle={() => {}} />
    );
    expect(screen.queryByTestId(detailsTestId)).not.toBeInTheDocument();

    rerender(
      <WeekCard trend={trend} base={base} isOpen={true} onToggle={() => {}} />
    );
    expect(screen.getByTestId(detailsTestId)).toBeInTheDocument();
  });

  it("renders missing data as 'n/a'", async () => {
    const incompleteBase: WeekEntry = {
      id: "incomplete-week",
      weekOf: "2025-12-08",
      avgStepsPerDay: undefined,
      days: {
        mon: {},
        tue: {},
        wed: {},
        thu: {},
        fri: {},
        sat: {},
        sun: {},
      },
      totalSets: 30,
      trainingSessionsDescription: "1x Cardio",
    };
    const incompleteTrend: WeekTrendMetrics = {
      id: "incomplete-week",
      weekOf: "2025-12-08",
      avgWeightKg: undefined,
      minWeightKg: undefined,
      maxWeightKg: undefined,
      avgCalories: undefined,
      avgProteinG: undefined,
      avgProteinPerKg: undefined,
      weightChangeVsPrevKg: undefined,
      weightChangeVsPrevPercent: undefined,
    };

    render(
      <WeekCard
        trend={incompleteTrend}
        base={incompleteBase}
        isOpen={true}
        onToggle={() => {}}
      />
    );

    const details = screen.getByTestId(
      `week-card-${incompleteTrend.id}-details`
    );
    const withingDetails = within(details);

    expect(withingDetails.getByText("Avg weight: n/a")).toBeInTheDocument();
    expect(
      withingDetails.getByText("Min / Max: n/a / n/a")
    ).toBeInTheDocument();
    expect(withingDetails.getByText("Avg calories: n/a")).toBeInTheDocument();
    expect(withingDetails.getByText("Avg protein: n/a")).toBeInTheDocument();
    expect(
      withingDetails.getByText("Avg protein per kg: n/a")
    ).toBeInTheDocument();
    expect(withingDetails.getByText("Avg steps: n/a")).toBeInTheDocument();
    expect(
      withingDetails.getByText("Δ weight vs prev: n/a")
    ).toBeInTheDocument();
  });
});
