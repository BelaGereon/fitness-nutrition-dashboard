import { describe, expect, it } from "vitest";
import type { WeekEntry } from "../../domain/week";
import { fromDraftWeek, toDraftWeek } from "./weekEditor";

const baseWeek = (): WeekEntry => ({
  id: "w1",
  weekOf: "2025-12-01",
  avgStepsPerDay: 9000,
  // Anything else your WeekEntry includes will be preserved by spread.
  // We include a couple extra fields so we can assert they're preserved.
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
    it("converts numbers to strings and undefined to empty strings", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);

      expect(draft.avgStepsPerDay).toBe("9000");

      expect(draft.days.mon.weightKg).toBe("78.5");
      expect(draft.days.mon.calories).toBe("2800");
      expect(draft.days.mon.proteinG).toBe("150");

      expect(draft.days.tue.weightKg).toBe("78.2");
      expect(draft.days.tue.calories).toBe("2700");
      expect(draft.days.tue.proteinG).toBe("160");

      // missing day values -> empty string
      expect(draft.days.wed.weightKg).toBe("");
      expect(draft.days.wed.calories).toBe("");
      expect(draft.days.wed.proteinG).toBe("");

      // partial day values map correctly
      expect(draft.days.thu.weightKg).toBe("");
      expect(draft.days.thu.calories).toBe("2600");
      expect(draft.days.thu.proteinG).toBe("");

      expect(draft.days.fri.weightKg).toBe("");
      expect(draft.days.fri.calories).toBe("");
      expect(draft.days.fri.proteinG).toBe("140");
    });
  });

  describe("fromDraftWeek", () => {
    it("parses valid draft values into numbers and preserves other base fields", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);

      // edit some fields
      draft.avgStepsPerDay = "10000";
      draft.days.mon.weightKg = "80.0";
      draft.days.tue.calories = "3000";
      draft.days.fri.proteinG = "155";

      const updated = fromDraftWeek(base, draft);
      expect(updated).not.toBeNull();
      if (!updated) throw new Error("expected updated week");

      // parsed numeric updates
      expect(updated.avgStepsPerDay).toBe(10000);
      expect(updated.days.mon.weightKg).toBe(80.0);
      expect(updated.days.tue.calories).toBe(3000);
      expect(updated.days.fri.proteinG).toBe(155);

      // untouched values still present
      expect(updated.days.mon.calories).toBe(2800);
      expect(updated.days.mon.proteinG).toBe(150);

      // preserved base fields (spread)
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

    it("treats empty strings and whitespace as undefined", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);

      // week-level
      draft.avgStepsPerDay = "   ";

      // day-level
      draft.days.mon.weightKg = "";
      draft.days.tue.calories = " ";
      draft.days.mon.proteinG = "   ";

      const updated = fromDraftWeek(base, draft);
      expect(updated).not.toBeNull();
      if (!updated) throw new Error("expected updated week");

      expect(updated.avgStepsPerDay).toBeUndefined();
      expect(updated.days.mon.weightKg).toBeUndefined();
      expect(updated.days.tue.calories).toBeUndefined();
      expect(updated.days.mon.proteinG).toBeUndefined();
    });

    it("returns null when avgStepsPerDay is invalid", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);

      draft.avgStepsPerDay = "nine thousand";

      expect(fromDraftWeek(base, draft)).toBeNull();
    });

    it("returns null when any day field is invalid (weightKg)", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);

      draft.days.mon.weightKg = "nope";

      expect(fromDraftWeek(base, draft)).toBeNull();
    });

    it("returns null when any day field is invalid (calories/proteinG)", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);

      draft.days.tue.calories = "12k";
      expect(fromDraftWeek(base, draft)).toBeNull();

      draft.days.tue.calories = "2700";
      draft.days.tue.proteinG = "150g";
      expect(fromDraftWeek(base, draft)).toBeNull();
    });

    it("rejects decimals for steps/calories/protein but allows decimal comma for weight", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);

      draft.avgStepsPerDay = "10000.9";
      expect(fromDraftWeek(base, draft)).toBeNull();

      draft.avgStepsPerDay = "10000";
      draft.days.mon.calories = "2800.9";
      expect(fromDraftWeek(base, draft)).toBeNull();

      draft.days.mon.calories = "2800";
      draft.days.mon.proteinG = "150.9";
      expect(fromDraftWeek(base, draft)).toBeNull();

      draft.days.mon.proteinG = "150";
      draft.days.mon.weightKg = "80,25";
      const updated = fromDraftWeek(base, draft);

      expect(updated).not.toBeNull();
      if (!updated) throw new Error("expected updated week");
      expect(updated.days.mon.weightKg).toBe(80.25);
    });

    it("rejects negative numbers", () => {
      const base = baseWeek();
      const draft = toDraftWeek(base);

      draft.avgStepsPerDay = "-1";
      expect(fromDraftWeek(base, draft)).toBeNull();

      draft.avgStepsPerDay = "9000";
      draft.days.mon.weightKg = "-78.5";
      expect(fromDraftWeek(base, draft)).toBeNull();
    });
  });
});
