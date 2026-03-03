import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourcePath = path.resolve(__dirname, "./sources.json");

function loadSources() {
  if (!fs.existsSync(sourcePath)) {
    return { rss: [], json: [] };
  }
  const raw = fs.readFileSync(sourcePath, "utf-8");
  return JSON.parse(raw);
}

const { rss = [], json = [], html = [], company_html = [] } = loadSources();

const RSS_SOURCES = rss.filter((item) => item.enabled !== false);
const JSON_SOURCES = json.filter((item) => item.enabled !== false);
const HTML_SOURCES = html.filter((item) => item.enabled !== false);
const COMPANY_HTML_SOURCES = company_html.filter((item) => item.enabled !== false);

export { RSS_SOURCES, JSON_SOURCES, HTML_SOURCES, COMPANY_HTML_SOURCES };
