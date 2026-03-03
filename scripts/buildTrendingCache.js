import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CAREER_DB } from "../src/data/careers.js";
import { generateCareerSeries } from "../src/engine/careerTrend.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.resolve(__dirname, "../src/data/trendingCache.js");

function computeCareerTrend(career) {
  const series = generateCareerSeries(career.career_name);
  const last = series[series.length - 1];
  const prev = series[Math.max(0, series.length - 4)];
  return {
    career_name: career.career_name,
    category: career.category,
    salary: last?.salary_median ?? 0,
    change: (last?.hiring_index ?? 0) - (prev?.hiring_index ?? 0),
  };
}

const trends = CAREER_DB.map(computeCareerTrend);
const trending = trends.slice().sort((a, b) => b.change - a.change).slice(0, 8);
const declining = trends.slice().sort((a, b) => a.change - b.change).slice(0, 5);

const content = `export const TRENDING_CAREERS = ${JSON.stringify(trending, null, 2)};\n\nexport const DECLINING_CAREERS = ${JSON.stringify(declining, null, 2)};\n`;
fs.writeFileSync(outputPath, content, "utf-8");

console.log("Trending cache written:", outputPath);
