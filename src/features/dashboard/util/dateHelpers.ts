export const convertDateToISO = (d: Date): string => {
  const date = createNewDateAtMidday(d);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

export const mondayOfWeek = (d: Date): string => {
  const date = createNewDateAtMidday(d);

  // JS: Sun=0..Sat=6, we want Mon=0..Sun=6
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);

  return convertDateToISO(date);
};

export const addDaysToISODate = (isoDate: string, days: number): string => {
  const date = createNewIsoDateAtMidday(isoDate);
  date.setDate(date.getDate() + days);

  return convertDateToISO(date);
};

export const getMondayOfWeek = (inputDate: string): string => {
  const date = createNewIsoDateAtMidday(inputDate);

  return mondayOfWeek(date);
};

export const findNextUntrackedWeek = (args: {
  startWeekOf: string;
  existingWeekOfs: Set<string>;
}) => {
  let candidate = args.startWeekOf;
  while (args.existingWeekOfs.has(candidate)) {
    candidate = addDaysToISODate(candidate, 7);
  }
  return candidate;
};

function createNewDateAtMidday(d: Date) {
  const date = new Date(d);
  date.setHours(12, 0, 0, 0);
  return date;
}

function createNewIsoDateAtMidday(isoDate: string) {
  return new Date(`${isoDate}T12:00:00`);
}
