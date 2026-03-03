import { CAREER_MAP } from "../data/careers.js";
import { FUTURE_TYPES, CAREER_FUTURE_MAP } from "../data/futureTrends.js";

const YEARS = Array.from({ length: 31 }, (_, i) => 2005 + i);

// ═══════════════════════════════════════════════════════════════
// Industry base indexes & trend phases (per-industry differentiation)
// ═══════════════════════════════════════════════════════════════
const INDUSTRY_BASE = {
  "传统服务": 42, "科技互联网": 65, "公共服务": 52,
  "AI与数字化": 58, "自由职业": 44, "制造与工程": 48,
  "金融": 56, "医疗健康": 58, "教育": 50,
  "能源": 54, "物流": 47, "文娱创意": 51,
};

// 行业景气度趋势阶段 [start, end, slope] — 强差异化，各行业曲线形态显著不同
const INDUSTRY_PHASES = {
  "科技互联网": [
    { start: 2005, end: 2012, slope: 0.3 },
    { start: 2013, end: 2018, slope: 1.5 },
    { start: 2019, end: 2021, slope: 2.2 },
    { start: 2022, end: 2024, slope: -2.0 },
    { start: 2025, end: 2028, slope: 0.2 },
    { start: 2029, end: 2035, slope: 0.6 },
  ],
  "AI与数字化": [
    { start: 2005, end: 2014, slope: 0.1 },
    { start: 2015, end: 2019, slope: 0.6 },
    { start: 2020, end: 2023, slope: 1.8 },
    { start: 2024, end: 2035, slope: 2.5 },
  ],
  "金融": [
    { start: 2005, end: 2011, slope: 0.9 },
    { start: 2012, end: 2017, slope: 0.3 },
    { start: 2018, end: 2022, slope: -1.2 },
    { start: 2023, end: 2025, slope: -0.4 },
    { start: 2026, end: 2035, slope: 0.25 },
  ],
  "医疗健康": [
    { start: 2005, end: 2012, slope: 0.2 },
    { start: 2013, end: 2019, slope: 0.5 },
    { start: 2020, end: 2023, slope: 0.9 },
    { start: 2024, end: 2035, slope: 1.2 },
  ],
  "教育": [
    { start: 2005, end: 2014, slope: 0.4 },
    { start: 2015, end: 2020, slope: 1.0 },
    { start: 2021, end: 2023, slope: -1.5 },
    { start: 2024, end: 2026, slope: -0.3 },
    { start: 2027, end: 2035, slope: 0.3 },
  ],
  "能源": [
    { start: 2005, end: 2013, slope: 0.2 },
    { start: 2014, end: 2019, slope: 0.3 },
    { start: 2020, end: 2022, slope: 0.5 },
    { start: 2023, end: 2035, slope: 1.5 },
  ],
  "物流": [
    { start: 2005, end: 2013, slope: 0.3 },
    { start: 2014, end: 2019, slope: 0.8 },
    { start: 2020, end: 2022, slope: 1.2 },
    { start: 2023, end: 2035, slope: 0.3 },
  ],
  "制造与工程": [
    { start: 2005, end: 2011, slope: 0.7 },
    { start: 2012, end: 2017, slope: 0.4 },
    { start: 2018, end: 2022, slope: 0.1 },
    { start: 2023, end: 2025, slope: -0.8 },
    { start: 2026, end: 2035, slope: 0.5 },
  ],
  "文娱创意": [
    { start: 2005, end: 2015, slope: 0.3 },
    { start: 2016, end: 2020, slope: 0.9 },
    { start: 2021, end: 2023, slope: 1.0 },
    { start: 2024, end: 2035, slope: -0.4 },
  ],
  "传统服务": [
    { start: 2005, end: 2016, slope: 0.15 },
    { start: 2017, end: 2020, slope: -0.2 },
    { start: 2021, end: 2023, slope: -0.5 },
    { start: 2024, end: 2035, slope: 0.35 },
  ],
  "公共服务": [
    { start: 2005, end: 2014, slope: 0.25 },
    { start: 2015, end: 2022, slope: 0.2 },
    { start: 2023, end: 2035, slope: 0.35 },
  ],
  "自由职业": [
    { start: 2005, end: 2015, slope: 0.2 },
    { start: 2016, end: 2020, slope: 0.8 },
    { start: 2021, end: 2023, slope: 1.2 },
    { start: 2024, end: 2035, slope: 0.25 },
  ],
};

