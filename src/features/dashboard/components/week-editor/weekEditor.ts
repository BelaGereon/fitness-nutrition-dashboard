import { DAY_IDS, type DayId, type WeekEntry } from "../../../../domain/week";
import {
  parseOptionalNonNegativeFloat,
  parseOptionalNonNegativeFloatWeight,
  parseOptionalNonNegativeInt,
  parseOptionalText,
} from "../../util/format";

export type DraftDayEntry = {
  weightKg: string;
  calories: string;
  proteinG: string;
};

export type DraftDays = Record<DayId, DraftDayEntry>;

export type DraftWeek = {
  avgStepsPerDay: string;
  trainingSessionsDescription: string;
  totalSets: string;
  totalVolumeKg: string;
  notes: string;
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
    trainingSessionsDescription: base.trainingSessionsDescription ?? "",
    totalSets: base.totalSets?.toString() ?? "",
    totalVolumeKg: base.totalVolumeKg?.toString() ?? "",
    notes: base.notes ?? "",
    days: draftDays,
  };
};

export const fromDraftWeek = (
  base: WeekEntry,
  draft: DraftWeek,
): WeekEntry | null => {
  const avgStepsPerDay = parseOptionalNonNegativeInt(draft.avgStepsPerDay);
  if (avgStepsPerDay === "invalid") return null;

  const totalSets = parseOptionalNonNegativeInt(draft.totalSets);
  if (totalSets === "invalid") return null;

  const totalVolumeKg = parseOptionalNonNegativeFloat(draft.totalVolumeKg);
  if (totalVolumeKg === "invalid") return null;

  const trainingSessionsDescription = parseOptionalText(
    draft.trainingSessionsDescription,
  );
  const notes = parseOptionalText(draft.notes);

  const nextDays: WeekEntry["days"] = { ...base.days };

  for (const dayId of DAY_IDS) {
    const weightKg = parseOptionalNonNegativeFloatWeight(
      draft.days[dayId].weightKg,
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
    trainingSessionsDescription,
    totalSets,
    totalVolumeKg,
    notes,
    days: nextDays,
  };
};
