import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "../career-kline.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  create table if not exists job_postings (
    id integer primary key autoincrement,
    source text not null,
    title text not null,
    company text,
    location text,
    published_at text,
    url text not null,
    salary_text text,
    raw_json text,
    created_at text default (datetime('now'))
  );

  create unique index if not exists job_postings_source_url
    on job_postings(source, url);

  create table if not exists career_daily (
    date text not null,
    career_name text not null,
    hiring_index real not null,
    salary_median real,
    samples integer not null,
    primary key (date, career_name)
  );

  create table if not exists company_daily (
    date text not null,
    company text not null,
    hiring_index real not null,
    tech_ratio real,
    ai_job_ratio real,
    source text,
    primary key (date, company)
  );

  create table if not exists industry_daily (
    date text not null,
    industry text not null,
    industry_index real not null,
    source text,
    primary key (date, industry)
  );
`);

export { db, dbPath };
