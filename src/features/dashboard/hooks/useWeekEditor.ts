import React from "react";
import type { WeekEntry, DayId } from "../../../domain/week";
import {
  type DraftWeek,
  toDraftWeek,
  fromDraftWeek,
  type DraftDayEntry,
} from "../components/week-editor/weekEditor";

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
    [],
  );

  const setTrainingSessionsDescriptionDraft = React.useCallback(
    (value: string) => {
      setDraft((prev) => ({ ...prev, trainingSessionsDescription: value }));
    },
    [],
  );

  const setTotalSetsDraft = React.useCallback((value: string) => {
    setDraft((prev) => ({ ...prev, totalSets: value }));
  }, []);

  const setTotalVolumeKgDraft = React.useCallback((value: string) => {
    setDraft((prev) => ({ ...prev, totalVolumeKg: value }));
  }, []);

  const setNotesDraft = React.useCallback((value: string) => {
    setDraft((prev) => ({ ...prev, notes: value }));
  }, []);

  return {
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
  };
}
