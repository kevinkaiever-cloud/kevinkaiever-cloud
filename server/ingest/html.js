import { load } from "cheerio";
import { fetchWithRetry, normalizeArray, resolveTemplates } from "./utils.js";

function pickText($item, selector) {
  if (!selector) return "";
  const selectors = Array.isArray(selector) ? selector : [selector];
  for (const sel of selectors) {
    if (!sel) continue;
    if (sel.includes("::attr(")) {
      const [pureSel, attr] = sel.split("::attr(");
      const attrName = attr.replace(")", "");
      const val = $item.find(pureSel).attr(attrName) || "";
      if (val) return val.trim();
      continue;
    }
    const text = $item.find(sel).text().trim();
    if (text) return text;
  }
  return "";
}

export async function fetchHtmlJobs(source) {
  const resolved = resolveTemplates(source);
  const res = await fetchWithRetry(
    resolved.url,
    { method: resolved.method || "GET", headers: resolved.headers || {} },
    resolved.retry ?? 3,
    resolved.delayMs ?? 800
  );
  const html = await res.text();
  const $ = load(html);
  const selectors = Array.isArray(resolved.listSelector) ? resolved.listSelector : [resolved.listSelector];
  const nodes = selectors.flatMap((sel) => normalizeArray($(sel).toArray()));
  return nodes.map((node) => {
    const $item = $(node);
    const rawUrl = pickText($item, resolved.fields?.url);
    const url = rawUrl && rawUrl.startsWith("http")
      ? rawUrl
      : rawUrl
        ? `${resolved.baseUrl || ""}${rawUrl}`
        : "";
    return {
      source: resolved.name,
      title: pickText($item, resolved.fields?.title),
      company: pickText($item, resolved.fields?.company),
      location: pickText($item, resolved.fields?.location),
      url,
      published_at: pickText($item, resolved.fields?.published_at),
      salary_text: pickText($item, resolved.fields?.salary_text),
      raw_json: ""
    };
  });
}
