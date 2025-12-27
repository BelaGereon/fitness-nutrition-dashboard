import React from "react";
import type { WeekEntry } from "../../domain/week";
import type { WeekTrendMetrics } from "../../domain/weekTrend";
import { formatData } from "./util/format";

type WeekCardProps = {
  trend: WeekTrendMetrics;
  base: WeekEntry;
  isOpen: boolean;
  onToggle: () => void;
  onSaveWeek: (nextWeek: WeekEntry) => void;
};

export function WeekCard({
  trend,
  base,
  isOpen,
  onToggle,
  onSaveWeek,
}: WeekCardProps) {
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

  const [isEditingMonWeight, setIsEditingMonWeight] = React.useState(false);
  const [draftMonWeight, setDraftMonWeight] = React.useState<string>("");

  React.useEffect(() => {
    if (isEditingMonWeight) {
      setDraftMonWeight(base.days.mon.weightKg?.toString() ?? "");
    }
  }, [isEditingMonWeight, base.days.mon.weightKg]);

  const commitMonWeight = () => {
    const trimmed = draftMonWeight.trim();
    const parsed = trimmed === "" ? undefined : Number.parseFloat(trimmed);

    if (parsed !== undefined && Number.isNaN(parsed)) return;

    const nextWeek: WeekEntry = {
      ...base,
      days: {
        ...base.days,
        mon: {
          ...base.days.mon,
          weightKg: parsed,
        },
      },
    };

    onSaveWeek(nextWeek);
    setIsEditingMonWeight(false);
  };

  const [isEditingSteps, setIsEditingSteps] = React.useState(false);
  const [draftSteps, setDraftSteps] = React.useState<string>("");

  React.useEffect(() => {
    if (isEditingSteps) {
      setDraftSteps(base.avgStepsPerDay?.toString() ?? "");
    }
  }, [isEditingSteps, base.avgStepsPerDay]);

  const commitSteps = () => {
    const trimmed = draftSteps.trim();
    const parsed = trimmed === "" ? undefined : Number.parseInt(trimmed, 10);

    if (parsed !== undefined && Number.isNaN(parsed)) return;

    const nextWeek: WeekEntry = {
      ...base,
      avgStepsPerDay: parsed,
    };

    onSaveWeek(nextWeek);
    setIsEditingSteps(false);
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
          <div>
            Avg weight: {formatData(avgWeightKg, { decimals: 1, unit: "kg" })}
          </div>
          <div>
            Min / Max: {formatData(minWeightKg, { decimals: 1, unit: "kg" })} /{" "}
            {formatData(maxWeightKg, { decimals: 1, unit: "kg" })}
          </div>
          <div>
            Avg calories:{" "}
            {formatData(avgCalories, { decimals: 0, unit: "kcal" })}
          </div>
          <div>
            Avg protein: {formatData(avgProteinG, { decimals: 0, unit: "g" })}
          </div>
          <div>
            Avg protein per kg:{" "}
            {formatData(avgProteinPerKg, { decimals: 2, unit: "g/kg" })}
          </div>

          <div>
            Avg steps: {formatData(base.avgStepsPerDay, { decimals: 0 })}
            {!isEditingSteps ? (
              <button type="button" onClick={() => setIsEditingSteps(true)}>
                Edit steps
              </button>
            ) : (
              <>
                <label htmlFor={`${id}-avg-steps`}>Avg steps</label>
                <input
                  id={`${id}-avg-steps`}
                  type="number"
                  value={draftSteps}
                  onChange={(e) => setDraftSteps(e.target.value)}
                />
                <button type="button" onClick={commitSteps}>
                  Save steps
                </button>
                <button type="button" onClick={() => setIsEditingSteps(false)}>
                  Cancel
                </button>
              </>
            )}
          </div>

          <div>
            Δ weight vs prev:{" "}
            {weightChangeVsPrevKg !== undefined &&
            weightChangeVsPrevPercent !== undefined
              ? `${weightChangeVsPrevKg.toFixed(
                  1
                )} kg (${weightChangeVsPrevPercent.toFixed(1)}%)`
              : "n/a"}
          </div>

          <div>
            Mon weight:{" "}
            {formatData(base.days.mon.weightKg, { decimals: 1, unit: "kg" })}
            {!isEditingMonWeight ? (
              <button type="button" onClick={() => setIsEditingMonWeight(true)}>
                Edit Monday weight
              </button>
            ) : (
              <>
                <label htmlFor={`${id}-mon-weight`}>Monday weight (kg)</label>
                <input
                  id={`${id}-mon-weight`}
                  type="number"
                  step="0.1"
                  value={draftMonWeight}
                  onChange={(e) => setDraftMonWeight(e.target.value)}
                />
                <button type="button" onClick={commitMonWeight}>
                  Save Monday weight
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingMonWeight(false)}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
