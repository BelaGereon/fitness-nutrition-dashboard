export const formatData = (
  value: number | undefined,
  {
    decimals,
    unit,
    space = true,
  }: { decimals: number; unit?: string; space?: boolean },
) => {
  if (value === undefined || Number.isNaN(value)) return "n/a";
  if (!unit) return value.toFixed(decimals);
  return `${value.toFixed(decimals)}${space ? " " : ""}${unit}`;
};

export const normalizeWeightInput = (raw: string): string | "invalid" => {
  const trimmed = raw.trim();
  if (trimmed === "") return "";
  if (trimmed.includes(",") && trimmed.includes(".")) return "invalid";

  return trimmed.replace(",", ".");
};

const INT_PATTERN = /^\d+$/;
const FLOAT_PATTERN = /^\d+(\.\d+)?$/;

export const parseOptionalNonNegativeInt = (
  raw: string,
): number | undefined | "invalid" => {
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  if (!INT_PATTERN.test(trimmed)) return "invalid";

  const parsed = Number.parseInt(trimmed, 10);
  if (Number.isNaN(parsed)) return "invalid";
  if (parsed < 0) return "invalid";
  return parsed;
};

export const parseOptionalNonNegativeFloatWeight = (
  raw: string,
): number | undefined | "invalid" => {
  const normalized = normalizeWeightInput(raw);
  if (normalized === "invalid") return "invalid";
  if (normalized === "") return undefined;

  if (!FLOAT_PATTERN.test(normalized)) return "invalid";

  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed)) return "invalid";
  if (parsed < 0) return "invalid";
  return parsed;
};

export const parseOptionalText = (raw: string): string | undefined => {
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  return raw; // keep original (don’t destroy line breaks/spacing)
};

export const parseOptionalNonNegativeFloat = (
  raw: string,
): number | undefined | "invalid" => {
  const normalized = normalizeWeightInput(raw);
  if (normalized === "invalid") return "invalid";
  if (normalized === "") return undefined;

  if (!FLOAT_PATTERN.test(normalized)) return "invalid";

  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed)) return "invalid";
  if (parsed < 0) return "invalid";
  return parsed;
};
