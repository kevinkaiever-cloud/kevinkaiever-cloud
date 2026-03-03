import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CAREER_DB } from "../src/data/careers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "../public");
const outputPath = path.join(publicDir, "sitemap.xml");
const site = "https://career-kline.com";

const staticRoutes = ["/", "/gaokao", "/compare"];
const careerRoutes = CAREER_DB.map((c) => `/career/${encodeURIComponent(c.career_name)}`);
const routes = [...staticRoutes, ...careerRoutes];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes.map((route) => `  <url><loc>${site}${route}</loc></url>`).join("\n") +
  `\n</urlset>\n`;

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(outputPath, xml, "utf-8");

console.log("Sitemap written:", outputPath);
