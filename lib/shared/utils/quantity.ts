export function sanitizeQuantityInput(value: string) {
  return value.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");
}

export function readQuantityInput(value: string) {
  const sanitized = sanitizeQuantityInput(value);
  if (!sanitized) {
    return null;
  }

  const quantity = Number(sanitized);
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    return null;
  }

  return quantity;
}

export function clampQuantity(value: number, max?: number | null) {
  const quantity = Math.max(1, Math.floor(value));
  if (max === null || max === undefined) {
    return quantity;
  }

  return Math.min(Math.max(1, Math.floor(max)), quantity);
}
