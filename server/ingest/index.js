import dotenv from "dotenv";
import { db } from "../data/db.js";
import { RSS_SOURCES, JSON_SOURCES, HTML_SOURCES, COMPANY_HTML_SOURCES } from "../sources.js";
import { fetchRssJobs } from "./rss.js";
import { fetchJsonSource } from "./json.js";
import { fetchHtmlJobs } from "./html.js";
import { fetchCompanyCount } from "./companySample.js";
import { sleep } from "./utils.js";
import { CAREER_DB } from "../../src/data/careers.js";

const CAREER_KEYWORDS = [
  { keyword: /software engineer|software developer|developer|backend|front[- ]?end|full[- ]?stack/i, career: "程序员" },
  { keyword: /frontend engineer/i, career: "前端开发工程师" },
  { keyword: /backend engineer/i, career: "后端开发工程师" },
  { keyword: /full stack/i, career: "全栈开发工程师" },
  { keyword: /mobile developer|ios|android/i, career: "移动端开发工程师" },
  { keyword: /engineer|engineering/i, career: "软件工程师" },
  { keyword: /data analyst|data analysis|analytics/i, career: "数据分析师" },
  { keyword: /data engineer|etl/i, career: "数据工程师" },
  { keyword: /data scientist|scientist/i, career: "算法工程师" },
  { keyword: /machine learning|ml engineer/i, career: "机器学习工程师" },
  { keyword: /ai engineer|artificial intelligence/i, career: "AI工程师" },
  { keyword: /prompt engineer|prompting/i, career: "AI提示词工程师" },
  { keyword: /product manager|product owner/i, career: "产品经理" },
  { keyword: /product analyst|business analyst/i, career: "商业分析师" },
  { keyword: /ui designer|ux designer|product designer/i, career: "UI设计师" },
  { keyword: /visual designer|graphic designer/i, career: "视觉设计师" },
  { keyword: /interaction designer|ux researcher/i, career: "用户研究员" },
  { keyword: /devops|site reliability|sre/i, career: "DevOps工程师" },
  { keyword: /qa engineer|test engineer/i, career: "测试工程师" },
  { keyword: /automation engineer/i, career: "自动化工程师" },
  { keyword: /security engineer|cybersecurity/i, career: "网络安全工程师" },
  { keyword: /cloud architect|cloud engineer/i, career: "云计算架构师" },
  { keyword: /network engineer/i, career: "网络工程师" },
  { keyword: /database administrator|dba/i, career: "数据库管理员" },
  { keyword: /embedded/i, career: "嵌入式工程师" },
  { keyword: /architect/i, career: "解决方案架构师" },
  { keyword: /blockchain/i, career: "区块链工程师" },
  { keyword: /game developer|game programmer/i, career: "游戏开发" },
  { keyword: /platform engineer|infrastructure/i, career: "运维工程师" },
  { keyword: /data visualization/i, career: "数据可视化工程师" },
  { keyword: /bi|business intelligence/i, career: "BI工程师" },
  { keyword: /mlops/i, career: "MLOps工程师" },
  { keyword: /nlp/i, career: "自然语言处理工程师" },
  { keyword: /computer vision/i, career: "计算机视觉工程师" },
  { keyword: /robotics|automation/i, career: "机器人调试工程师" },
  { keyword: /iot|internet of things/i, career: "物联网工程师" },
  { keyword: /hardware engineer/i, career: "智能硬件工程师" },
  { keyword: /solution consultant|pre[- ]?sales/i, career: "售前工程师" },
  { keyword: /customer success|account manager/i, career: "客户成功经理" },
  { keyword: /customer support|customer service|support/i, career: "客服主管" },
  { keyword: /account executive/i, career: "销售经理" },
  { keyword: /sales development|sdr/i, career: "销售经理" },
  { keyword: /marketing|growth/i, career: "市场营销" },
  { keyword: /brand manager|pr/i, career: "品牌经理" },
  { keyword: /seo|sem|performance marketing/i, career: "市场营销" },
  { keyword: /content|editor|copywriter/i, career: "内容运营" },
  { keyword: /community manager/i, career: "社区运营" },
  { keyword: /social media/i, career: "新媒体运营" },
  { keyword: /operations manager|ops/i, career: "运营经理" },
  { keyword: /product operations|growth ops/i, career: "产品运营" },
  { keyword: /project manager|pmo/i, career: "项目经理" },
  { keyword: /program manager/i, career: "项目经理" },
  { keyword: /scrum master/i, career: "项目经理" },
  { keyword: /finance manager|financial analyst|finance/i, career: "财务分析师" },
  { keyword: /accountant|accounting/i, career: "审计" },
  { keyword: /risk|risk control/i, career: "风控分析师" },
  { keyword: /compliance|legal/i, career: "法务" },
  { keyword: /procurement/i, career: "采购经理" },
  { keyword: /supply chain|logistics/i, career: "供应链经理" },
  { keyword: /hr|recruiter|talent/i, career: "人力资源" },
  { keyword: /training|l&d/i, career: "组织发展" },
  { keyword: /quality engineer|qa/i, career: "质量工程师" },
  { keyword: /process engineer|manufacturing/i, career: "工艺工程师" },
  { keyword: /mechanical engineer/i, career: "机械工程师" },
  { keyword: /electrical engineer/i, career: "电气工程师" },
  { keyword: /energy|battery|solar/i, career: "新能源电池工程师" },
  { keyword: /clinical|biomedical/i, career: "临床医生" },
  { keyword: /nurse|nursing/i, career: "护理人员" },
  { keyword: /pharmacist/i, career: "药剂师" },
  { keyword: /teacher|education/i, career: "教师" }
];

dotenv.config();

function extractCareer(title) {
  if (!title) return "";
  const hit = CAREER_DB.find((item) => title.includes(item.career_name));
  return hit ? hit.career_name : "";
}

function extractCareerByKeyword(title) {
  if (!title) return "";
  const match = CAREER_KEYWORDS.find((rule) => rule.keyword.test(title));
  return match ? match.career : "";
}

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

function dailyAggregate(date) {
  const rows = db.prepare(`
    select title, salary_text from job_postings
    where date(created_at) = ?
  `).all(date);

  const counts = new Map();
  const salaryBuckets = new Map();
  rows.forEach((row) => {
    let career = extractCareer(row.title);
    if (!career) career = extractCareerByKeyword(row.title);
    if (!career) return;
    counts.set(career, (counts.get(career) || 0) + 1);
    const salary = Number.parseFloat(row.salary_text);
    if (!Number.isNaN(salary)) {
      const list = salaryBuckets.get(career) || [];
      list.push(salary);
      salaryBuckets.set(career, list);
    }
  });

  if (counts.size === 0) return;
  const max = Math.max(...counts.values());

  const insert = db.prepare(`
    insert or replace into career_daily (date, career_name, hiring_index, salary_median, samples)
    values (@date, @career_name, @hiring_index, @salary_median, @samples)
  `);

  const trx = db.transaction((entries) => {
    entries.forEach((entry) => insert.run(entry));
  });

  const payload = Array.from(counts.entries()).map(([careerName, count]) => {
    const salaries = (salaryBuckets.get(careerName) || []).sort((a, b) => a - b);
    const mid = salaries.length > 0 ? salaries[Math.floor(salaries.length / 2)] : null;
    return {
      date,
      career_name: careerName,
      hiring_index: +((count / max) * 100).toFixed(1),
      salary_median: mid ? +mid.toFixed(2) : null,
      samples: count
    };
  });

  trx(payload);
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
