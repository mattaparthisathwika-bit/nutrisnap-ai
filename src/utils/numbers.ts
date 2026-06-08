export function parsePositiveInt(raw: string, label: string): number {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") {
    throw new Error(`${label} is required.`);
  }
  const value = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive number.`);
  }
  return value;
}

export function toInputNumber(value: number | null | undefined, fallback: number): string {
  if (value == null || Number.isNaN(value)) return String(fallback);
  return String(value);
}
