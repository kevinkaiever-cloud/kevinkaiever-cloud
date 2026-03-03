import { fetchWithRetry, resolveTemplates } from "./utils.js";

const DEFAULT_PATTERNS = [
  /totalCount"\s*:\s*(\d+)/i,
  /total\s*[:=]\s*(\d+)/i,
  /jobCount"\s*:\s*(\d+)/i,
  /positionCount"\s*:\s*(\d+)/i,
  /职位数[^0-9]*(\d+)/,
  /岗位数[^0-9]*(\d+)/,
  /共\s*(\d+)\s*个职位/
];

const API_HINTS = [
  /api\/[a-z0-9/_-]+/gi,
  /jobs?\.[a-z0-9/_-]+/gi,
  /graphql/gi,
  /search\?[^"']+/gi
];

function extractCount(text, pattern) {
  if (!pattern) return null;
  const reg = new RegExp(pattern, "i");
  const match = text.match(reg);
  if (!match) return null;
  const count = Number.parseInt(match[1], 10);
  return Number.isNaN(count) ? null : count;
}

function discoverEndpoints(html) {
  const candidates = new Set();
  API_HINTS.forEach((regex) => {
    const matches = html.match(regex) || [];
    matches.forEach((m) => candidates.add(m));
  });
  return Array.from(candidates).slice(0, 6);
}

async function tryEndpoint(url, headers) {
  try {
    const res = await fetchWithRetry(url, { headers }, 2, 800);
    const text = await res.text();
    for (const pattern of DEFAULT_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        const count = Number.parseInt(match[1], 10);
        if (!Number.isNaN(count)) return count;
      }
    }
  } catch (_e) {
    return null;
  }
  return null;
}

export async function fetchCompanyCount(source) {
  const resolved = resolveTemplates(source);
  const res = await fetchWithRetry(
    resolved.url,
    { method: resolved.method || "GET", headers: resolved.headers || {} },
    resolved.retry ?? 3,
    resolved.delayMs ?? 800
  );
  const html = await res.text();
  if (resolved.countRegex) {
    const count = extractCount(html, resolved.countRegex);
    if (count !== null) return count;
  }
  for (const pattern of DEFAULT_PATTERNS) {
    const match = html.match(pattern);
    if (match) {
      const count = Number.parseInt(match[1], 10);
      if (!Number.isNaN(count)) return count;
    }
  }

  // Heuristic: discover possible API endpoints in HTML and try them
  const endpoints = discoverEndpoints(html);
  for (const endpoint of endpoints) {
    const fullUrl = endpoint.startsWith("http")
      ? endpoint
      : `${resolved.baseUrl || new URL(resolved.url).origin}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
    const count = await tryEndpoint(fullUrl, resolved.headers || {});
    if (count !== null) return count;
  }

  return null;
}
