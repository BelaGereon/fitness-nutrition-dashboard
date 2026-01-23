import React from "react";
import ReactApexChart from "react-apexcharts";
import { formatData } from "../../../util/format";

type WeeklyAvgMacrosChartProps = {
  avgSteps: number | undefined;
  avgCalories: number | undefined;
  avgProteinG: number | undefined;
  avgProteinPerKg: number | undefined;
  avgWeightKg: number | undefined;
};

export function WeeklyAvgMacrosChart({
  avgSteps,
  avgCalories,
  avgProteinG,
  avgProteinPerKg,
  avgWeightKg,
}: WeeklyAvgMacrosChartProps) {
  const goals = React.useMemo(() => {
    const avgProteinPerKgGoal =
      avgWeightKg === undefined || avgWeightKg === 0
        ? undefined
        : 166 / avgWeightKg;

    return {
      avgSteps: 9000,
      avgCalories: 3100,
      avgProteinG: 166,
      avgProteinPerKg: avgProteinPerKgGoal,
    };
  }, [avgWeightKg]);

  const rawValues = React.useMemo(
    () => [avgSteps, avgCalories, avgProteinG, avgProteinPerKg],
    [avgSteps, avgCalories, avgProteinG, avgProteinPerKg],
  );

  const goalValues = React.useMemo(
    () => [
      goals.avgSteps,
      goals.avgCalories,
      goals.avgProteinG,
      goals.avgProteinPerKg,
    ],
    [goals],
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
    return rawValues.map((value, index) => {
      const goal = goalValues[index];
      if (value === undefined || goal === undefined || goal <= 0) return 0;
      return Math.min((value / goal) * 100, 100);
    });
  }, [goalValues, rawValues]);

  const colors = React.useMemo(() => {
    const baseColors = ["#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"];
    const victoryGreen = "#00db50";

    return rawValues.map((value, index) => {
      const goal = goalValues[index];
      if (value !== undefined && goal !== undefined && value >= goal) {
        return victoryGreen;
      }
      return baseColors[index] ?? baseColors[0];
    });
  }, [goalValues, rawValues]);

  const options = {
    chart: {
      animations: { enabled: true },
    },
    colors,
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
