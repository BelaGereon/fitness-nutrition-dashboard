import type React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { WeekCard } from "./WeekCard";
import type { WeekEntry } from "../../domain/week";
import type { WeekTrendMetrics } from "../../domain/weekTrend";
import { detailsTestIdForWeekId } from "./util/testUtils";

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

type Props = React.ComponentProps<typeof WeekCard>;

describe("WeekCard", () => {
  const renderWeekCard = (overrides: Partial<Props> = {}) => {
    const props: Props = {
      trend,
      base,
      isOpen: false,
      onToggle: vi.fn(),
      onSaveWeek: vi.fn(),
      ...overrides,
    };

    return { ...render(<WeekCard {...props} />), props };
  };

  it("renders the week title as an accessible button so the card can be interacted with", () => {
    renderWeekCard();

    expect(
      screen.getByRole("button", { name: `Week of ${trend.weekOf}` })
    ).toBeInTheDocument();
  });

  it("calls onToggle when the week title button is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    renderWeekCard({ onToggle });

    await user.click(
      screen.getByRole("button", { name: `Week of ${trend.weekOf}` })
    );
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("renders details only when isOpen=true", () => {
    const detailsId = detailsTestIdForWeekId(trend.id);
    const { rerender, props } = renderWeekCard({ isOpen: false });

    expect(screen.queryByTestId(detailsId)).not.toBeInTheDocument();

    rerender(<WeekCard {...props} isOpen={true} />);

    expect(screen.getByTestId(detailsId)).toBeInTheDocument();
  });

  it("renders missing data as 'n/a'", () => {
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

    renderWeekCard({
      trend: incompleteTrend,
      base: incompleteBase,
      isOpen: true,
    });

    const details = screen.getByTestId(
      detailsTestIdForWeekId(incompleteTrend.id)
    );

    const expectLineToContainNA = (label: RegExp) => {
      expect(within(details).getByText(label)).toHaveTextContent(/n\/a/i);
    };

    expectLineToContainNA(/avg weight:/i);
    expectLineToContainNA(/min \/ max:/i);
    expectLineToContainNA(/avg calories:/i);
    expectLineToContainNA(/avg protein:/i);
    expectLineToContainNA(/avg protein per kg:/i);
    expectLineToContainNA(/avg steps:/i);
    expectLineToContainNA(/Δ weight vs prev:/i);
  });

  it("reflects open state via aria-expanded", () => {
    const { rerender, props } = renderWeekCard({ isOpen: false });

    const titleButton = screen.getByRole("button", {
      name: `Week of ${trend.weekOf}`,
    });

    expect(titleButton).toHaveAttribute("aria-expanded", "false");

    rerender(<WeekCard {...props} isOpen={true} />);
    expect(titleButton).toHaveAttribute("aria-expanded", "true");
  });
});
