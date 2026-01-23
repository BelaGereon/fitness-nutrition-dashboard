import React from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { type WeekEntry } from "../../../../../domain/week";
import {
  buildAvgWeightLineFromWeeks,
  buildWeightPointsFromWeeks,
} from "./util/weightSeries";

type WeightHistoryChartProps = {
  weeks: WeekEntry[];
};

export function WeightHistoryChart({ weeks }: WeightHistoryChartProps) {
  const weightHistory = React.useMemo(
    () => buildWeightPointsFromWeeks(weeks),
    [weeks],
  );

  const avgWeightHistory = React.useMemo(
    () => buildAvgWeightLineFromWeeks(weeks),
    [weeks],
  );

  const series = React.useMemo(
    () => [
      {
        name: "Weight (kg)",
        type: "area",
        data: weightHistory,
      },
      {
        name: "Avg. weight (kg)",
        type: "line",
        data: avgWeightHistory,
      },
    ],
    [weightHistory, avgWeightHistory],
  );

  const options: ApexOptions = {
    chart: {
      type: "area",
      animations: { enabled: true },
      toolbar: { show: false },
      zoom: { enabled: true },
    },
    stroke: {
      curve: "smooth",
      width: [2, 2],
    },
    dataLabels: { enabled: false },
    fill: {
      type: ["gradient", "solid"],
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [20, 100, 100, 100],
      },
    },
    xaxis: {
      type: "datetime",
      labels: { datetimeUTC: false },
    },
    yaxis: {
      title: { text: "kg" },
      decimalsInFloat: 1,
    },
    tooltip: {
      x: { format: "yyyy-MM-dd" },
      theme: "dark",
      shared: true,
    },
    noData: {
      text: "No weight data yet",
    },
  };

  return (
    <section aria-label="Weight history chart">
      <h3>Weight history</h3>
      <ReactApexChart
        options={options}
        series={series}
        type="area"
        height={280}
      />
    </section>
  );
}
