import { CAREER_MAP } from "../data/careers.js";

const YEARS = Array.from({ length: 21 }, (_, i) => 2005 + i);

const INDUSTRY_BASE = {
  "传统服务": 48,
  "科技互联网": 62,
  "公共服务": 52,
  "AI与数字化": 60,
  "自由职业": 46,
  "制造与工程": 50,
  "金融": 54,
  "医疗健康": 55,
  "教育": 50,
  "能源": 53,
  "物流": 49,
  "文娱创意": 50
};

const MACRO_SHOCKS = {
  2008: -6,
  2009: -5,
  2015: 3,
  2018: -2,
  2020: -10,
  2021: 6,
  2022: -1,
  2023: -3,
  2024: 1,
  2025: 2
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function macroIndex(year) {
  const base = year < 2010 ? -1 : year < 2015 ? 1 : year < 2020 ? 3 : 1;
  return base + (MACRO_SHOCKS[year] || 0);
}

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

function baseSalaryByCategory(category) {
  if (category === "AI") return 26;
  if (category === "现代") return 16;
  if (category === "体制内") return 11;
  if (category === "自由职业") return 12;
  return 9;
}

function getCareerPhases(category, name) {
  if (/银行柜员|柜员/.test(name)) {
    return [
      { start: 2005, end: 2014, slope: 0.4 },
      { start: 2015, end: 2019, slope: 0.1 },
      { start: 2020, end: 2025, slope: -1.4 }
    ];
  }
  if (/AI|算法|机器学习|AIGC|智能体/.test(name) || category === "AI") {
    return [
      { start: 2005, end: 2014, slope: 0.2 },
      { start: 2015, end: 2021, slope: 1.0 },
      { start: 2022, end: 2025, slope: 2.6 }
    ];
  }
  if (/程序员|开发|工程师|架构师/.test(name)) {
    return [
      { start: 2005, end: 2014, slope: 0.6 },
      { start: 2015, end: 2022, slope: 1.6 },
      { start: 2023, end: 2025, slope: -0.9 }
    ];
  }
  if (category === "传统") {
    return [
      { start: 2005, end: 2014, slope: 0.2 },
      { start: 2015, end: 2025, slope: 0.1 }
    ];
  }
  if (category === "体制内") {
    return [
      { start: 2005, end: 2014, slope: 0.2 },
      { start: 2015, end: 2025, slope: 0.1 }
    ];
  }
  if (category === "自由职业") {
    return [
      { start: 2005, end: 2014, slope: 0.5 },
      { start: 2015, end: 2020, slope: 1.1 },
      { start: 2021, end: 2025, slope: 0.4 }
    ];
  }
  return [
    { start: 2005, end: 2010, slope: 0.6 },
    { start: 2011, end: 2014, slope: 0.9 },
    { start: 2015, end: 2022, slope: 1.2 },
    { start: 2023, end: 2025, slope: -0.4 }
  ];
}

function phaseContribution(year, phases) {
  return phases.reduce((sum, phase) => {
    if (year < phase.start) return sum;
    const end = Math.min(year, phase.end);
    return sum + (end - phase.start + 1) * phase.slope;
  }, 0);
}

function aiExposure(category, name) {
  if (/银行柜员|柜员/.test(name)) return 0.75;
  if (/客服|文案|翻译|配音|剪辑/.test(name)) return 0.65;
  if (/AI|算法|机器学习|AIGC|智能体/.test(name) || category === "AI") return 0.25;
  if (category === "体制内") return 0.25;
  if (category === "传统") return 0.3;
  return 0.45;
}

function aiBoost(category, name) {
  if (/AI|算法|机器学习|AIGC|智能体/.test(name) || category === "AI") return 0.75;
  if (/自动化|数字|数据|平台|云/.test(name)) return 0.35;
  return 0.1;
}

function baseDemand(category, name) {
  if (/银行柜员|柜员/.test(name)) return 42;
  if (category === "AI") return 48;
  if (category === "现代") return 56;
  if (category === "体制内") return 50;
  if (category === "自由职业") return 44;
  return 46;
}

function industryIndex(year, industry) {
  const base = INDUSTRY_BASE[industry] || 50;
  const macro = macroIndex(year) * 0.6;
  const structural = industry === "AI与数字化" ? (year >= 2022 ? 6 : 2) : 0;
  return clamp(base + macro + structural, 20, 95);
}

function aiImpactIndex(year, exposure, boost) {
  if (year < 2022) return 0;
  const wave = (year - 2021) * 8;
  return clamp(wave * exposure + wave * boost * 0.6, 0, 100);
}

function salaryMedian(baseSalary, hiringIndex, growthScore, year, category) {
  const yearFactor = (year - 2005) * 0.12;
  const categoryPremium = category === "AI" ? 6 : category === "现代" ? 3 : category === "自由职业" ? 1.5 : 0.5;
  const growthFactor = growthScore * 0.06;
  const demandFactor = hiringIndex * 0.15;
  return +(baseSalary + yearFactor + categoryPremium + growthFactor + demandFactor).toFixed(1);
}

export function generateCareerSeries(careerName) {
  const career = CAREER_MAP[careerName];
  if (!career) return [];
  const { category, growth_score } = career;
  const industry = inferIndustry(careerName, category);
  const phases = getCareerPhases(category, careerName);
  const demandBase = baseDemand(category, careerName);
  const exposure = aiExposure(category, careerName);
  const boost = aiBoost(category, careerName);
  const baseSalary = baseSalaryByCategory(category);

  let prevClose = salaryMedian(baseSalary, demandBase, growth_score, 2005, category);
  return YEARS.map((year) => {
    const macro = macroIndex(year);
    const trend = phaseContribution(year, phases);
    const hiringIndex = clamp(demandBase + trend + macro, 5, 100);
    const industryIdx = industryIndex(year, industry);
    const aiImpact = aiImpactIndex(year, exposure, boost);
    const close = salaryMedian(baseSalary, hiringIndex, growth_score, year, category);
    const open = prevClose;
    const high = +(Math.max(open, close) * (1.05 + macro * 0.002)).toFixed(1);
    const low = +(Math.min(open, close) * (0.95 - macro * 0.001)).toFixed(1);
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
      industry
    };
  });
}

export function generateIndustrySeries(industryName) {
  return YEARS.map((year) => ({
    year,
    industry: industryName,
    industry_index: industryIndex(year, industryName)
  }));
}

export { YEARS };
