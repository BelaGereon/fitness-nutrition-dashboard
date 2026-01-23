import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

type Point = { x: number; y: number }; // x = timestamp (ms), y = weight

export function WeightHistoryChart() {
  // 1) Dummy data: timestamps (ms) + weights
  //    Using Date.parse(...) keeps it readable; ApexCharts wants ms.
  const series = [
    {
      name: "Weight (kg)",
      data: [
        { x: Date.parse("2025-12-01"), y: 78.4 },
        { x: Date.parse("2025-12-08"), y: 78.8 },
        { x: Date.parse("2025-12-15"), y: 79.1 },
        { x: Date.parse("2025-12-22"), y: 78.7 },
        { x: Date.parse("2025-12-29"), y: 79.5 },
        { x: Date.parse("2026-01-05"), y: 79.2 },
      ] satisfies Point[],
    },
  ];

  // 2) Chart configuration (“options”):
  //    - chart.type must match your intended chart
  //    - xaxis.type = "datetime" tells ApexCharts to treat x as dates
  const options: ApexOptions = {
    chart: {
      type: "area",
      animations: { enabled: false }, // keep it simple + stable for now
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: { curve: "smooth", width: 2 },
    dataLabels: { enabled: false },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeUTC: false, // treat dates in local time (helps avoid off-by-one confusion)
      },
    },
    yaxis: {
      title: { text: "kg" },
      decimalsInFloat: 1,
    },
    tooltip: {
      x: { format: "yyyy-MM-dd" },
      theme: "dark",
    },
  };

  // 3) Render:
  //    ReactApexChart needs: options + series + type + height (or width)
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
