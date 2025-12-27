import * as React from "react";
import { DAY_IDS, type DayId, type WeekEntry } from "../../domain/week";

export type DraftDayEntry = {
  weightKg: string;
  calories: string;
  proteinG: string;
};

export type DraftDays = Record<DayId, DraftDayEntry>;

export type DraftWeek = {
  avgStepsPerDay: string;
  days: DraftDays;
};

const createEmptyDraftDays = (): DraftDays => ({
  mon: { weightKg: "", calories: "", proteinG: "" },
  tue: { weightKg: "", calories: "", proteinG: "" },
  wed: { weightKg: "", calories: "", proteinG: "" },
  thu: { weightKg: "", calories: "", proteinG: "" },
  fri: { weightKg: "", calories: "", proteinG: "" },
  sat: { weightKg: "", calories: "", proteinG: "" },
  sun: { weightKg: "", calories: "", proteinG: "" },
});

export const toDraftWeek = (base: WeekEntry): DraftWeek => {
  const draftDays = createEmptyDraftDays();

  for (const dayId of DAY_IDS) {
    const day = base.days[dayId];
    draftDays[dayId] = {
      weightKg: day.weightKg?.toString() ?? "",
      calories: day.calories?.toString() ?? "",
      proteinG: day.proteinG?.toString() ?? "",
    };
  }

  return {
    avgStepsPerDay: base.avgStepsPerDay?.toString() ?? "",
    days: draftDays,
  };
};

const INT_PATTERN = /^\d+$/;
const FLOAT_PATTERN = /^\d+(\.\d+)?$/;

const normalizeWeightInput = (raw: string): string | "invalid" => {
  const trimmed = raw.trim();
  if (trimmed === "") return "";
  if (trimmed.includes(",") && trimmed.includes(".")) return "invalid";

  return trimmed.replace(",", ".");
};

const parseOptionalNonNegativeInt = (
  raw: string
): number | undefined | "invalid" => {
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  if (!INT_PATTERN.test(trimmed)) return "invalid";

  const parsed = Number.parseInt(trimmed, 10);
  if (Number.isNaN(parsed)) return "invalid";
  if (parsed < 0) return "invalid";
  return parsed;
};

const parseOptionalNonNegativeFloatWeight = (
  raw: string
): number | undefined | "invalid" => {
  const normalized = normalizeWeightInput(raw);
  if (normalized === "invalid") return "invalid";
  if (normalized === "") return undefined;

  if (!FLOAT_PATTERN.test(normalized)) return "invalid";

  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed)) return "invalid";
  if (parsed < 0) return "invalid";
  return parsed;
};

export const fromDraftWeek = (
  base: WeekEntry,
  draft: DraftWeek
): WeekEntry | null => {
  const avgStepsPerDay = parseOptionalNonNegativeInt(draft.avgStepsPerDay);
  if (avgStepsPerDay === "invalid") return null;

  const nextDays: WeekEntry["days"] = { ...base.days };

  for (const dayId of DAY_IDS) {
    const weightKg = parseOptionalNonNegativeFloatWeight(
      draft.days[dayId].weightKg
    );
    const calories = parseOptionalNonNegativeInt(draft.days[dayId].calories);
    const proteinG = parseOptionalNonNegativeInt(draft.days[dayId].proteinG);

    if (
      weightKg === "invalid" ||
      calories === "invalid" ||
      proteinG === "invalid"
    ) {
      return null;
    }

    nextDays[dayId] = {
      ...nextDays[dayId],
      weightKg,
      calories,
      proteinG,
    };
  }

  return {
    ...base,
    avgStepsPerDay,
    days: nextDays,
  };
};

export function useWeekEditor(args: {
  base: WeekEntry;
  isOpen: boolean;
  onSaveWeek: (updatedWeek: WeekEntry) => void;
}) {
  const { base, isOpen, onSaveWeek } = args;

  const [isEditing, setIsEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<DraftWeek>(() => toDraftWeek(base));
  const [hasValidationError, setHasValidationError] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setHasValidationError(false);
    }
  }, [isOpen]);

  const startEdit = React.useCallback(() => {
    setDraft(toDraftWeek(base));
    setHasValidationError(false);
    setIsEditing(true);
  }, [base]);

  const cancelEdit = React.useCallback(() => {
    setHasValidationError(false);
    setIsEditing(false);
  }, []);

  const saveEdit = React.useCallback(() => {
    const updatedWeek = fromDraftWeek(base, draft);
    if (!updatedWeek) {
      setHasValidationError(true);
      return;
    }
    onSaveWeek(updatedWeek);
    setHasValidationError(false);
    setIsEditing(false);
  }, [base, draft, onSaveWeek]);

  const setAvgStepsDraft = React.useCallback((value: string) => {
    setDraft((prev) => ({ ...prev, avgStepsPerDay: value }));
  }, []);

  const updateDayDraft = React.useCallback(
    (args2: { dayId: DayId; field: keyof DraftDayEntry; value: string }) => {
      setDraft((prev) => ({
        ...prev,
        days: {
          ...prev.days,
          [args2.dayId]: {
            ...prev.days[args2.dayId],
            [args2.field]: args2.value,
          },
        },
      }));
    },
    []
  );

  return {
    isEditing,
    draft,
    hasValidationError,
    startEdit,
    cancelEdit,
    saveEdit,
    setAvgStepsDraft,
    updateDayDraft,
  };
}
