import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import "./App.css";
import { CAREER_DB, CAREER_GROUPS, CAREER_MAP } from "./data/careers";
import { COMPANY_LIST } from "./data/companies";
import { generateCareerSeries, generateIndustrySeries, YEARS as CAREER_YEARS } from "./engine/careerTrend";
import { generateCompanySeries, YEARS as COMPANY_YEARS, LAYOFF_YEARS } from "./engine/companyTrend";
import { buildCareerReport } from "./engine/report";

const CATEGORY_TAGS = [
  { key: "全部", label: "全部", icon: "🧭" },
  { key: "传统", label: "传统", icon: "🧱" },
  { key: "现代", label: "现代", icon: "⚙️" },
  { key: "体制内", label: "体制内", icon: "🏛️" },
  { key: "AI", label: "AI", icon: "🤖" },
  { key: "自由职业", label: "自由职业", icon: "🧑‍💼" }
];

const SUBCATEGORY_MAP = {
  传统: [
    { key: "餐饮", patterns: /厨师|面点|烘焙|服务员|客房/ },
    { key: "建筑工地", patterns: /建筑|瓦工|钢筋|抹灰|电焊|木工|油漆|测量/ },
    { key: "运输物流", patterns: /司机|货车|快递|仓库|装卸|搬运|物流/ },
    { key: "维修服务", patterns: /维修|汽修|水管|电工|家电|手机|钟表/ },
    { key: "农林渔牧", patterns: /农|渔|养殖|果农/ },
    { key: "生活服务", patterns: /保洁|保安|保姆|月嫂|美容|美甲|按摩/ }
  ],
  现代: [
    { key: "研发工程", patterns: /开发|工程师|架构|运维|DevOps|嵌入式|物联网|算法/ },
    { key: "数据智能", patterns: /数据|BI|分析|算法|机器学习|AI/ },
    { key: "产品设计", patterns: /产品经理|UI|设计|交互|用户研究/ },
    { key: "运营增长", patterns: /运营|增长|内容|社区|新媒体/ },
    { key: "市场销售", patterns: /市场|品牌|公关|销售|客户成功/ },
    { key: "职能支持", patterns: /人力|法务|财务|审计|合规|采购|供应链/ }
  ],
  体制内: [
    { key: "教育医疗", patterns: /教师|医生|护士|药师|卫生/ },
    { key: "政府机关", patterns: /公务员|税务|海关|法院|检察|警察|消防/ },
    { key: "国企央企", patterns: /国企|电力|铁路|邮政|地铁/ },
    { key: "公共服务", patterns: /社区|事业单位|统计|市场监管/ }
  ],
  AI: [
    { key: "算法研发", patterns: /算法|多模态|联邦|MLOps|模型/ },
    { key: "产品应用", patterns: /AI产品|知识库|智能体|RPA|自动化/ },
    { key: "内容创作", patterns: /内容|AIGC|虚拟人|数字人/ },
    { key: "治理安全", patterns: /安全|伦理|治理|质检/ }
  ],
  自由职业: [
    { key: "内容创作", patterns: /撰稿|插画|摄影|剪辑|配音|音乐/ },
    { key: "咨询服务", patterns: /咨询|顾问|课程|培训/ },
    { key: "电商零售", patterns: /网店|带货|二手|微商/ },
    { key: "本地生活", patterns: /家政|美容|宠物|维修/ }
  ]
};

function resolveSubcategory(item) {
  const groups = SUBCATEGORY_MAP[item.category] || [];
  const hit = groups.find((group) => group.patterns.test(item.career_name));
  return hit ? hit.key : "其他";
}
const TIME_RANGES = [
  { label: "3M", months: 3, granularity: "day" },
  { label: "6M", months: 6, granularity: "day" },
  { label: "1Y", months: 12, granularity: "month" },
  { label: "3Y", months: 36, granularity: "quarter" },
  { label: "5Y", months: 60, granularity: "half" },
  { label: "10Y", months: 120, granularity: "year" },
  { label: "ALL", months: 9999, granularity: "year" }
];

function toDate(value) {
  if (!value) return null;
  if (typeof value === "number") return new Date(`${value}-01-01`);
  return new Date(value);
}

