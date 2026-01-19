type AddWeekSectionProps = {
  isOpen: boolean;
  selectedWeekDate: string;
  error: string | null;
  onOpen: () => void;
  onDateChange: (value: string) => void;
  onCreate: () => void;
  onCancel: () => void;
};

export function AddWeekSection({
  isOpen,
  selectedWeekDate,
  error,
  onOpen,
  onDateChange,
  onCreate,
  onCancel,
}: AddWeekSectionProps) {
  return (
    <section aria-label="Add week section">
      <button type="button" onClick={onOpen}>
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
              onChange={(e) => onDateChange(e.target.value)}
            />
          </label>

          <div>
            <button
              type="button"
              onClick={onCreate}
              disabled={selectedWeekDate.trim() === ""}
            >
              Create
            </button>
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
