import dotenv from "dotenv";
import { db } from "../data/db.js";
import { RSS_SOURCES, JSON_SOURCES, HTML_SOURCES, COMPANY_HTML_SOURCES } from "../sources.js";
import { fetchRssJobs } from "./rss.js";
import { fetchJsonSource } from "./json.js";
import { fetchHtmlJobs } from "./html.js";
import { fetchCompanyCount } from "./companySample.js";
import { sleep } from "./utils.js";
import { dailyAggregate } from "./aggregate.js";

dotenv.config();

function insertJobs(jobs) {
  const stmt = db.prepare(`
    insert or ignore into job_postings
    (source, title, company, location, published_at, url, salary_text, raw_json)
    values (@source, @title, @company, @location, @published_at, @url, @salary_text, @raw_json)
  `);
  const insertMany = db.transaction((rows) => {
    rows.forEach((row) => stmt.run(row));
  });
  insertMany(jobs);
}

function insertCompanyDaily(rows) {
  const stmt = db.prepare(`
    insert or replace into company_daily
    (date, company, hiring_index, tech_ratio, ai_job_ratio, source)
    values (@date, @company, @hiring_index, @tech_ratio, @ai_job_ratio, @source)
  `);
  const trx = db.transaction((payload) => {
    payload.forEach((row) => stmt.run(row));
  });
  trx(rows);
}

function insertIndustryDaily(rows) {
  const stmt = db.prepare(`
    insert or replace into industry_daily
    (date, industry, industry_index, source)
    values (@date, @industry, @industry_index, @source)
  `);
  const trx = db.transaction((payload) => {
    payload.forEach((row) => stmt.run(row));
  });
  trx(rows);
}

async function ingestJsonSources() {
  if (!JSON_SOURCES.length) return;
  for (const source of JSON_SOURCES) {
    const rows = await fetchJsonSource(source);
    if (source.type === "jobs") {
      const payload = rows.map((row) => ({
        source: source.name,
        title: row.title || "",
        company: row.company || "",
        location: row.location || "",
        published_at: row.published_at || "",
        url: row.url || `${source.name}-${row.title}-${row.published_at}`,
        salary_text: row.salary_text || "",
        raw_json: JSON.stringify(row)
      }));
      insertJobs(payload);
    }
    if (source.type === "company") {
      const payload = rows.map((row) => ({
        date: row.date,
        company: row.company,
        hiring_index: row.hiring_index,
        tech_ratio: row.tech_ratio ?? null,
        ai_job_ratio: row.ai_job_ratio ?? null,
        source: source.name
      }));
      insertCompanyDaily(payload);
    }
    if (source.type === "industry") {
      const payload = rows.map((row) => ({
        date: row.date,
        industry: row.industry,
        industry_index: row.industry_index,
        source: source.name
      }));
      insertIndustryDaily(payload);
    }
    await sleep(source.delayMs ?? 800);
  }
}

export async function runIngest() {
  const allJobs = [];
  for (const source of RSS_SOURCES) {
    try {
      const jobs = await fetchRssJobs(source);
      allJobs.push(...jobs);
    } catch (error) {
      console.warn(`RSS source failed: ${source.name}`, error.message || error);
    }
    await sleep(source.delayMs ?? 800);
  }
  for (const source of HTML_SOURCES) {
    try {
      const jobs = await fetchHtmlJobs(source);
      allJobs.push(...jobs);
    } catch (error) {
      console.warn(`HTML source failed: ${source.name}`, error.message || error);
    }
    await sleep(source.delayMs ?? 1200);
  }
  if (allJobs.length) insertJobs(allJobs);
  try {
    await ingestJsonSources();
  } catch (error) {
    console.warn("JSON sources failed.", error.message || error);
  }

  // Company official sites: sample counts to build company_daily
  if (COMPANY_HTML_SOURCES.length) {
    const today = new Date().toISOString().slice(0, 10);
    const counts = [];
    for (const source of COMPANY_HTML_SOURCES) {
      try {
        const count = await fetchCompanyCount(source);
        if (count !== null) counts.push({ company: source.name, count });
      } catch (error) {
        console.warn(`Company source failed: ${source.name}`, error.message || error);
      }
      await sleep(source.delayMs ?? 1200);
    }
    if (counts.length) {
      const max = Math.max(...counts.map((c) => c.count));
      const payload = counts.map((item) => ({
        date: today,
        company: item.company,
        hiring_index: +((item.count / max) * 100).toFixed(1),
        tech_ratio: null,
        ai_job_ratio: null,
        source: "company_sample"
      }));
      insertCompanyDaily(payload);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  dailyAggregate(today);
}

if (process.argv.includes("--run")) {
  runIngest().then(() => {
    console.log("Ingest completed.");
  });
}
