import { describe, expect, it } from "vitest";
import type { WeekEntry } from "../../domain/week";
import { fromDraftWeek, toDraftWeek } from "./weekEditor";

const baseWeek = (): WeekEntry => ({
  id: "w1",
  weekOf: "2025-12-01",
  avgStepsPerDay: 9000,
  trainingSessionsDescription: "2x Full Body",
  totalSets: 40,
  totalVolumeKg: 1234.5,
  notes: "some notes",
  otherNotes: "other notes",
  days: {
    mon: { weightKg: 78.5, calories: 2800, proteinG: 150 },
    tue: { weightKg: 78.2, calories: 2700, proteinG: 160 },
    wed: {},
    thu: { calories: 2600 },
    fri: { proteinG: 140 },
    sat: { weightKg: 78.8 },
    sun: {},
  },
});

describe("weekEditor", () => {
  describe("toDraftWeek", () => {
    it("maps avgStepsPerDay to a string", () => {
      const draft = toDraftWeek(baseWeek());
      expect(draft.avgStepsPerDay).toBe("9000");
    });

    it("maps missing avgStepsPerDay to empty string", () => {
      const base = baseWeek();
      base.avgStepsPerDay = undefined;
      const draft = toDraftWeek(base);
      expect(draft.avgStepsPerDay).toBe("");
    });

    it("maps a full day (mon) values to strings", () => {
      const draft = toDraftWeek(baseWeek());
      expect(draft.days.mon).toEqual({
        weightKg: "78.5",
        calories: "2800",
        proteinG: "150",
      });
    });

    it("maps missing day values to empty strings", () => {
      const draft = toDraftWeek(baseWeek());
      expect(draft.days.wed).toEqual({
        weightKg: "",
        calories: "",
        proteinG: "",
      });
    });

    it("maps partial day values correctly", () => {
      const draft = toDraftWeek(baseWeek());

      expect(draft.days.thu).toEqual({
        weightKg: "",
        calories: "2600",
        proteinG: "",
      });

      expect(draft.days.fri).toEqual({
        weightKg: "",
        calories: "",
        proteinG: "140",
      });
    });
  });

  describe("fromDraftWeek", () => {
    it("preserves base fields when parsing succeeds", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);

      const updated = fromDraftWeek(base, draft);
      expect(updated).not.toBeNull();
      if (!updated) throw new Error("expected updated week");

      expect(updated.id).toBe(base.id);
      expect(updated.weekOf).toBe(base.weekOf);
      expect(updated.trainingSessionsDescription).toBe(
        base.trainingSessionsDescription
      );
      expect(updated.totalSets).toBe(base.totalSets);
      expect(updated.totalVolumeKg).toBe(base.totalVolumeKg);
      expect(updated.notes).toBe(base.notes);
      expect(updated.otherNotes).toBe(base.otherNotes);
    });

    it("parses valid avgStepsPerDay (int)", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);
      draft.avgStepsPerDay = "10000";

      const updated = fromDraftWeek(base, draft);
      expect(updated?.avgStepsPerDay).toBe(10000);
    });

    it("returns null when avgStepsPerDay is invalid", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);
      draft.avgStepsPerDay = "nine thousand";

      expect(fromDraftWeek(base, draft)).toBeNull();
    });

    it("treats avgStepsPerDay empty/whitespace as undefined", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);
      draft.avgStepsPerDay = "   ";

      const updated = fromDraftWeek(base, draft);
      expect(updated?.avgStepsPerDay).toBeUndefined();
    });

    it("returns null when weightKg is invalid", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);
      draft.days.mon.weightKg = "nope";

      expect(fromDraftWeek(base, draft)).toBeNull();
    });

    it("returns null when calories is invalid", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);
      draft.days.tue.calories = "12k";

      expect(fromDraftWeek(base, draft)).toBeNull();
    });

    it("returns null when proteinG is invalid", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);
      draft.days.tue.proteinG = "150g";

      expect(fromDraftWeek(base, draft)).toBeNull();
    });

    it("treats empty/whitespace day fields as undefined", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);

      draft.days.mon.weightKg = "";
      draft.days.tue.calories = " ";
      draft.days.mon.proteinG = "   ";

      const updated = fromDraftWeek(base, draft);
      expect(updated).not.toBeNull();
      if (!updated) throw new Error("expected updated week");

      expect(updated.days.mon.weightKg).toBeUndefined();
      expect(updated.days.tue.calories).toBeUndefined();
      expect(updated.days.mon.proteinG).toBeUndefined();
    });

    it("rejects decimals for avgStepsPerDay", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);
      draft.avgStepsPerDay = "10000.9";

      expect(fromDraftWeek(base, draft)).toBeNull();
    });

    it("rejects decimals for calories", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);
      draft.days.mon.calories = "2800.9";

      expect(fromDraftWeek(base, draft)).toBeNull();
    });

    it("rejects decimals for proteinG", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);
      draft.days.mon.proteinG = "150.9";

      expect(fromDraftWeek(base, draft)).toBeNull();
    });

    it("accepts decimal comma for weightKg", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);
      draft.days.mon.weightKg = "80,25";

      const updated = fromDraftWeek(base, draft);
      expect(updated?.days.mon.weightKg).toBe(80.25);
    });

    it("rejects negative avgStepsPerDay", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);
      draft.avgStepsPerDay = "-1";

      expect(fromDraftWeek(base, draft)).toBeNull();
    });

    it("rejects negative weightKg", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);
      draft.days.mon.weightKg = "-78.5";

      expect(fromDraftWeek(base, draft)).toBeNull();
    });

    it("parses a day edit correctly (mon weight, tue calories, fri protein)", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);

      draft.days.mon.weightKg = "80.0";
      draft.days.tue.calories = "3000";
      draft.days.fri.proteinG = "155";

      const updated = fromDraftWeek(base, draft);
      expect(updated).not.toBeNull();
      if (!updated) throw new Error("expected updated week");

      expect(updated.days.mon.weightKg).toBe(80.0);
      expect(updated.days.tue.calories).toBe(3000);
      expect(updated.days.fri.proteinG).toBe(155);
    });
  });
});
