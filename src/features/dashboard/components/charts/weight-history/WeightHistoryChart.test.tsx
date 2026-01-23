import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DayEntry, DayId, WeekEntry } from "../../../../../domain/week";
import {
  buildAvgWeightLineFromWeeks,
  buildWeightPointsFromWeeks,
} from "./util/weightSeries";
import { WeightHistoryChart } from "./WeightHistoryChart";

let lastApexProps: unknown;

vi.mock("react-apexcharts", () => ({
  __esModule: true,
  default: (props: unknown) => {
    lastApexProps = props;
    return <div data-testid="apexchart-mock" />;
  },
}));

const emptyDays = (): Record<DayId, DayEntry> => ({
  mon: {},
  tue: {},
  wed: {},
  thu: {},
  fri: {},
  sat: {},
  sun: {},
});

const makeWeek = (
  id: string,
  weekOf: string,
  weights: Partial<Record<DayId, number>>,
): WeekEntry => {
  const days = emptyDays();
  for (const [dayId, weightKg] of Object.entries(weights)) {
    days[dayId as DayId] = { weightKg };
  }

  return {
    id,
    weekOf,
    days,
  };
};

const getApexProps = () => {
  if (!lastApexProps) {
    throw new Error("Expected ReactApexChart to be rendered.");
  }
  return lastApexProps as {
    options: Record<string, unknown>;
    series: Array<{ name: string; type?: string; data: unknown[] }>;
    type: string;
    height: number;
  };
};

describe("WeightHistoryChart", () => {
  it("renders the chart container and heading", () => {
    render(<WeightHistoryChart weeks={[]} />);

    expect(
      screen.getByRole("region", { name: /weight history chart/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /weight history/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("apexchart-mock")).toBeInTheDocument();
  });

  it("passes weight + avg series data to the chart", () => {
    const weeks = [
      makeWeek("w1", "2025-12-01", { mon: 80.0, wed: 79.5 }),
      makeWeek("w2", "2025-12-08", { tue: 79.0 }),
    ];

    render(<WeightHistoryChart weeks={weeks} />);

    const { series } = getApexProps();
    const expectedWeight = buildWeightPointsFromWeeks(weeks);
    const expectedAvg = buildAvgWeightLineFromWeeks(weeks);

    expect(series).toHaveLength(2);
    expect(series[0].name).toBe("Weight (kg)");
    expect(series[0].type).toBe("area");
    expect(series[0].data).toEqual(expectedWeight);
    expect(series[1].name).toBe("Avg. weight (kg)");
    expect(series[1].type).toBe("line");
    expect(series[1].data).toEqual(expectedAvg);
  });

  it("configures chart options for stroke, fill, and tooltip", () => {
    render(<WeightHistoryChart weeks={[]} />);

    const { options } = getApexProps();
    const stroke = options.stroke as { curve?: string; width?: number[] };
    const fill = options.fill as { type?: string[] };
    const tooltip = options.tooltip as { shared?: boolean };

    expect(stroke).toMatchObject({ curve: "smooth", width: [2, 2] });
    expect(fill).toMatchObject({ type: ["gradient", "solid"] });
    expect(tooltip).toMatchObject({ shared: true });
  });
});
