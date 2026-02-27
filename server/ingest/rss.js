import { XMLParser } from "fast-xml-parser";
import { fetchWithRetry, normalizeArray, resolveTemplates } from "./utils.js";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

function guessCompany(title) {
  if (!title) return "";
  const parts = title.split(/[-–|@]/).map((p) => p.trim());
  if (parts.length >= 2) return parts[0].slice(0, 50);
  return "";
}

export async function fetchRssJobs(source) {
  const resolved = resolveTemplates(source);
  const res = await fetchWithRetry(
    resolved.url,
    { headers: { "User-Agent": "CareerKLineBot/1.0" } },
    resolved.retry ?? 3,
    resolved.delayMs ?? 800
  );
  const xml = await res.text();
  const json = parser.parse(xml);
  const channel = json.rss?.channel || json.feed;
  const items = normalizeArray(channel?.item || channel?.entry);

  return items.map((item) => {
    const title = item.title?.["#text"] || item.title || "";
    const link = item.link?.["@_href"] || item.link || "";
    const pubDate = item.pubDate || item.published || item.updated || "";
    return {
      source: source.name,
      title,
      company: item.author?.name || guessCompany(title),
      location: "",
      published_at: pubDate,
      url: link,
      salary_text: "",
      raw_json: JSON.stringify(item)
    };
  });
}
