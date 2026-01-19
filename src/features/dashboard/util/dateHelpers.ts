export const toISODate = (d: Date): string => {
  const x = new Date(d);
  // Set to midday to avoid DST edges
  x.setHours(12, 0, 0, 0);

  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

export const mondayOfWeek = (d: Date): string => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);

  // JS: Sun=0..Sat=6, we want Mon=0..Sun=6
  const offset = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - offset);

  return toISODate(x);
};

export const addDaysISO = (isoDate: string, days: number): string => {
  // treat isoDate as local date at midday
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
};

export const normalizeWeekOf = (inputDate: string): string => {
  const d = new Date(`${inputDate}T12:00:00`);
  return mondayOfWeek(d);
};

export const firstMissingWeekOf = (args: {
  startWeekOf: string;
  existingWeekOfs: Set<string>;
}) => {
  let candidate = args.startWeekOf;
  while (args.existingWeekOfs.has(candidate)) {
    candidate = addDaysISO(candidate, 7);
  }
  return candidate;
};
