import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./data/db.js";
import { CAREER_DB } from "../src/data/careers.js";
import { generateCareerSeries, generateIndustrySeries } from "../src/engine/careerTrend.js";
import { generateCompanySeries } from "../src/engine/companyTrend.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4173;
const distPath = path.resolve(__dirname, "../dist");

app.use(express.static(distPath));

app.get("/api/careers", (_req, res) => {
  res.json({ count: CAREER_DB.length, careers: CAREER_DB });
});

app.get("/api/career/:name", (req, res) => {
  const name = decodeURIComponent(req.params.name || "");
  const rows = db.prepare(`
    select date, hiring_index, salary_median, samples
    from career_daily
    where career_name = ?
    order by date asc
  `).all(name);

  if (rows.length > 0) {
    res.json({ source: "daily", series: rows });
    return;
  }
  const simulated = generateCareerSeries(name);
  res.json({ source: "simulated", series: simulated });
});

app.get("/api/company/:name", (req, res) => {
  const name = decodeURIComponent(req.params.name || "");
  const rows = db.prepare(`
    select date, hiring_index, tech_ratio, ai_job_ratio, source
    from company_daily
    where company = ?
    order by date asc
  `).all(name);
  if (rows.length > 0) {
    res.json({ source: "daily", series: rows });
    return;
  }
  const simulated = generateCompanySeries(name);
  res.json({ source: "simulated", series: simulated });
});

app.get("/api/industry/:name", (req, res) => {
  const name = decodeURIComponent(req.params.name || "");
  const rows = db.prepare(`
    select date, industry_index, source
    from industry_daily
    where industry = ?
    order by date asc
  `).all(name);
  if (rows.length > 0) {
    res.json({ source: "daily", series: rows });
    return;
  }
  const simulated = generateIndustrySeries(name || "科技互联网");
  res.json({ source: "simulated", series: simulated });
});

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Career K-Line running at http://localhost:${port}`);
});
