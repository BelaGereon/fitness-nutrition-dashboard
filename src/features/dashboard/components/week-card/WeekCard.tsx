import type { WeekEntry } from "../../../../domain/week";
import type { WeekTrendMetrics } from "../../../../domain/weekTrend";
import { useWeekEditor } from "../../hooks/useWeekEditor";
import { formatData } from "../../util/format";
import { WeeklyAvgMacrosChart } from "../charts/weekly-avg-macros/WeeklyAvgMacrosChart";
import { WeekEntryGrid } from "../week-entry-grid/WeekEntryGrid";

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
    setTrainingSessionsDescriptionDraft,
    setTotalSetsDraft,
    setTotalVolumeKgDraft,
    setNotesDraft,
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
          <WeeklyAvgMacrosChart
            avgSteps={base.avgStepsPerDay}
            avgCalories={avgCalories}
            avgProteinG={avgProteinG}
            avgProteinPerKg={avgProteinPerKg}
            avgWeightKg={avgWeightKg}
          />
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
                  1,
                )} kg (${weightChangeVsPrevPercent.toFixed(1)}%)`
              : "n/a"}
          </div>

          <div>
            {!isEditing ? (
              <>
                <div>
                  Training:{" "}
                  {base.trainingSessionsDescription?.trim()
                    ? base.trainingSessionsDescription
                    : "n/a"}
                </div>
                <div>Sets: {formatData(base.totalSets, { decimals: 0 })}</div>
                <div>
                  Volume:{" "}
                  {formatData(base.totalVolumeKg, { decimals: 1, unit: "kg" })}
                </div>
                <div>Notes: {base.notes?.trim() ? base.notes : "n/a"}</div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor={`${id}-training-desc`}>Training</label>
                  <textarea
                    id={`${id}-training-desc`}
                    value={draft.trainingSessionsDescription}
                    onChange={(e) =>
                      setTrainingSessionsDescriptionDraft(e.target.value)
                    }
                  />
                </div>

                <div>
                  <label htmlFor={`${id}-total-sets`}>Total sets</label>
                  <input
                    id={`${id}-total-sets`}
                    type="number"
                    step="1"
                    value={draft.totalSets}
                    onChange={(e) => setTotalSetsDraft(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor={`${id}-total-volume`}>
                    Total volume (kg)
                  </label>
                  <input
                    id={`${id}-total-volume`}
                    type="number"
                    step="0.1"
                    value={draft.totalVolumeKg}
                    onChange={(e) => setTotalVolumeKgDraft(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor={`${id}-notes`}>Notes</label>
                  <textarea
                    id={`${id}-notes`}
                    value={draft.notes}
                    onChange={(e) => setNotesDraft(e.target.value)}
                  />
                </div>
              </>
            )}
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
