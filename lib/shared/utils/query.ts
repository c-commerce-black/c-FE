export function buildQueryString(
  values: Record<string, string | number | boolean | undefined | null>,
) {
  const searchParams = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
