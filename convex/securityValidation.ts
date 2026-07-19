const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+()\-.\s\d]{7,30}$/;

export function requiredText(value: string, field: string, maxLength: number): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${field} is required`);
  if (normalized.length > maxLength) throw new Error(`${field} is too long`);
  if (CONTROL_CHARACTERS.test(normalized)) throw new Error(`${field} contains invalid characters`);
  return normalized;
}

export function optionalText(
  value: string | undefined,
  field: string,
  maxLength: number,
): string | undefined {
  if (value === undefined) return undefined;
  const normalized = value.trim();
  if (!normalized) return undefined;
  return requiredText(normalized, field, maxLength);
}

export function validEmail(value: string): string {
  const normalized = requiredText(value, "Email", 254).toLowerCase();
  if (!EMAIL.test(normalized)) throw new Error("Email is invalid");
  return normalized;
}

export function validPhone(value: string | undefined): string | undefined {
  const normalized = optionalText(value, "Phone", 30);
  if (normalized && !PHONE.test(normalized)) throw new Error("Phone is invalid");
  return normalized;
}

export function finiteNumber(
  value: number,
  field: string,
  min: number,
  max: number,
): number {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${field} is outside the allowed range`);
  }
  return value;
}

export function optionalFiniteNumber(
  value: number | undefined,
  field: string,
  min: number,
  max: number,
): number | undefined {
  return value === undefined ? undefined : finiteNumber(value, field, min, max);
}

export function uniqueTextArray(
  values: string[],
  field: string,
  allowed: readonly string[],
  maxItems = 12,
): string[] {
  if (values.length === 0 || values.length > maxItems) {
    throw new Error(`${field} must contain between 1 and ${maxItems} values`);
  }
  const normalized = values.map((value) => requiredText(value, field, 64));
  if (new Set(normalized).size !== normalized.length) throw new Error(`${field} contains duplicates`);
  if (normalized.some((value) => !allowed.includes(value))) throw new Error(`${field} contains an invalid value`);
  return normalized;
}

export const ALLOWED_SECTORS = [
  "services", "manufacturing", "technology", "retail", "construction",
  "wholesale", "healthcare", "hospitality", "food_beverage",
] as const;

export const ALLOWED_GEOGRAPHIES = [
  "montreal", "quebec_city", "laurentides", "eastern_townships",
  "outaouais", "monteregie", "other_quebec", "canada_other",
] as const;
