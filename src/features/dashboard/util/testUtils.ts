// testUtils.ts
import userEvent from "@testing-library/user-event";
import { screen, within } from "@testing-library/react";
import type { WeekTrendMetrics } from "../../../domain/weekTrend";

export type User = ReturnType<typeof userEvent.setup>;
export type Scope = ReturnType<typeof within>;

export const extractFirstNumber = (text: string) => {
  const numbersInText = text.match(/-?\d+(\.\d+)?/);
  if (!numbersInText) throw new Error(`No number found in: ${text}`);
  return Number(numbersInText[0]);
};

export const weekTitle = (week: Pick<WeekTrendMetrics, "weekOf">) =>
  `Week of ${week.weekOf}`;

export const weekToggleButton = (week: Pick<WeekTrendMetrics, "weekOf">) =>
  screen.getByRole("button", { name: weekTitle(week) });

export const detailsTestIdForWeekId = (weekId: string) =>
  `week-card-${weekId}-details`;

export const weekDetails = (week: Pick<WeekTrendMetrics, "id">) =>
  screen.getByTestId(`week-card-${week.id}-details`);

export const queryWeekDetails = (week: Pick<WeekTrendMetrics, "id">) =>
  screen.queryByTestId(`week-card-${week.id}-details`);

export const openWeek = async (user: User, week: WeekTrendMetrics) => {
  await user.click(weekToggleButton(week));
  return within(weekDetails(week));
};

export const textOf = (scope: Scope, label: RegExp) =>
  scope.getByText(label).textContent ?? "";

export const numberOf = (scope: Scope, label: RegExp) =>
  extractFirstNumber(textOf(scope, label));

type DraftNumberFieldArgs = {
  user: User;
  scope: Scope;
  editButtonName: string | RegExp;
  inputName: string | RegExp;
  value: string;
};

export const setDraftNumberField = async ({
  user,
  scope,
  editButtonName,
  inputName,
  value,
}: DraftNumberFieldArgs) => {
  await user.click(scope.getByRole("button", { name: editButtonName }));

  const input = scope.getByRole("spinbutton", { name: inputName });
  await user.clear(input);

  // If value is "", leave the input empty (used for "save undefined" cases)
  if (value !== "") {
    await user.type(input, value);
  }
};

export const saveEdit = async (
  user: User,
  scope: Scope,
  saveButtonName: string | RegExp
) => {
  await user.click(scope.getByRole("button", { name: saveButtonName }));
};

export const cancelEdit = async (
  user: User,
  scope: Scope,
  cancelButtonName: string | RegExp = /^cancel$/i
) => {
  await user.click(scope.getByRole("button", { name: cancelButtonName }));
};