// 行业专属周期：周期长度、振幅、相位偏移 — 使同行业不同职业曲线也有细微差异
const INDUSTRY_CYCLE = {
  "科技互联网": { period: 4.8, amp: 2.2, macroWeight: 0.7 },
  "AI与数字化": { period: 5.5, amp: 1.8, macroWeight: 0.5 },
  "金融": { period: 6.2, amp: 3.0, macroWeight: 0.9 },
  "医疗健康": { period: 7.0, amp: 1.2, macroWeight: 0.4 },
  "教育": { period: 5.0, amp: 2.5, macroWeight: 0.6 },
  "能源": { period: 4.2, amp: 2.8, macroWeight: 0.8 },
  "物流": { period: 4.5, amp: 2.0, macroWeight: 0.65 },
  "制造与工程": { period: 5.8, amp: 2.6, macroWeight: 0.75 },
  "文娱创意": { period: 4.0, amp: 2.4, macroWeight: 0.7 },
  "传统服务": { period: 6.5, amp: 1.5, macroWeight: 0.55 },
  "公共服务": { period: 8.0, amp: 0.8, macroWeight: 0.3 },
  "自由职业": { period: 4.3, amp: 2.2, macroWeight: 0.6 },
};

// ═══════════════════════════════════════════════════════════════
// Macro economic shocks (impact on hiring & salary)
// ═══════════════════════════════════════════════════════════════
const MACRO_SHOCKS = {
  2008: -6, 2009: -5, 2015: 3, 2018: -2,
  2020: -10, 2021: 6, 2022: -1, 2023: -3, 2024: 1, 2025: 2,
};

// ═══════════════════════════════════════════════════════════════
// Wage growth curves per category (year → ratio, 2025 = 1.0)
// Based on China NBS wage statistics 2005–2025
// ═══════════════════════════════════════════════════════════════
const WAGE_KEYFRAMES = {
  "传统":     [[2005,0.18],[2008,0.24],[2010,0.30],[2013,0.40],[2015,0.50],[2018,0.62],[2020,0.72],[2022,0.82],[2025,1.00],[2030,1.12],[2035,1.22]],
  "现代":     [[2005,0.20],[2008,0.28],[2010,0.35],[2013,0.44],[2015,0.52],[2018,0.65],[2020,0.78],[2022,0.88],[2025,1.00],[2030,1.15],[2035,1.28]],
  "体制内":   [[2005,0.27],[2008,0.33],[2010,0.40],[2013,0.48],[2015,0.55],[2018,0.65],[2020,0.78],[2022,0.88],[2025,1.00],[2030,1.10],[2035,1.18]],
  "AI":       [[2005,0.10],[2008,0.12],[2010,0.15],[2013,0.20],[2015,0.30],[2018,0.42],[2020,0.55],[2022,0.72],[2025,1.00],[2030,1.30],[2035,1.55]],
  "自由职业": [[2005,0.15],[2008,0.22],[2010,0.28],[2013,0.38],[2015,0.48],[2018,0.60],[2020,0.72],[2022,0.85],[2025,1.00],[2030,1.12],[2035,1.22]],
};

