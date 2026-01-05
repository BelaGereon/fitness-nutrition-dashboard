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
  trainingSessionsDescription: "2x Full Body",
  totalSets: 40,
  totalVolumeKg: 1234.5,
  notes: "Solid week",
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
  const setup = (overrides: Partial<Props> = {}) => {
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

  it("renders: week title as accessible button", () => {
    setup();
    expect(
      screen.getByRole("button", { name: `Week of ${trend.weekOf}` })
    ).toBeInTheDocument();
  });

  it("behavior: calls onToggle when title button is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    setup({ onToggle });

    await user.click(
      screen.getByRole("button", { name: `Week of ${trend.weekOf}` })
    );
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("renders: details only when isOpen=true", () => {
    const detailsId = detailsTestIdForWeekId(trend.id);
    const { rerender, props } = setup({ isOpen: false });

    expect(screen.queryByTestId(detailsId)).not.toBeInTheDocument();

    rerender(<WeekCard {...props} isOpen={true} />);

    expect(screen.getByTestId(detailsId)).toBeInTheDocument();
  });

  it("a11y: reflects open state via aria-expanded", () => {
    const { rerender, props } = setup({ isOpen: false });

    const titleButton = screen.getByRole("button", {
      name: `Week of ${trend.weekOf}`,
    });

    expect(titleButton).toHaveAttribute("aria-expanded", "false");

    rerender(<WeekCard {...props} isOpen={true} />);
    expect(titleButton).toHaveAttribute("aria-expanded", "true");
  });

  describe("renders: week meta fields", () => {
    it("renders: training/sets/volume/notes in read-only mode", () => {
      setup({ isOpen: true });

      const details = within(
        screen.getByTestId(detailsTestIdForWeekId(trend.id))
      );

      // Be resilient to exact wording; only assert that the values show up.
      expect(details.getByText(/training:/i)).toHaveTextContent("2x Full Body");
      expect(details.getByText(/sets:/i)).toHaveTextContent("40");
      expect(details.getByText(/volume:/i)).toHaveTextContent("1234.5");
      expect(details.getByText(/notes:/i)).toHaveTextContent("Solid week");
    });

    it("behavior: allows editing training/sets/volume/notes and saves them", async () => {
      const user = userEvent.setup();
      const onSaveWeek = vi.fn();

      setup({ isOpen: true, onSaveWeek });

      const details = within(
        screen.getByTestId(detailsTestIdForWeekId(trend.id))
      );

      await user.click(details.getByRole("button", { name: /^edit$/i }));

      // Training (textarea)
      const trainingInput = details.getByLabelText(/^training$/i);
      await user.clear(trainingInput);
      await user.type(trainingInput, "Upper / Lower");

      // Total sets (number input)
      const setsInput = details.getByRole("spinbutton", {
        name: /total sets/i,
      });
      await user.clear(setsInput);
      await user.type(setsInput, "80");

      // Total volume kg (number input)
      const volumeInput = details.getByRole("spinbutton", {
        name: /total volume/i,
      });
      await user.clear(volumeInput);
      await user.type(volumeInput, "9876.5");

      // Notes (textarea)
      const notesInput = details.getByLabelText(/^notes$/i);
      await user.clear(notesInput);
      await user.type(notesInput, "Felt great this week!");

      await user.click(details.getByRole("button", { name: /^save$/i }));

      expect(onSaveWeek).toHaveBeenCalledTimes(1);
      const saved = onSaveWeek.mock.calls[0][0] as WeekEntry;

      expect(saved.trainingSessionsDescription).toBe("Upper / Lower");
      expect(saved.totalSets).toBe(80);
      expect(saved.totalVolumeKg).toBe(9876.5);
      expect(saved.notes).toBe("Felt great this week!");
    });

    it("behavior: shows a validation error when invalid inputs are entered and does not save", async () => {
      const user = userEvent.setup();
      const onSaveWeek = vi.fn();

      setup({ isOpen: true, onSaveWeek });

      const details = within(
        screen.getByTestId(detailsTestIdForWeekId(trend.id))
      );

      await user.click(details.getByRole("button", { name: /^edit$/i }));

      const setsInput = details.getByRole("spinbutton", {
        name: /total sets/i,
      });
      await user.clear(setsInput);
      await user.type(setsInput, "-1");

      await user.click(details.getByRole("button", { name: /^save$/i }));

      expect(onSaveWeek).not.toHaveBeenCalled();
      expect(details.getByRole("alert")).toHaveTextContent(/invalid/i);
    });

    it("behavior: cancel leaves data unchanged", async () => {
      const user = userEvent.setup();
      const onSaveWeek = vi.fn();

      setup({ isOpen: true, onSaveWeek });

      const details = within(
        screen.getByTestId(detailsTestIdForWeekId(trend.id))
      );

      await user.click(details.getByRole("button", { name: /^edit$/i }));

      const trainingInput = details.getByLabelText(/^training$/i);
      await user.clear(trainingInput);
      await user.type(trainingInput, "Changed");

      await user.click(details.getByRole("button", { name: /^cancel$/i }));

      // No save call
      expect(onSaveWeek).not.toHaveBeenCalled();

      // Back to read-only and shows original value
      expect(details.getByText(/training:/i)).toHaveTextContent("2x Full Body");
    });
  });

  describe("renders: missing data as 'n/a'", () => {
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
      trainingSessionsDescription: undefined,
      totalSets: undefined,
      totalVolumeKg: undefined,
      notes: undefined,
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

    const labels = [
      [/avg weight:/i],
      [/min \/ max:/i],
      [/avg calories:/i],
      [/avg protein:/i],
      [/avg protein per kg:/i],
      [/avg steps:/i],
      [/Δ weight vs prev:/i],
      [/training:/i],
      [/sets:/i],
      [/volume:/i],
      [/notes:/i],
    ] as const;

    it.each(labels)("renders: %s as n/a", (label) => {
      setup({ trend: incompleteTrend, base: incompleteBase, isOpen: true });

      const details = screen.getByTestId(
        detailsTestIdForWeekId(incompleteTrend.id)
      );

      expect(within(details).getByText(label)).toHaveTextContent(/n\/a/i);
    });
  });
});
