export const parseNumberParam = (value: string | null) => {
  if (value === null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
};

export const parsePositiveIntParam = (
  value: string | null,
  options: { fallback: number; min: number; max: number },
) => {
  const parsed = Number(value ?? "");
  if (!Number.isFinite(parsed)) return options.fallback;
  const intValue = Math.floor(parsed);
  if (intValue < options.min) return options.min;
  if (intValue > options.max) return options.max;
  return intValue;
};

export const parseJsonObject = (value: unknown): Record<string, unknown> | null => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
};

export const parseRequiredNumber = (
  value: unknown,
  opts: { min: number; max: number },
): number | null => {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return null;
  if (num < opts.min || num > opts.max) return null;
  return num;
};
