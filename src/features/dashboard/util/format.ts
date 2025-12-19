export const formatData = (
  value: number | undefined,
  {
    decimals,
    unit,
    space = true,
  }: { decimals: number; unit?: string; space?: boolean }
) => {
  if (value === undefined || Number.isNaN(value)) return "n/a";
  if (!unit) return value.toFixed(decimals);
  return `${value.toFixed(decimals)}${space ? " " : ""}${unit}`;
};
