import React from "react";
import {
  addDaysToISODate,
  findNextUntrackedWeek,
  mondayOfWeek,
} from "./util/date/dateHelpers";

type AddWeekSectionProps = {
  existingWeekOfs: Set<string>;
  getTodaysDate: () => Date;
  onAddWeek: (weekOfISO: string) => { ok: true } | { ok: false; error: string };
};

export function AddWeekSection({
  existingWeekOfs,
  getTodaysDate,
  onAddWeek,
}: AddWeekSectionProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedWeekDate, setSelectedWeekDate] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const open = () => {
    const currentWeekOf = mondayOfWeek(getTodaysDate());

    // Fast path: if current week isn't present yet, create it immediately.
    if (!existingWeekOfs.has(currentWeekOf)) {
      const result = onAddWeek(currentWeekOf);
      if (!result.ok) setError(result.error);
      return;
    }

    // Otherwise, open a picker to add a different week.
    const suggested = findNextUntrackedWeek({
      startWeekOf: addDaysToISODate(currentWeekOf, 7),
      existingWeekOfs,
    });

    setSelectedWeekDate(suggested);
    setError(null);
    setIsOpen(true);
  };

  const cancel = () => {
    setIsOpen(false);
    setError(null);
  };

  const create = () => {
    const result = onAddWeek(selectedWeekDate);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setIsOpen(false);
    setError(null);
  };

  return (
    <section aria-label="Add week section">
      <button type="button" onClick={open}>
        Add week
      </button>

      {isOpen && (
        <div data-testid="add-week-form">
          <h2>Add a new week</h2>

          {error && <div role="alert">{error}</div>}

          <label htmlFor="add-week-date">
            Week to add
            <input
              id="add-week-date"
              type="date"
              value={selectedWeekDate}
              onChange={(e) => setSelectedWeekDate(e.target.value)}
            />
          </label>

          <div>
            <button
              type="button"
              onClick={create}
              disabled={selectedWeekDate.trim() === ""}
            >
              Create
            </button>
            <button type="button" onClick={cancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