function getGranularityKey(date, granularity) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  if (granularity === "day") return date.toISOString().slice(0, 10);
  if (granularity === "month") return `${year}-${String(month).padStart(2, "0")}`;
  if (granularity === "quarter") return `${year}-Q${Math.floor((month - 1) / 3) + 1}`;
  if (granularity === "half") return `${year}-H${month <= 6 ? 1 : 2}`;
  return String(year);
}

function normalizeCareerSeries(series) {
  return series.map((item) => {
    const date = item.date || (item.year ? `${item.year}-01-01` : "");
    const value = item.salary_median ?? item.close ?? item.hiring_index ?? 0;
    return {
      date,
      open: item.open ?? value,
      close: item.close ?? value,
      high: item.high ?? value,
      low: item.low ?? value,
      hiring_index: item.hiring_index ?? value,
      salary_median: item.salary_median ?? value,
      industry_index: item.industry_index,
      ai_impact: item.ai_impact,
      industry: item.industry
    };
  }).filter((item) => item.date);
}

function aggregateSeries(series, granularity) {
  const groups = new Map();
  series.forEach((item) => {
    const date = toDate(item.date);
    if (!date || Number.isNaN(date.getTime())) return;
    const key = getGranularityKey(date, granularity);
    const group = groups.get(key) || [];
    group.push({ ...item, _date: date });
    groups.set(key, group);
  });
  return Array.from(groups.entries())
    .map(([key, items]) => {
      const sorted = items.sort((a, b) => a._date - b._date);
      const open = sorted[0].open;
      const close = sorted[sorted.length - 1].close;
      const high = Math.max(...sorted.map((i) => i.high));
      const low = Math.min(...sorted.map((i) => i.low));
      const hiring = sorted.reduce((s, i) => s + (i.hiring_index ?? 0), 0) / sorted.length;
      const salary = sorted.reduce((s, i) => s + (i.salary_median ?? 0), 0) / sorted.length;
      return {
        date: key,
        open,
        close,
        high,
        low,
        hiring_index: +hiring.toFixed(2),
        salary_median: +salary.toFixed(2)
      };
    })
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

function buildKlineOption(series, name) {
  const years = series.map((d) => d.year || d.date);
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      textStyle: { fontSize: 11 }
    },
    grid: { left: 48, right: 52, top: 24, bottom: 36 },
    xAxis: {
      type: "category",
      data: years,
      axisLabel: { color: "#94a3b8" },
      axisLine: { lineStyle: { color: "#1f2a44" } }
    },
    yAxis: [
      {
        scale: true,
        axisLabel: { color: "#94a3b8" },
        splitLine: { lineStyle: { color: "#1f2a44" } }
      },
      {
        min: 0,
        max: 100,
        axisLabel: { color: "#94a3b8" },
        splitLine: { show: false }
      }
    ],
    legend: {
      data: ["薪资K线", "招聘需求指数"],
      textStyle: { color: "#94a3b8", fontSize: 10 }
    },
    series: [
      {
        name: "薪资K线",
        type: "candlestick",
        data: series.map((d) => [d.open || d.salary_median, d.close || d.salary_median, d.low || d.salary_median, d.high || d.salary_median]),
        itemStyle: {
          color: "#ef4444",
          color0: "#22c55e",
          borderColor: "#ef4444",
          borderColor0: "#22c55e"
        }
      },
      {
        name: "招聘需求指数",
        type: "line",
        yAxisIndex: 1,
        data: series.map((d) => d.hiring_index),
        smooth: true,
        symbol: "none",
        lineStyle: { color: "#60a5fa", width: 2 }
      }
    ],
    title: {
      text: `${name} · 2005-2025`,
      left: 12,
      top: 2,
      textStyle: { color: "#e2e8f0", fontSize: 12 }
    }
  };
}

