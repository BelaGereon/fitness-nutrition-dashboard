import type { WeekEntry } from "../../domain/week";
import type { WeekTrendMetrics } from "../../domain/weekTrend";

type WeekCardProps = {
  trend: WeekTrendMetrics;
  base: WeekEntry;
  isOpen: boolean;
  onToggle: () => void;
};

export function WeekCard({ trend, base, isOpen, onToggle }: WeekCardProps) {
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

  const detailsId = `week-card-${id}-details`;

  const formatData = (value: number | undefined, unit: string) => {
    return value !== undefined ? `${value.toFixed(1)} ${unit}` : "n/a";
  };

  return (
    <li data-testid={`week-card-${id}`}>
      <h2>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={detailsId}
        >
          Week of {weekOf}
        </button>
      </h2>

      {isOpen && (
        <div id={detailsId} data-testid={detailsId}>
          <div>Avg weight: {formatData(avgWeightKg, "kg")}</div>
          <div>
            Min / Max: {formatData(minWeightKg, "kg")} /{" "}
            {formatData(maxWeightKg, "kg")}
          </div>
          <div>Avg calories: {formatData(avgCalories, "kcal")}</div>
          <div>Avg protein: {formatData(avgProteinG, "g")}</div>
          <div>Avg protein per kg: {formatData(avgProteinPerKg, "g/kg")}</div>
          <div>Avg steps: {base.avgStepsPerDay ?? "n/a"}</div>
          <div>
            Δ weight vs prev: {formatData(weightChangeVsPrevKg, "kg")} (
            {formatData(weightChangeVsPrevPercent, "%")})
          </div>
        </div>
      )}
    </li>
  );
}
