import { fetchWithRetry, getByPath, normalizeArray, resolveTemplates } from "./utils.js";

function mapItem(item, fields) {
  const mapped = {};
  Object.entries(fields).forEach(([key, path]) => {
    mapped[key] = getByPath(item, path);
  });
  return mapped;
}

export async function fetchJsonSource(source) {
  const resolved = resolveTemplates(source);
  const res = await fetchWithRetry(
    resolved.url,
    {
      method: resolved.method || "GET",
      headers: resolved.headers || {},
      body: resolved.body ? JSON.stringify(resolved.body) : undefined
    },
    resolved.retry ?? 3,
    resolved.delayMs ?? 800
  );
  const json = await res.json();
  const items = normalizeArray(getByPath(json, resolved.path));
  return items.map((item) => mapItem(item, resolved.fields || {}));
}