function buildIndustryOption(series) {
  return {
    backgroundColor: "transparent",
    grid: { left: 48, right: 24, top: 24, bottom: 36 },
    xAxis: {
      type: "category",
      data: series.map((d) => d.year || d.date),
      axisLabel: { color: "#94a3b8" },
      axisLine: { lineStyle: { color: "#1f2a44" } }
    },
    yAxis: {
      min: 0,
      max: 100,
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "#1f2a44" } }
    },
    series: [
      {
        name: "行业景气度",
        type: "line",
        smooth: true,
        symbol: "none",
        data: series.map((d) => d.industry_index),
        lineStyle: { color: "#34d399", width: 2 },
        areaStyle: { color: "rgba(52,211,153,0.12)" }
      }
    ],
    title: {
      text: "行业景气度",
      left: 12,
      top: 2,
      textStyle: { color: "#e2e8f0", fontSize: 12 }
    }
  };
}

function buildRadarOption(career) {
  if (!career) return {};
  return {
    backgroundColor: "transparent",
    radar: {
      indicator: [
        { name: "AI替代风险", max: 100 },
        { name: "稳定性", max: 100 },
        { name: "成长性", max: 100 },
        { name: "风险等级", max: 100 }
      ],
      axisLine: { lineStyle: { color: "#334155" } },
      splitLine: { lineStyle: { color: "#1f2a44" } },
      splitArea: { areaStyle: { color: ["rgba(30,41,59,0.4)", "rgba(15,23,42,0.4)"] } }
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: [
              career.ai_replace_risk,
              career.stability_score,
              career.growth_score,
              career.risk_level * 10
            ],
            areaStyle: { color: "rgba(96,165,250,0.35)" },
            lineStyle: { color: "#60a5fa" }
          }
        ]
      }
    ],
    title: {
      text: "AI替代风险雷达",
      left: 12,
      top: 2,
      textStyle: { color: "#e2e8f0", fontSize: 12 }
    }
  };
}

function buildCompanyKlineOption(series, company) {
  return {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", axisPointer: { type: "cross" } },
    grid: { left: 48, right: 52, top: 24, bottom: 36 },
    xAxis: {
      type: "category",
      data: series.map((d) => d.year || d.date),
      axisLabel: { color: "#94a3b8" },
      axisLine: { lineStyle: { color: "#1f2a44" } }
    },
    yAxis: {
      scale: true,
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "#1f2a44" } }
    },
    series: [
      {
        name: "招聘需求K线",
        type: "candlestick",
        data: series.map((d) => [d.open || d.hiring_index, d.close || d.hiring_index, d.low || d.hiring_index, d.high || d.hiring_index]),
        itemStyle: {
          color: "#f97316",
          color0: "#22c55e",
          borderColor: "#f97316",
          borderColor0: "#22c55e"
        },
        markLine: {
          symbol: "none",
          label: { color: "#94a3b8" },
          data: LAYOFF_YEARS.map((y) => ({ xAxis: y }))
        }
      }
    ],
    title: {
      text: `${company} · 招聘需求K线`,
      left: 12,
      top: 2,
      textStyle: { color: "#e2e8f0", fontSize: 12 }
    }
  };
}

function buildCompanyRatioOption(series) {
  return {
    backgroundColor: "transparent",
    grid: { left: 48, right: 24, top: 24, bottom: 36 },
    xAxis: {
      type: "category",
      data: series.map((d) => d.year || d.date),
      axisLabel: { color: "#94a3b8" },
      axisLine: { lineStyle: { color: "#1f2a44" } }
    },
    yAxis: {
      min: 0,
      max: 100,
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "#1f2a44" } }
    },
    legend: { textStyle: { color: "#94a3b8", fontSize: 10 } },
    series: [
      {
        name: "技术岗占比",
        type: "line",
        smooth: true,
        symbol: "none",
        data: series.map((d) => d.tech_ratio),
        lineStyle: { color: "#38bdf8", width: 2 }
      },
      {
        name: "AI岗位占比",
        type: "line",
        smooth: true,
        symbol: "none",
        data: series.map((d) => d.ai_job_ratio),
        lineStyle: { color: "#a78bfa", width: 2 }
      }
    ],
    title: {
      text: "技术岗 vs AI岗位占比",
      left: 12,
      top: 2,
      textStyle: { color: "#e2e8f0", fontSize: 12 }
    }
  };
}

