import type { DayEntry, DayId } from "../../domain/week";
import { DAY_IDS } from "../../domain/week";
import { formatData } from "./util/format";

type DraftDayEntry = {
  weightKg: string;
  calories: string;
  proteinG: string;
};

export type DraftDays = Record<DayId, DraftDayEntry>;

type WeekEntryGridProps = {
  days: Record<DayId, DayEntry>;
  isEditing: boolean;
  draftDays: DraftDays;
  onChangeDay: (args: {
    dayId: DayId;
    field: keyof DraftDayEntry;
    value: string;
  }) => void;
};

const dayLabel: Record<DayId, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export function WeekEntryGrid({
  days,
  isEditing,
  draftDays,
  onChangeDay,
}: WeekEntryGridProps) {
  return (
    <table>
      <thead>
        <tr>
          <th scope="col">&nbsp;</th>
          {DAY_IDS.map((dayId) => (
            <th key={dayId} scope="col">
              {dayLabel[dayId]}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        <tr>
          <th scope="row">Weight (kg)</th>
          {DAY_IDS.map((dayId) => (
            <td key={dayId}>
              {!isEditing ? (
                <span data-testid={`cell-${dayId}-weight`}>
                  {formatData(days[dayId].weightKg, { decimals: 1 })}
                </span>
              ) : (
                <input
                  aria-label={`${dayLabel[dayId]} weight`}
                  type="number"
                  step="0.1"
                  value={draftDays[dayId].weightKg}
                  onChange={(e) =>
                    onChangeDay({
                      dayId,
                      field: "weightKg",
                      value: e.target.value,
                    })
                  }
                />
              )}
            </td>
          ))}
        </tr>

        <tr>
          <th scope="row">Calories</th>
          {DAY_IDS.map((dayId) => (
            <td key={dayId}>
              {!isEditing ? (
                <span data-testid={`cell-${dayId}-calories`}>
                  {formatData(days[dayId].calories, { decimals: 0 })}
                </span>
              ) : (
                <input
                  aria-label={`${dayLabel[dayId]} calories`}
                  type="number"
                  step="1"
                  value={draftDays[dayId].calories}
                  onChange={(e) =>
                    onChangeDay({
                      dayId,
                      field: "calories",
                      value: e.target.value,
                    })
                  }
                />
              )}
            </td>
          ))}
        </tr>

        <tr>
          <th scope="row">Protein (g)</th>
          {DAY_IDS.map((dayId) => (
            <td key={dayId}>
              {!isEditing ? (
                <span data-testid={`cell-${dayId}-protein`}>
                  {formatData(days[dayId].proteinG, { decimals: 0 })}
                </span>
              ) : (
                <input
                  aria-label={`${dayLabel[dayId]} protein`}
                  type="number"
                  step="1"
                  value={draftDays[dayId].proteinG}
                  onChange={(e) =>
                    onChangeDay({
                      dayId,
                      field: "proteinG",
                      value: e.target.value,
                    })
                  }
                />
              )}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
