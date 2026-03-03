import { COMPANY_LIST } from "../data/companies.js";

const YEARS = Array.from({ length: 31 }, (_, i) => 2005 + i);
const LAYOFF_YEARS = [2012, 2015, 2018, 2022];
const FORECAST_START = 2026;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h * 31) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seeded(seed, min, max) {
  return min + (seed % 1000) / 1000 * (max - min);
}

function baseByType(type) {
  if (type === "internet") return { hiring: 58, tech: 55 };
  if (type === "tech") return { hiring: 60, tech: 62 };
  if (type === "manufacture") return { hiring: 52, tech: 48 };
  if (type === "state") return { hiring: 52, tech: 32 };
  if (type === "bank") return { hiring: 55, tech: 28 };
  return { hiring: 56, tech: 45 };
}

// 公司专属成长阶段 [start, end, slope] — 使曲线差异化
const COMPANY_PHASES = {
  "腾讯": [
    { start: 2005, end: 2012, slope: 1.2 },
    { start: 2013, end: 2018, slope: 1.8 },
    { start: 2019, end: 2022, slope: 0.4 },
    { start: 2023, end: 2025, slope: -0.8 },
  ],
  "阿里巴巴": [
    { start: 2005, end: 2014, slope: 1.5 },
    { start: 2015, end: 2020, slope: 1.2 },
    { start: 2021, end: 2025, slope: -1.0 },
  ],
  "字节跳动": [
    { start: 2012, end: 2019, slope: 2.5 },
    { start: 2020, end: 2023, slope: 1.2 },
    { start: 2024, end: 2025, slope: -0.5 },
  ],
  "美团": [
    { start: 2010, end: 2018, slope: 2.0 },
    { start: 2019, end: 2022, slope: 0.8 },
    { start: 2023, end: 2025, slope: -0.3 },
  ],
  "京东": [
    { start: 2005, end: 2016, slope: 1.4 },
    { start: 2017, end: 2022, slope: 0.5 },
    { start: 2023, end: 2025, slope: -0.6 },
  ],
  "百度": [
    { start: 2005, end: 2014, slope: 1.2 },
    { start: 2015, end: 2022, slope: -0.3 },
    { start: 2023, end: 2025, slope: 0.2 },
  ],
  "拼多多": [
    { start: 2015, end: 2021, slope: 2.8 },
    { start: 2022, end: 2025, slope: 0.5 },
  ],
  "华为": [
    { start: 2005, end: 2018, slope: 1.0 },
    { start: 2019, end: 2022, slope: -0.5 },
    { start: 2023, end: 2025, slope: 1.2 },
  ],
  "比亚迪": [
    { start: 2005, end: 2019, slope: 0.4 },
    { start: 2020, end: 2025, slope: 2.5 },
  ],
  "宁德时代": [
    { start: 2011, end: 2019, slope: 1.2 },
    { start: 2020, end: 2025, slope: 2.2 },
  ],
  "国家电网": [
    { start: 2005, end: 2025, slope: 0.2 },
  ],
  "中国移动": [
    { start: 2005, end: 2015, slope: 0.4 },
    { start: 2016, end: 2025, slope: 0.1 },
  ],
  "中国银行": [
    { start: 2005, end: 2015, slope: 0.5 },
    { start: 2016, end: 2022, slope: -0.2 },
    { start: 2023, end: 2025, slope: 0.1 },
  ],
  "Google": [
    { start: 2005, end: 2015, slope: 1.0 },
    { start: 2016, end: 2022, slope: 0.8 },
    { start: 2023, end: 2025, slope: 0.2 },
  ],
  "Microsoft": [
    { start: 2005, end: 2015, slope: 0.5 },
    { start: 2016, end: 2025, slope: 1.0 },
  ],
  "Amazon": [
    { start: 2005, end: 2019, slope: 1.2 },
    { start: 2020, end: 2023, slope: 0.3 },
    { start: 2024, end: 2025, slope: -0.5 },
  ],
  "Tesla": [
    { start: 2008, end: 2019, slope: 1.0 },
    { start: 2020, end: 2025, slope: 2.0 },
  ],
  "网易": [
    { start: 2005, end: 2015, slope: 0.8 },
    { start: 2016, end: 2022, slope: 0.4 },
    { start: 2023, end: 2025, slope: -0.2 },
  ],
  "滴滴": [
    { start: 2012, end: 2018, slope: 2.0 },
    { start: 2019, end: 2022, slope: 0.2 },
    { start: 2023, end: 2025, slope: -0.8 },
  ],
  "联想": [
    { start: 2005, end: 2014, slope: 0.6 },
    { start: 2015, end: 2025, slope: -0.2 },
  ],
  "招商银行": [
    { start: 2005, end: 2018, slope: 0.5 },
    { start: 2019, end: 2025, slope: 0.3 },
  ],
  "Apple": [
    { start: 2005, end: 2015, slope: 0.8 },
    { start: 2016, end: 2022, slope: 0.5 },
    { start: 2023, end: 2025, slope: 0.2 },
  ],
  "Meta": [
    { start: 2012, end: 2021, slope: 1.5 },
    { start: 2022, end: 2025, slope: -0.6 },
  ],
};