export default function App() {
  const [view, setView] = useState("career");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("全部");
  const [careerName, setCareerName] = useState(CAREER_DB[0]?.career_name || "");
  const [companyName, setCompanyName] = useState(COMPANY_LIST[0]?.company || "");
  const [timeRange, setTimeRange] = useState("6M");
  const [subCategory, setSubCategory] = useState("全部");
  const [careerSeries, setCareerSeries] = useState([]);
  const [companySeries, setCompanySeries] = useState([]);
  const [industrySeries, setIndustrySeries] = useState([]);
  const [careerSource, setCareerSource] = useState("simulated");
  const [companySource, setCompanySource] = useState("simulated");
  const [industrySource, setIndustrySource] = useState("simulated");
  const [loadingCareer, setLoadingCareer] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [loadingIndustry, setLoadingIndustry] = useState(false);

  const categoryCounts = useMemo(() => {
    const counts = { 全部: CAREER_DB.length };
    Object.keys(CAREER_GROUPS).forEach((key) => {
      counts[key] = CAREER_GROUPS[key]?.length || 0;
    });
    return counts;
  }, []);

  const subCategoryOptions = useMemo(() => {
    if (category === "全部") return ["全部"];
    const items = CAREER_DB
      .filter((item) => item.category === category)
      .map((item) => resolveSubcategory(item));
    const uniq = Array.from(new Set(items));
    return ["全部", ...uniq];
  }, [category]);

  const filteredCareers = useMemo(() => {
    const keyword = search.trim();
    return CAREER_DB.filter((item) => {
      if (category !== "全部" && item.category !== category) return false;
      if (subCategory !== "全部" && resolveSubcategory(item) !== subCategory) return false;
      if (!keyword) return true;
      return item.career_name.includes(keyword);
    });
  }, [search, category, subCategory]);

  useEffect(() => {
    if (!careerName && filteredCareers.length > 0) {
      setCareerName(filteredCareers[0].career_name);
      return;
    }
    const exists = filteredCareers.some((item) => item.career_name === careerName);
    if (!exists && filteredCareers.length > 0) {
      setCareerName(filteredCareers[0].career_name);
    }
  }, [careerName, filteredCareers]);

  const career = CAREER_MAP[careerName];
  const simulatedCareerSeries = useMemo(
    () => generateCareerSeries(careerName),
    [careerName]
  );

  useEffect(() => {
    if (!careerName) return;
    setLoadingCareer(true);
    fetch(`/api/career/${encodeURIComponent(careerName)}`)
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.series?.length) {
          setCareerSeries(payload.series);
          setCareerSource(payload.source || "api");
        } else {
          const simulated = generateCareerSeries(careerName);
          setCareerSeries(simulated);
          setCareerSource("simulated");
        }
      })
      .catch(() => {
        const simulated = generateCareerSeries(careerName);
        setCareerSeries(simulated);
        setCareerSource("simulated");
      })
      .finally(() => setLoadingCareer(false));
  }, [careerName]);

  useEffect(() => {
    if (!companyName) return;
    setLoadingCompany(true);
    fetch(`/api/company/${encodeURIComponent(companyName)}`)
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.series?.length) {
          setCompanySeries(payload.series);
          setCompanySource(payload.source || "api");
        } else {
          const simulated = generateCompanySeries(companyName);
          setCompanySeries(simulated);
          setCompanySource("simulated");
        }
      })
      .catch(() => {
        const simulated = generateCompanySeries(companyName);
        setCompanySeries(simulated);
        setCompanySource("simulated");
      })
      .finally(() => setLoadingCompany(false));
  }, [companyName]);

  useEffect(() => {
    const fallbackIndustry = simulatedCareerSeries[simulatedCareerSeries.length - 1]?.industry || "科技互联网";
    setLoadingIndustry(true);
    fetch(`/api/industry/${encodeURIComponent(fallbackIndustry)}`)
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.series?.length) {
          setIndustrySeries(payload.series);
          setIndustrySource(payload.source || "api");
        } else {
          const simulated = generateIndustrySeries(fallbackIndustry);
          setIndustrySeries(simulated);
          setIndustrySource("simulated");
        }
      })
      .catch(() => {
        const simulated = generateIndustrySeries(fallbackIndustry);
        setIndustrySeries(simulated);
        setIndustrySource("simulated");
      })
      .finally(() => setLoadingIndustry(false));
  }, [careerName, simulatedCareerSeries]);

  const normalizedCareerSeries = useMemo(
    () => normalizeCareerSeries(careerSeries),
    [careerSeries]
  );
  const filteredCareerSeries = useMemo(() => {
    if (normalizedCareerSeries.length === 0) return [];
    const range = TIME_RANGES.find((item) => item.label === timeRange) || TIME_RANGES[1];
    const lastDate = toDate(normalizedCareerSeries[normalizedCareerSeries.length - 1].date);
    if (!lastDate) return normalizedCareerSeries;
    if (range.months >= 9999) {
      return aggregateSeries(normalizedCareerSeries, range.granularity);
    }
    const cut = new Date(lastDate);
    cut.setMonth(cut.getMonth() - range.months);
    const sliced = normalizedCareerSeries.filter((item) => {
      const date = toDate(item.date);
      return date && date >= cut;
    });
    return aggregateSeries(sliced, range.granularity);
  }, [normalizedCareerSeries, timeRange]);

  const klineOption = useMemo(
    () => buildKlineOption(filteredCareerSeries, careerName),
    [filteredCareerSeries, careerName]
  );
  const industryOption = useMemo(
    () => buildIndustryOption(industrySeries),
    [industrySeries]
  );
  const radarOption = useMemo(
    () => buildRadarOption(career),
    [career]
  );
  const companyKlineOption = useMemo(
    () => buildCompanyKlineOption(companySeries, companyName),
    [companySeries, companyName]
  );
  const companyRatioOption = useMemo(
    () => buildCompanyRatioOption(companySeries),
    [companySeries]
  );

  const reportText = useMemo(
    () => buildCareerReport(career, normalizedCareerSeries),
    [career, normalizedCareerSeries]
  );

  const latest = filteredCareerSeries[filteredCareerSeries.length - 1];
  const latestIndustry = industrySeries[industrySeries.length - 1];
  const summary = latest
    ? {
        hiring: latest.hiring_index,
        salary: latest.salary_median,
        industry: latestIndustry?.industry_index ?? null,
        aiImpact: latest.ai_impact ?? simulatedCareerSeries[simulatedCareerSeries.length - 1]?.ai_impact,
        industryName: latestIndustry?.industry || simulatedCareerSeries[simulatedCareerSeries.length - 1]?.industry
      }
    : null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-logo">K</div>
          <div>
            <div className="brand-title">职业K线 · Career K-Line</div>
            <div className="brand-subtitle">职业趋势数据库 · 行业K线 · 公司用工趋势</div>
          </div>
        </div>
        <div className="header-actions">
          <button
            className={`pill ${view === "career" ? "pill-active" : ""}`}
            onClick={() => setView("career")}
          >
            职业K线
          </button>
          <button
            className={`pill ${view === "company" ? "pill-active" : ""}`}
            onClick={() => setView("company")}
          >
            公司用工K线
          </button>
        </div>
      </header>

      <div className="content">
        <aside className="sidebar">
          <div className="panel-title">职业数据库</div>
          <div className="panel-subtitle">200+ 职业趋势样本 · 支持模糊搜索</div>
          <input
            className="search-input"
            placeholder="搜索职业：厨师 / 银行 / 摄影..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="panel-title panel-title-sm">职业分类</div>
          <div className="filter-row">
            {CATEGORY_TAGS.map((item) => (
              <button
                key={item.key}
                className={`pill ${category === item.key ? "pill-active" : ""}`}
                onClick={() => {
                  setCategory(item.key);
                  setSubCategory("全部");
                }}
              >
                <span className="pill-icon">{item.icon}</span>
                <span>{item.label}</span>
                <span className="pill-count">{categoryCounts[item.key] ?? 0}</span>
              </button>
            ))}
          </div>
          {category !== "全部" && (
            <>
              <div className="panel-title panel-title-sm">细分方向</div>
              <div className="filter-row">
                {subCategoryOptions.map((item) => (
                  <button
                    key={item}
                    className={`pill ${subCategory === item ? "pill-active" : ""}`}
                    onClick={() => setSubCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="panel-title panel-title-sm">职位列表</div>
          <div className="career-list">
            {filteredCareers.map((item) => (
              <button
                key={item.career_name}
                className={`career-item ${careerName === item.career_name ? "career-item-active" : ""}`}
                onClick={() => setCareerName(item.career_name)}
              >
                <span className="career-name">{item.career_name}</span>
                <span className={`career-tag tag-${item.category}`}>{item.category}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="main">
          {view === "career" && (
            <>
              <section className="hero">
                <div>
                  <div className="hero-title">{careerName}</div>
                  <div className="hero-meta">
                    <span>分类：{career?.category}</span>
                    {summary && <span>行业：{summary.industryName}</span>}
                    {summary && <span>2025 招聘指数：{summary.hiring}</span>}
                    {summary && <span>薪资中位数：{summary.salary}K</span>}
                    <span className="data-source">
                      数据源：{loadingCareer ? "加载中..." : careerSource === "daily" || careerSource === "api" ? "API/真实" : "模拟"}
                    </span>
                    <span className="data-source">
                      行业源：{loadingIndustry ? "加载中..." : industrySource === "daily" || industrySource === "api" ? "API/真实" : "模拟"}
                    </span>
                  </div>
                </div>
                <div className="hero-metrics">
                  <div className="metric-card">
                    <div className="metric-label">行业景气度</div>
                    <div className="metric-value">{summary?.industry}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">AI冲击指数</div>
                    <div className="metric-value">{summary?.aiImpact}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">稳定性评分</div>
                    <div className="metric-value">{career?.stability_score}</div>
                  </div>
                </div>
              </section>

              <section className="chart-grid">
                <div className="chart-card chart-span-2">
                  <div className="filter-row">
                    {TIME_RANGES.map((item) => (
                      <button
                        key={item.label}
                        className={`pill ${timeRange === item.label ? "pill-active" : ""}`}
                        onClick={() => setTimeRange(item.label)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <ReactECharts option={klineOption} style={{ height: 360 }} />
                </div>
                <div className="chart-card">
                  <ReactECharts option={radarOption} style={{ height: 360 }} />
                </div>
                <div className="chart-card">
                  <ReactECharts option={industryOption} style={{ height: 360 }} />
                </div>
              </section>

              <section className="report-card">
                <div className="panel-title">职业未来10年K线分析报告</div>
                <pre className="report-text">{reportText}</pre>
              </section>
            </>
          )}

          {view === "company" && (
            <>
              <section className="hero">
                <div>
                  <div className="hero-title">公司用工需求K线</div>
                  <div className="hero-meta">
                    <span>周期：{COMPANY_YEARS[0]}-{COMPANY_YEARS[COMPANY_YEARS.length - 1]}</span>
                    <span>裁员周期标记：{LAYOFF_YEARS.join(", ")}</span>
                    <span className="data-source">
                      数据源：{loadingCompany ? "加载中..." : companySource === "daily" || companySource === "api" ? "API/真实" : "模拟"}
                    </span>
                  </div>
                </div>
                <div className="company-select">
                  <span>选择公司</span>
                  <select value={companyName} onChange={(e) => setCompanyName(e.target.value)}>
                    {COMPANY_LIST.map((item) => (
                      <option key={item.company} value={item.company}>
                        {item.company}
                      </option>
                    ))}
                  </select>
                </div>
              </section>

              <section className="chart-grid">
                <div className="chart-card chart-span-2">
                  <ReactECharts option={companyKlineOption} style={{ height: 360 }} />
                </div>
                <div className="chart-card">
                  <ReactECharts option={companyRatioOption} style={{ height: 360 }} />
                </div>
                <div className="chart-card">
                  <div className="panel-title">用工解读</div>
                  <div className="report-text">
                    <p>招聘需求指数反映公司整体用工景气度，互联网公司在裁员周期年（{LAYOFF_YEARS.join(" / ")}）波动更明显。</p>
                    <p>技术岗占比持续上升，AI岗位占比在 2016 后进入快速增幅区间。</p>
                    <p>海外公司曲线更平滑，国企与银行类公司更强调稳定性。</p>
                  </div>
                </div>
              </section>
            </>
          )}

          <footer className="footer">
            数据基于公开信息逻辑模拟 · 仅供参考 · Career K-Line Analytics © 2026
          </footer>
        </main>
      </div>
    </div>
  );
}
