import React from "react";
import type { DayId, WeekEntry } from "../../domain/week";
import { DAY_IDS } from "../../domain/week";
import type { WeekTrendMetrics } from "../../domain/weekTrend";
import { formatData } from "./util/format";
import { type DraftDays, WeekEntryGrid } from "./WeekEntryGrid";

type WeekCardProps = {
  trend: WeekTrendMetrics;
  base: WeekEntry;
  isOpen: boolean;
  onToggle: () => void;
  onSaveWeek: (updatedWeek: WeekEntry) => void;
};

type DraftWeek = {
  avgStepsPerDay: string;
  trainingSessionsDescription: string;
  totalSets: string;
  totalVolumeKg: string;
  notes: string;
  otherNotes: string;
  days: DraftDays;
};

const toDraftWeek = (base: WeekEntry): DraftWeek => {
  const days: DraftDays = {
    mon: { weightKg: "", calories: "", proteinG: "" },
    tue: { weightKg: "", calories: "", proteinG: "" },
    wed: { weightKg: "", calories: "", proteinG: "" },
    thu: { weightKg: "", calories: "", proteinG: "" },
    fri: { weightKg: "", calories: "", proteinG: "" },
    sat: { weightKg: "", calories: "", proteinG: "" },
    sun: { weightKg: "", calories: "", proteinG: "" },
  };

  for (const dayId of DAY_IDS) {
    const day = base.days[dayId];
    days[dayId] = {
      weightKg: day.weightKg?.toString() ?? "",
      calories: day.calories?.toString() ?? "",
      proteinG: day.proteinG?.toString() ?? "",
    };
  }

  return {
    avgStepsPerDay: base.avgStepsPerDay?.toString() ?? "",
    trainingSessionsDescription: base.trainingSessionsDescription ?? "",
    totalSets: base.totalSets?.toString() ?? "",
    totalVolumeKg: base.totalVolumeKg?.toString() ?? "",
    notes: base.notes ?? "",
    otherNotes: base.otherNotes ?? "",
    days,
  };
};

const parseOptionalInt = (raw: string): number | undefined | "invalid" => {
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? "invalid" : parsed;
};

const parseOptionalFloat = (raw: string): number | undefined | "invalid" => {
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  const parsed = Number.parseFloat(trimmed);
  return Number.isNaN(parsed) ? "invalid" : parsed;
};

const parseOptionalText = (raw: string): string | undefined => {
  const trimmed = raw.trim();
  return trimmed === "" ? undefined : raw;
};

const fromDraftWeek = (base: WeekEntry, draft: DraftWeek): WeekEntry | null => {
  const avgStepsPerDay = parseOptionalInt(draft.avgStepsPerDay);
  const totalSets = parseOptionalInt(draft.totalSets);
  const totalVolumeKg = parseOptionalFloat(draft.totalVolumeKg);

  if (
    avgStepsPerDay === "invalid" ||
    totalSets === "invalid" ||
    totalVolumeKg === "invalid"
  ) {
    return null;
  }

  const days: WeekEntry["days"] = { ...base.days };

  for (const dayId of DAY_IDS) {
    const weightKg = parseOptionalFloat(draft.days[dayId].weightKg);
    const calories = parseOptionalInt(draft.days[dayId].calories);
    const proteinG = parseOptionalInt(draft.days[dayId].proteinG);

    if (
      weightKg === "invalid" ||
      calories === "invalid" ||
      proteinG === "invalid"
    ) {
      return null;
    }

    days[dayId] = {
      ...days[dayId],
      weightKg,
      calories,
      proteinG,
    };
  }

  return {
    ...base,
    avgStepsPerDay,
    trainingSessionsDescription: parseOptionalText(
      draft.trainingSessionsDescription
    ),
    totalSets,
    totalVolumeKg,
    notes: parseOptionalText(draft.notes),
    otherNotes: parseOptionalText(draft.otherNotes),
    days,
  };
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

  const [isEditing, setIsEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<DraftWeek>(() => toDraftWeek(base));
  const [hasValidationError, setHasValidationError] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setHasValidationError(false);
    }
  }, [isOpen]);

  const startEdit = () => {
    setDraft(toDraftWeek(base));
    setHasValidationError(false);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setHasValidationError(false);
    setIsEditing(false);
  };

  const saveEdit = () => {
    const updatedWeek = fromDraftWeek(base, draft);
    if (!updatedWeek) {
      setHasValidationError(true);
      return;
    }

    onSaveWeek(updatedWeek);
    setHasValidationError(false);
    setIsEditing(false);
  };

  const updateDay = (args: {
    dayId: DayId;
    field: keyof DraftDays[DayId];
    value: string;
  }) => {
    setDraft((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [args.dayId]: {
          ...prev.days[args.dayId],
          [args.field]: args.value,
        },
      },
    }));
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
            {!isEditing ? (
              <>Avg steps: {formatData(base.avgStepsPerDay, { decimals: 0 })}</>
            ) : (
              <>
                <label htmlFor={`${id}-avg-steps`}>Avg steps</label>
                <input
                  id={`${id}-avg-steps`}
                  type="number"
                  value={draft.avgStepsPerDay}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      avgStepsPerDay: e.target.value,
                    }))
                  }
                />
              </>
            )}
          </div>

          <div>
            {!isEditing ? (
              <>Training: {base.trainingSessionsDescription ?? "n/a"}</>
            ) : (
              <>
                <label htmlFor={`${id}-training`}>Training</label>
                <input
                  id={`${id}-training`}
                  type="text"
                  value={draft.trainingSessionsDescription}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      trainingSessionsDescription: e.target.value,
                    }))
                  }
                />
              </>
            )}
          </div>

          <div>
            {!isEditing ? (
              <>Total sets: {formatData(base.totalSets, { decimals: 0 })}</>
            ) : (
              <>
                <label htmlFor={`${id}-total-sets`}>Total sets</label>
                <input
                  id={`${id}-total-sets`}
                  type="number"
                  value={draft.totalSets}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      totalSets: e.target.value,
                    }))
                  }
                />
              </>
            )}
          </div>

          <div>
            {!isEditing ? (
              <>
                Total volume: {formatData(base.totalVolumeKg, { decimals: 1 })}
              </>
            ) : (
              <>
                <label htmlFor={`${id}-total-volume`}>Total volume</label>
                <input
                  id={`${id}-total-volume`}
                  type="number"
                  step="0.1"
                  value={draft.totalVolumeKg}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      totalVolumeKg: e.target.value,
                    }))
                  }
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
            onChangeDay={updateDay}
          />
        </div>
      )}
    </li>
  );
}
