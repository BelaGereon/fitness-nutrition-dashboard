import React from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { WeekEntry } from "../../../../../domain/week";
import { buildWeightPointsFromWeeks } from "./weightSeries";

type WeightHistoryChartProps = {
  weeks: WeekEntry[];
};

export function WeightHistoryChart({ weeks }: WeightHistoryChartProps) {
  const data = React.useMemo(() => buildWeightPointsFromWeeks(weeks), [weeks]);

  const series = React.useMemo(
    () => [
      {
        name: "Weight (kg)",
        data,
      },
    ],
    [data],
  );

  const options: ApexOptions = {
    chart: {
      type: "area",
      animations: { enabled: false },
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
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