function phaseContribution(year, phases) {
  if (!phases || phases.length === 0) return 0;
  return phases.reduce((sum, p) => {
    if (year < p.start) return sum;
    const end = Math.min(year, p.end);
    return sum + (end - p.start + 1) * p.slope;
  }, 0);
}

function cycleShock(year, type, companyName) {
  if (year > 2025) return seeded(hashSeed(companyName + year), -1, 1);
  let shock = 0;
  if (year === 2008 || year === 2009) shock -= 5;
  if (year === 2020) shock -= 9;
  if (type === "internet" && LAYOFF_YEARS.includes(year)) shock -= 7;
  if (type === "global" && year === 2023) shock -= 4;
  const seed = hashSeed(companyName);
  const jitter = seeded(seed, -2, 2);
  return shock + jitter;
}

function futureSlopeByType(type, growthBias = 0) {
  if (type === "state") return 0.15;
  if (type === "bank") return -0.1;
  if (type === "manufacture") return 0.8;
  if (type === "tech") return 0.3;
  if (type === "internet") return -0.1;
  return 0.2 + growthBias * 0.3;
}

function growthByType(year, type) {
  if (type === "state") return year < 2015 ? 0.3 : 0.2;
  if (type === "bank") return year < 2015 ? 0.4 : year < 2020 ? 0.1 : -0.6;
  if (type === "manufacture") return year < 2020 ? 0.3 : 1.2;
  if (type === "tech") return year < 2018 ? 0.8 : year < 2022 ? 0.2 : 0.5;
  if (type === "internet") return year < 2010 ? 0.9 : year < 2018 ? 1.4 : year < 2022 ? 0.6 : -0.4;
  return year < 2015 ? 0.8 : year < 2021 ? 1.0 : 0.3;
}

function aiRatio(year, type, companyName) {
  if (year < 2016) return 0;
  const seed = hashSeed(companyName + "ai");
  const base = type === "internet" ? 28 : type === "global" ? 24 : type === "tech" ? 22 : type === "bank" ? 18 : 14;
  const startYear = type === "bank" ? 2016 : 2015;
  const raw = clamp((year - startYear) * 2, 0, base);
  return clamp(+(raw + seeded(seed, -2, 2)).toFixed(1), 0, 35);
}

function techRatio(year, type, baseTech, companyName) {
  const drift = type === "internet" ? 0.7 : type === "tech" ? 0.8 : type === "global" ? 0.5 : 0.2;
  const seed = hashSeed(companyName + "tech");
  const jitter = seeded(seed, -3, 3);
  return clamp(baseTech + (year - 2005) * drift + jitter, 18, 78);
}

export function generateCompanySeries(companyName) {
  const company = COMPANY_LIST.find((item) => item.company === companyName);
  if (!company) return [];
  const { type, baseHiring, growthBias } = company;
  const base = baseByType(type);
  const hiringBase = baseHiring ?? base.hiring;
  const bias = growthBias ?? 0;
  const phases = COMPANY_PHASES[companyName];
  const seed = hashSeed(companyName);
  const cycleAmp = seeded(seed, 0.5, 1.5);
  const cyclePhase = seeded(seed >> 1, 0, Math.PI * 2);
  let prevClose = hiringBase;

  const defaultPhases = !phases ? [{ start: 2005, end: 2025, slope: growthByType(2020, type) }] : null;
  const usePhases = phases || defaultPhases;
  const futureSlope = futureSlopeByType(type, bias) * 0.5;

  return YEARS.map((year) => {
    let phaseVal, hiringIndex;
    if (year <= 2025) {
      phaseVal = phaseContribution(year, usePhases) * 0.12;
      const growth = phaseVal + bias * 3;
      const shock = cycleShock(year, type, companyName);
      const cycle = Math.sin((year - 2005) / 3.5 + cyclePhase) * 3 * cycleAmp;
      hiringIndex = clamp(hiringBase + growth + shock + cycle, 10, 100);
    } else {
      const yrsAhead = year - 2025;
      const dampedSlope = futureSlope * Math.exp(-yrsAhead * 0.06);
      hiringIndex = clamp(prevClose + dampedSlope, 10, 100);
    }
    const tech = techRatio(year, type, base.tech, companyName);
    const ai = aiRatio(year, type, companyName);
    const close = +hiringIndex.toFixed(1);
    const open = prevClose;
    const vol = year > 2025 ? 2.5 : 2 + seeded(seed + year, 0, 1.5);
    const high = +(Math.max(open, close) * (1 + vol / 100)).toFixed(1);
    const low = +(Math.min(open, close) * (1 - vol / 100)).toFixed(1);
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
      layoff: type === "internet" && LAYOFF_YEARS.includes(year),
      isForecast: year >= FORECAST_START,
    };
  });
}

export { YEARS, LAYOFF_YEARS, FORECAST_START };