// ── Career-specific wage curves (year → ratio, 2025 = 1.0) ──
const CAREER_WAGE_KEYFRAMES = {
  "月嫂": [[2005,0.20],[2012,0.32],[2016,0.45],[2019,0.75],[2022,0.88],[2025,1.00]],
  "快递员": [[2005,0.18],[2010,0.24],[2013,0.30],[2018,0.70],[2021,0.85],[2025,1.00]],
  "程序员": [[2005,0.20],[2010,0.30],[2015,0.45],[2021,0.95],[2023,0.90],[2025,1.00]],
  "银行柜员": [[2005,0.80],[2012,0.85],[2018,0.88],[2022,0.90],[2025,1.00]],
  "AI工程师": [[2005,0.12],[2016,0.20],[2020,0.35],[2023,0.75],[2025,1.00]],
  "公务员": [[2005,0.45],[2010,0.55],[2014,0.60],[2018,0.62],[2022,0.78],[2025,1.00]],
  "房地产中介": [[2005,0.30],[2012,0.40],[2016,0.50],[2021,1.15],[2023,1.05],[2025,1.00]],
  "新能源电池工程师": [[2005,0.18],[2015,0.26],[2019,0.40],[2022,0.75],[2025,1.00]],
  "直播带货": [[2015,0.10],[2019,0.20],[2022,0.85],[2025,1.00]],
  "芯片设计工程师": [[2005,0.18],[2015,0.28],[2019,0.45],[2022,0.85],[2025,1.00]],
  "收银员": [[2005,0.95],[2010,0.90],[2016,0.88],[2020,0.86],[2025,1.00]],
  "出租车司机": [[2005,0.90],[2010,0.93],[2014,0.95],[2018,0.80],[2022,0.86],[2025,1.00]],
  "健身教练": [[2005,0.22],[2015,0.40],[2020,0.80],[2025,1.00]],
  "心理咨询师": [[2005,0.30],[2015,0.42],[2019,0.55],[2022,0.85],[2025,1.00]],
  "厨师": [[2005,0.45],[2010,0.55],[2015,0.68],[2020,0.84],[2025,1.00]],
  "电焊工": [[2005,0.40],[2015,0.55],[2018,0.62],[2022,0.82],[2025,1.00]],
  "游戏策划": [[2005,0.22],[2015,0.40],[2018,0.55],[2021,0.95],[2023,0.88],[2025,1.00]],
  "外卖骑手": [[2005,0.16],[2012,0.22],[2016,0.30],[2020,0.80],[2025,1.00]],
  "医生": [[2005,0.45],[2012,0.58],[2018,0.68],[2020,0.75],[2022,0.90],[2025,1.00]],
  "保洁": [[2005,0.70],[2010,0.76],[2015,0.82],[2020,0.90],[2025,1.00]],
  "教师": [[2005,0.55],[2012,0.68],[2018,0.80],[2021,0.88],[2025,1.00]],
  "量化研究员": [[2005,0.18],[2012,0.24],[2017,0.30],[2021,0.70],[2025,1.00]],
  "插画师": [[2005,0.30],[2015,0.50],[2021,1.05],[2023,0.92],[2025,1.00]],
  "翻译": [[2005,0.40],[2015,0.62],[2022,1.10],[2024,0.95],[2025,1.00]],
  "美甲师": [[2005,0.28],[2015,0.42],[2018,0.55],[2022,0.88],[2025,1.00]],
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hashSeed(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function seededOffset(seed, min, max) {
  const span = max - min;
  const v = (seed % 1000) / 1000;
  return min + v * span;
}

// ── Linear interpolation on wage keyframes ──
function wageRatio(year, category, careerName) {
  const kf = CAREER_WAGE_KEYFRAMES[careerName] || WAGE_KEYFRAMES[category] || WAGE_KEYFRAMES["现代"];
  if (year <= kf[0][0]) return kf[0][1];
  if (year >= kf[kf.length - 1][0]) return kf[kf.length - 1][1];
  for (let i = 1; i < kf.length; i++) {
    if (year <= kf[i][0]) {
      const [y0, v0] = kf[i - 1];
      const [y1, v1] = kf[i];
      return v0 + (v1 - v0) * (year - y0) / (y1 - y0);
    }
  }
  return 1.0;
}

function macroIndex(year) {
  const base = year < 2010 ? -1 : year < 2015 ? 1 : year < 2020 ? 3 : 1;
  return base + (MACRO_SHOCKS[year] || 0);
}

// ═══════════════════════════════════════════════════════════════
// Career classification helpers
// ═══════════════════════════════════════════════════════════════
function inferIndustry(name, category) {
  if (/银行|基金|证券|金融|理财|保险/.test(name)) return "金融";
  if (/医生|护理|药剂|医疗|临床|康复/.test(name)) return "医疗健康";
  if (/教师|教育|课程|讲师/.test(name)) return "教育";
  if (/新能源|光伏|储能|电池/.test(name)) return "能源";
  if (/物流|供应链|仓库|快递|司机|运输/.test(name)) return "物流";
  if (/工人|工程|制造|工艺|质量|生产|设备/.test(name)) return "制造与工程";
  if (/设计|动画|剪辑|摄影|内容|文案|传媒|配音|音乐/.test(name)) return "文娱创意";
  if (category === "AI") return "AI与数字化";
  if (category === "体制内") return "公共服务";
  if (category === "自由职业") return "自由职业";
  if (category === "传统") return "传统服务";
  return "科技互联网";
}

// ── Career-specific trend phases ──
function getCareerPhases(category, name) {
  if (/银行柜员|柜员/.test(name)) {
    return [
      { start: 2005, end: 2014, slope: 0.4 },
      { start: 2015, end: 2019, slope: 0.1 },
      { start: 2020, end: 2025, slope: -1.4 },
    ];
  }
  if (/AI|算法|机器学习|AIGC|智能体/.test(name) || category === "AI") {
    return [
      { start: 2005, end: 2014, slope: 0.2 },
      { start: 2015, end: 2021, slope: 1.0 },
      { start: 2022, end: 2025, slope: 2.6 },
    ];
  }
  if (/程序员|开发|工程师|架构师/.test(name) && category !== "体制内") {
    return [
      { start: 2005, end: 2014, slope: 0.6 },
      { start: 2015, end: 2022, slope: 1.6 },
      { start: 2023, end: 2025, slope: -0.9 },
    ];
  }
  if (category === "传统") {
    return [
      { start: 2005, end: 2014, slope: 0.2 },
      { start: 2015, end: 2025, slope: 0.1 },
    ];
  }
  if (category === "体制内") {
    return [
      { start: 2005, end: 2014, slope: 0.2 },
      { start: 2015, end: 2025, slope: 0.1 },
    ];
  }
  if (category === "自由职业") {
    return [
      { start: 2005, end: 2014, slope: 0.5 },
      { start: 2015, end: 2020, slope: 1.1 },
      { start: 2021, end: 2025, slope: 0.4 },
    ];
  }
  // 现代 default
  return [
    { start: 2005, end: 2010, slope: 0.6 },
    { start: 2011, end: 2014, slope: 0.9 },
    { start: 2015, end: 2022, slope: 1.2 },
    { start: 2023, end: 2025, slope: -0.4 },
  ];
}

function phaseContribution(year, phases) {
  return phases.reduce((sum, phase) => {
    if (year < phase.start) return sum;
    const end = Math.min(year, phase.end);
    return sum + (end - phase.start + 1) * phase.slope;
  }, 0);
}

// ═══════════════════════════════════════════════════════════════
// AI exposure / boost
// ═══════════════════════════════════════════════════════════════
function aiExposure(category, name) {
  if (/银行柜员|柜员/.test(name)) return 0.75;
  if (/客服|文案|翻译|配音|剪辑/.test(name)) return 0.65;
  if (/收银|售票|前台/.test(name)) return 0.70;
  if (/AI|算法|机器学习|AIGC|智能体/.test(name) || category === "AI") return 0.25;
  if (category === "体制内") return 0.25;
  if (category === "传统") return 0.30;
  return 0.45;
}

function aiBoost(category, name) {
  if (/AI|算法|机器学习|AIGC|智能体/.test(name) || category === "AI") return 0.75;
  if (/自动化|数字|数据|平台|云/.test(name)) return 0.35;
  return 0.10;
}

function resolveFutureType(careerName) {
  return CAREER_FUTURE_MAP[careerName] || "NEUTRAL";
}

function futureSlopeAdjustments(careerName, category) {
  const typeKey = resolveFutureType(careerName);
  let { demandSlope, salarySlope } = FUTURE_TYPES[typeKey] || FUTURE_TYPES.NEUTRAL;

  if (typeKey === "NEUTRAL") {
    if (/工程师/.test(careerName)) {
      salarySlope = 0.5;
    }
    if (/产品经理|运营|市场/.test(careerName)) {
      demandSlope = -0.2;
    }
    if (/保安|保洁|搬运工|装卸工|服务员|客房服务员|售货员/.test(careerName) || category === "传统") {
      demandSlope = Math.min(demandSlope, -0.3);
    }
  }

  if (typeKey === "AI_SPLIT") {
    salarySlope = -1.0;
  }

  return { typeKey, demandSlope, salarySlope };
}

function futureSalaryAdjust(year, careerName, category) {
  if (year <= 2025) return 1;
  const { salarySlope } = futureSlopeAdjustments(careerName, category);
  const adjust = salarySlope * (year - 2025) * 0.01;
  return 1 + adjust;
}

function futureDemandAdjust(year, careerName, category) {
  if (year <= 2025) return 0;
  const { demandSlope } = futureSlopeAdjustments(careerName, category);
  return demandSlope * (year - 2025);
}

// ═══════════════════════════════════════════════════════════════
// Hiring demand base
// ═══════════════════════════════════════════════════════════════
function baseDemand(category, name) {
  if (/银行柜员|柜员/.test(name)) return 42;
  if (/收银|售票/.test(name)) return 35;
  if (category === "AI") return 48;
  if (category === "现代") return 56;
  if (category === "体制内") return 50;
  if (category === "自由职业") return 44;
  return 46;
}

// ═══════════════════════════════════════════════════════════════
// Index computations
// ═══════════════════════════════════════════════════════════════
function industryPhaseContribution(year, industry) {
  const phases = INDUSTRY_PHASES[industry] || [
    { start: 2005, end: 2035, slope: 0.2 },
  ];
  return phases.reduce((sum, phase) => {
    if (year < phase.start) return sum;
    const end = Math.min(year, phase.end);
    return sum + (end - phase.start + 1) * phase.slope;
  }, 0);
}

function industryIndex(year, industry, cyclePhaseOffset = 0) {
  const base = INDUSTRY_BASE[industry] || 50;
  const cycleConfig = INDUSTRY_CYCLE[industry] || { period: 5.2, amp: 2.5, macroWeight: 0.5 };
  const { period, amp, macroWeight } = cycleConfig;
  const macro = macroIndex(year) * macroWeight;
  const trend = industryPhaseContribution(year, industry);
  const cycle = Math.sin((year - 2005) / period + cyclePhaseOffset) * amp;
  return clamp(base + macro + trend * 0.35 + cycle, 22, 95);
}

function aiImpactIndex(year, exposure, boost) {
  if (year < 2022) return 0;
  const wave = (year - 2021) * 8;
  return clamp(wave * exposure + wave * boost * 0.6, 0, 100);
}

// ═══════════════════════════════════════════════════════════════
// Salary computation — anchored to real 2025 data
// ═══════════════════════════════════════════════════════════════
function salaryForYear(anchor2025K, year, category, hiringIndex, careerName) {
  // anchor2025K: real 2025 median salary in K (e.g. 15 = ¥15,000/month)
  // Returns salary in K for the given year

  // Base ratio from wage growth curve (2025 = 1.0)
  const ratio = wageRatio(year, category, careerName);

  // Demand adjustment: ±12% based on hiring index deviation from 50
  const demandAdj = 1 + (hiringIndex - 50) * 0.0024;

  // Macro shock: small direct salary impact
  const macro = MACRO_SHOCKS[year] || 0;
  const macroAdj = 1 + macro * 0.005;

  return +(anchor2025K * ratio * demandAdj * macroAdj).toFixed(1);
}

// Fallback for careers not in CAREER_MAP
const CATEGORY_SALARY_K = {
  "AI": 12, "现代": 10, "体制内": 7.5, "自由职业": 7, "传统": 5.5,
};

// ═══════════════════════════════════════════════════════════════
// Main series generator
// ═══════════════════════════════════════════════════════════════
export function generateCareerSeries(careerName) {
  const career = CAREER_MAP[careerName];
  if (!career) return [];

  const { category, growth_score } = career;
  const anchor = career.salary_2025 || CATEGORY_SALARY_K[category] || 8;
  const industry = inferIndustry(careerName, category);
  const phases = getCareerPhases(category, careerName);
  const demandBase = baseDemand(category, careerName);
  const exposure = aiExposure(category, careerName);
  const boost = aiBoost(category, careerName);
  const seed = hashSeed(careerName);
  const cyclePhase = seededOffset(seed, 0, Math.PI * 2);
  const demandBias = seededOffset(seed >> 1, -2.5, 2.5);
  const volatility = clamp((growth_score - 50) / 20, -1.2, 2.2);
  const cycleAmp = 1.2 + seededOffset(seed >> 2, 0, 1.2) + Math.max(0, volatility) * 0.6;
  const pulseAmp = 0.6 + seededOffset(seed >> 3, 0, 0.8);
  const industryShift = seededOffset(seed >> 4, -2.0, 2.0);

  let prevClose = salaryForYear(anchor, 2005, category, demandBase, careerName);

  return YEARS.map((year) => {
    const macro = macroIndex(year);
    const trend = phaseContribution(year, phases);
    const cycle = Math.sin((year - 2005) / 2 + cyclePhase) * cycleAmp;
    const pulse = Math.cos((year - 2005) / 3.5 + cyclePhase * 0.7) * pulseAmp;
    const futureHiring = futureDemandAdjust(year, careerName, category);
    const hiringIndex = clamp(demandBase + trend + macro + demandBias + cycle + pulse + futureHiring, 5, 100);
    const industryCycle = Math.sin((year - 2005) / 4.2 + cyclePhase * 0.4) * (1.2 + Math.max(0, volatility));
    const industryIdx = clamp(industryIndex(year, industry, cyclePhase * 0.5) + industryShift + industryCycle, 20, 95);
    const aiImpact = aiImpactIndex(year, exposure, boost);

    const rawSalary = salaryForYear(anchor, year, category, hiringIndex, careerName);
    const futureAdj = futureSalaryAdjust(year, careerName, category);
    const close = +(rawSalary * futureAdj).toFixed(1);
    const open = prevClose;
    let high = +(Math.max(open, close) * (1.05 + macro * 0.002)).toFixed(1);
    let low = +(Math.min(open, close) * (0.95 - macro * 0.001)).toFixed(1);
    const { typeKey } = futureSlopeAdjustments(careerName, category);
    if (year > 2025 && typeKey === "AI_SPLIT") {
      const splitFactor = 1 + (year - 2025) * 0.02;
      high = +(high * splitFactor).toFixed(1);
      low = +(low * (1 - (year - 2025) * 0.02)).toFixed(1);
    }
    prevClose = close;

    return {
      year,
      hiring_index: +hiringIndex.toFixed(1),
      salary_median: close,
      industry_index: +industryIdx.toFixed(1),
      ai_impact: +aiImpact.toFixed(1),
      open,
      close,
      high,
      low,
      industry,
      isForecast: year > 2025,
      futureType: typeKey,
    };
  });
}

export function generateIndustrySeries(industryName) {
  return YEARS.map((year) => ({
    year,
    industry: industryName,
    industry_index: industryIndex(year, industryName),
  }));
}

export { YEARS };
