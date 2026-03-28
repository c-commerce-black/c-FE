export function serializeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
