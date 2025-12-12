// src/features/dashboard/WeekCard.tsx
import type { WeekEntry } from "../../domain/week";
import type { WeekTrendMetrics } from "../../domain/weekTrend";

type WeekCardProps = {
  trend: WeekTrendMetrics;
  base: WeekEntry;
};

export function WeekCard({ trend, base }: WeekCardProps) {
  const {
    weekOf,
    avgWeightKg,
    minWeightKg,
    maxWeightKg,
    avgCalories,
    avgProteinG,
    avgProteinPerKg,
    weightChangeVsPrevKg,
    weightChangeVsPrevPercent,
    id,
  } = trend;

  const stepsPerDay = base.avgStepsPerDay;

  return (
    <li data-testid={`week-card-${id}`}>
      <h2>Week of {weekOf}</h2>
      <div>
        <div>Avg weight: {avgWeightKg?.toFixed(1)} kg</div>
        <div>
          Min / Max: {minWeightKg?.toFixed(1)} kg / {maxWeightKg?.toFixed(1)} kg
        </div>
        <div>Avg calories: {avgCalories?.toFixed(0)} kcal</div>
        <div>Avg protein: {avgProteinG?.toFixed(0)} g</div>
        <div>Avg protein per kg: {avgProteinPerKg?.toFixed(2)} g/kg</div>
        <div>Avg steps: {stepsPerDay}</div>
        <div>
          Δ weight vs prev:{" "}
          {weightChangeVsPrevKg != null
            ? `${weightChangeVsPrevKg.toFixed(
                1
              )} kg (${weightChangeVsPrevPercent?.toFixed(1)}%)`
            : "n/a"}
        </div>
      </div>
    </li>
  );
}
