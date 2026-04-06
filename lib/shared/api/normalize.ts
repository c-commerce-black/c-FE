export type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

export function readRecord(value: unknown): UnknownRecord | null {
  return isRecord(value) ? value : null;
}

export function readArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function pickFirstValue(
  source: UnknownRecord | null | undefined,
  keys: string[],
): unknown {
  if (!source) return undefined;

  for (const key of keys) {
    if (key in source) {
      const value = source[key];
      if (value !== undefined && value !== null) {
        return value;
      }
    }
  }

  return undefined;
}

export function readString(
  source: UnknownRecord | null | undefined,
  keys: string[],
  fallback = "",
): string {
  const value = pickFirstValue(source, keys);
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

export function readNullableString(
  source: UnknownRecord | null | undefined,
  keys: string[],
): string | null {
  const value = pickFirstValue(source, keys);
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return null;
}

export function readNumber(
  source: UnknownRecord | null | undefined,
  keys: string[],
  fallback = 0,
): number {
  const value = pickFirstValue(source, keys);
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.replace(/[^\d.-]/g, "");
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

export function readBoolean(
  source: UnknownRecord | null | undefined,
  keys: string[],
  fallback = false,
): boolean {
  const value = pickFirstValue(source, keys);
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "y") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "n") {
      return false;
    }
  }

  return fallback;
}

export function readTimestamp(
  source: UnknownRecord | null | undefined,
  keys: string[],
  fallback = Date.now(),
): number {
  const value = pickFirstValue(source, keys);
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return numeric;
    }

    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}
