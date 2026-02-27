import { COMPANY_LIST } from "../data/companies.js";

const YEARS = Array.from({ length: 21 }, (_, i) => 2005 + i);
const LAYOFF_YEARS = [2012, 2015, 2018, 2022];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function baseByType(type) {
  if (type === "internet") return { hiring: 60, tech: 58 };
  if (type === "state") return { hiring: 52, tech: 32 };
  if (type === "bank") return { hiring: 55, tech: 28 };
  return { hiring: 58, tech: 45 };
}

function cycleShock(year, type) {
  let shock = 0;
  if (year === 2008 || year === 2009) shock -= 5;
  if (year === 2020) shock -= 9;
  if (type === "internet" && LAYOFF_YEARS.includes(year)) shock -= 7;
  if (type === "global" && year === 2023) shock -= 4;
  return shock;
}

function growthByType(year, type) {
  if (type === "state") return year < 2015 ? 0.3 : 0.2;
  if (type === "bank") return year < 2015 ? 0.4 : year < 2020 ? 0.1 : -0.6;
  if (type === "internet") return year < 2010 ? 0.9 : year < 2018 ? 1.4 : year < 2022 ? 0.6 : -0.4;
  return year < 2015 ? 0.8 : year < 2021 ? 1.0 : 0.3;
}

function aiRatio(year, type) {
  if (year < 2016) return 0;
  if (type === "internet") return clamp((year - 2015) * 2.3, 0, 28);
  if (type === "global") return clamp((year - 2015) * 2.0, 0, 24);
  if (type === "bank") return clamp((year - 2016) * 1.4, 0, 18);
  return clamp((year - 2016) * 1.2, 0, 16);
}

function techRatio(year, type, baseTech) {
  const drift = type === "internet" ? 0.7 : type === "global" ? 0.5 : 0.2;
  return clamp(baseTech + (year - 2005) * drift, 18, 78);
}

export function generateCompanySeries(companyName) {
  const company = COMPANY_LIST.find((item) => item.company === companyName);
  if (!company) return [];
  const { type } = company;
  const base = baseByType(type);
  let prevClose = base.hiring;
  return YEARS.map((year) => {
    const growth = growthByType(year, type);
    const shock = cycleShock(year, type);
    const hiringIndex = clamp(base.hiring + (year - 2005) * growth + shock, 10, 100);
    const tech = techRatio(year, type, base.tech);
    const ai = aiRatio(year, type);
    const close = +hiringIndex.toFixed(1);
    const open = prevClose;
    const high = +(Math.max(open, close) * 1.06).toFixed(1);
    const low = +(Math.min(open, close) * 0.94).toFixed(1);
    prevClose = close;
    return {
      company: companyName,
      year,
      hiring_index: close,
      tech_ratio: +tech.toFixed(1),
      ai_job_ratio: +ai.toFixed(1),
      open,
      close,
      high,
      low,
      layoff: type === "internet" && LAYOFF_YEARS.includes(year)
    };
  });
}

export { YEARS, LAYOFF_YEARS };
