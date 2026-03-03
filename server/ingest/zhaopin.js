import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../data/db.js";
import { dailyAggregate } from "./aggregate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getArgValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return "";
  return process.argv[idx + 1] || "";
}

function toDateString(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return "";
}

function buildLocation(city, district) {
  const parts = [city, district].filter((item) => item && String(item).trim());
  return parts.join("·");
}

function normalizeSalary(item) {
  const numeric = item.salary_avg ?? item.salary_min ?? item.salary_max ?? "";
  if (numeric !== "" && numeric !== null && numeric !== undefined) {
    return String(numeric);
  }
  return String(item.salary_raw || "");
}

function loadItems(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error("zhaopin json should be an array");
  }
  return data;
}

function resolvePath(inputPath) {
  if (!inputPath) return "";
  if (path.isAbsolute(inputPath)) return inputPath;
  return path.resolve(__dirname, inputPath);
}

function insertZhaopin(rows, createdAt) {
  const stmt = db.prepare(`
    insert or ignore into job_postings
    (source, title, company, location, published_at, url, salary_text, raw_json, created_at)
    values (@source, @title, @company, @location, @published_at, @url, @salary_text, @raw_json, @created_at)
  `);

  const trx = db.transaction((payload) => {
    payload.forEach((row) => stmt.run(row));
  });

  trx(rows);
}

function run() {
  const source = "zhaopin-scraper";
  const inputPath = resolvePath(
    getArgValue("--path") || process.env.ZHAOPIN_DATA_PATH || ""
  );
  if (!inputPath) {
    throw new Error("missing --path or ZHAOPIN_DATA_PATH");
  }

  const dateArg = toDateString(getArgValue("--date"));
  const date = dateArg || new Date().toISOString().slice(0, 10);
  const createdAt = `${date} 00:00:00`;

  const items = loadItems(inputPath);

  const payload = items
    .map((item, index) => {
      const title = String(item.job_name || item.title || "").trim();
      if (!title) return null;
      const company = String(item.company_name || item.company || "").trim();
      const location = buildLocation(item.city, item.district);
      const url = String(item.job_url || item.url || "").trim()
        || `${source}-${index}-${Date.now()}`;
      const publishedAt = String(item.publish_date || item.published_at || item.update_time || "").trim();
      return {
        source,
        title,
        company,
        location,
        published_at: publishedAt,
        url,
        salary_text: normalizeSalary(item),
        raw_json: JSON.stringify(item),
        created_at: createdAt
      };
    })
    .filter(Boolean);

  const before = db.prepare("select count(*) as count from job_postings where source = ?").get(source).count;
  insertZhaopin(payload, createdAt);
  const after = db.prepare("select count(*) as count from job_postings where source = ?").get(source).count;

  dailyAggregate(date);

  // eslint-disable-next-line no-console
  console.log(`zhaopin ingest ok. total=${after}, inserted=${after - before}, date=${date}`);
}

if (process.argv.includes("--run")) {
  run();
}

export { run };
