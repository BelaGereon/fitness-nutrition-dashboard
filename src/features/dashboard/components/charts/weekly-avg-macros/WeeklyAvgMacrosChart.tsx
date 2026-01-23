import React from "react";
import ReactApexChart from "react-apexcharts";
import { formatData } from "../../../util/format";

type WeeklyAvgMacrosChartProps = {
  avgSteps: number | undefined;
  avgCalories: number | undefined;
  avgProteinG: number | undefined;
  avgProteinPerKg: number | undefined;
};

export function WeeklyAvgMacrosChart({
  avgSteps,
  avgCalories,
  avgProteinG,
  avgProteinPerKg,
}: WeeklyAvgMacrosChartProps) {
  const rawValues = React.useMemo(
    () => [avgSteps, avgCalories, avgProteinG, avgProteinPerKg],
    [avgSteps, avgCalories, avgProteinG, avgProteinPerKg],
  );

  const formattedValues = React.useMemo(
    () => [
      formatData(avgSteps, { decimals: 0 }),
      formatData(avgCalories, { decimals: 0, unit: "kcal" }),
      formatData(avgProteinG, { decimals: 0, unit: "g" }),
      formatData(avgProteinPerKg, { decimals: 2, unit: "g/kg" }),
    ],
    [avgSteps, avgCalories, avgProteinG, avgProteinPerKg],
  );

  const series = React.useMemo(() => {
    return rawValues.map((value) => value ?? 0);
  }, [rawValues]);

  const options = {
    chart: {
      animations: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: 0,
        endAngle: 270,
        hollow: {
          margin: 5,
          size: "30%",
          background: "transparent",
          image: undefined,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            show: false,
          },
        },
        barLabels: {
          enabled: true,
          useSeriesColors: true,
          offsetX: -8,
          fontSize: "16px",
          formatter: function (
            seriesName: string,
            opts: {
              w: { globals: { series: { [x: string]: string } } };
              seriesIndex: string | number;
            },
          ) {
            const index = Number(opts.seriesIndex);
            const displayValue = formattedValues[index] ?? "n/a";
            return `${seriesName}:  ${displayValue}`;
          },
        },
      },
    },
    labels: [
      "Avg. steps",
      "Avg. calories",
      "Avg. protein",
      "Avg. protein per kg",
    ],
  };

  return (
    <section aria-label="Weekly average macros chart">
      <h3>Weekly average macros</h3>
      <ReactApexChart
        options={options}
        series={series}
        type="radialBar"
        height={280}
      />
    </section>
  );
}
