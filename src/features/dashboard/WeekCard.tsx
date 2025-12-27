import type { WeekEntry } from "../../domain/week";
import type { WeekTrendMetrics } from "../../domain/weekTrend";
import { formatData } from "./util/format";
import { WeekEntryGrid } from "./WeekEntryGrid";
import { useWeekEditor } from "./weekEditor";

type WeekCardProps = {
  trend: WeekTrendMetrics;
  base: WeekEntry;
  isOpen: boolean;
  onToggle: () => void;
  onSaveWeek: (updatedWeek: WeekEntry) => void;
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

  const {
    isEditing,
    draft,
    hasValidationError,
    startEdit,
    cancelEdit,
    saveEdit,
    setAvgStepsDraft,
    updateDayDraft,
  } = useWeekEditor({ base, isOpen, onSaveWeek });

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
          {/* Controls at the top (matches your refactor) */}
          {!isEditing ? (
            <button type="button" onClick={startEdit}>
              Edit
            </button>
          ) : (
            <div>
              <button type="button" onClick={saveEdit}>
                Save
              </button>
              <button type="button" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          )}

          {hasValidationError && (
            <div role="alert">Please fix invalid inputs before saving.</div>
          )}

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
            {!isEditing ? (
              <>Avg steps: {formatData(base.avgStepsPerDay, { decimals: 0 })}</>
            ) : (
              <>
                <label htmlFor={`${id}-avg-steps`}>Avg steps</label>
                <input
                  id={`${id}-avg-steps`}
                  type="number"
                  value={draft.avgStepsPerDay}
                  onChange={(e) => setAvgStepsDraft(e.target.value)}
                />
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

          <WeekEntryGrid
            days={base.days}
            isEditing={isEditing}
            draftDays={draft.days}
            onChangeDay={updateDayDraft}
          />
        </div>
      )}
    </li>
  );
}
