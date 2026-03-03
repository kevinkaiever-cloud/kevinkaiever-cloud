import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactECharts from "echarts-for-react";
import { MAJOR_CATEGORIES, MAJOR_DB as BASE_MAJOR_DB } from "../../data/majors";
import { CAREER_DB, CAREER_MAP } from "../../data/careers";
import { COMPANY_LIST } from "../../data/companies";
import { generateCareerSeries } from "../../engine/careerTrend";
import { formatSalaryK } from "../../utils/format";
import { TRENDING_CAREERS, DECLINING_CAREERS } from "../../data/trendingCache";

const TAG_COLORS = {
  "热门":"#ef4444","冷门":"#6b7fa0","新专业":"#a78bfa","新工科":"#60a5fa",
  "新农科":"#22c55e","新医科":"#dc2626","国控":"#f59e0b","下降":"#ef4444","新兴":"#34d399",
};

function Tag({ tag }) {
  const c = TAG_COLORS[tag] || "#6b7fa0";
  return <span style={{ background: `${c}18`, color: c, padding: "1px 6px", borderRadius: 8, fontSize: 9, fontWeight: 600 }}>{tag}</span>;
}

function Bar({ value, max = 100, color = "#60a5fa", label }) {
  return (
    <div style={{ flex: 1, minWidth: 50 }}>
      <div style={{ fontSize: 10, color: "#4a5a78", marginBottom: 2 }}>{label}</div>
      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 4, height: 6, overflow: "hidden" }}>
        <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.3s" }} />
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginTop: 1 }}>{value}</div>
    </div>
  );
}

export default function GaokaoView() {
  const navigate = useNavigate();
  const [majors, setMajors] = useState(BASE_MAJOR_DB);
  const [majorsLoading, setMajorsLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("全部");
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [tab, setTab] = useState("browse");
  const [compareA, setCompareA] = useState(CAREER_DB[0]?.career_name || "");
  const [compareB, setCompareB] = useState(CAREER_DB[1]?.career_name || "");
  const [klineSeries, setKlineSeries] = useState([]);
  const [klineLoading, setKlineLoading] = useState(false);
  const [klineError, setKlineError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadMajors() {
      try {
        const res = await fetch("/api/gaokao/majors");
        if (!res.ok) throw new Error("fetch_failed");
        const data = await res.json();
        if (!cancelled && Array.isArray(data?.majors) && data.majors.length > 0) {
          setMajors(data.majors);
        }
      } catch {
        // fallback to BASE_MAJOR_DB
      } finally {
        if (!cancelled) setMajorsLoading(false);
      }
    }
    loadMajors();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadKline() {
      if (!selectedMajor) {
        setKlineSeries([]);
        setKlineError("");
        return;
      }
      setKlineLoading(true);
      setKlineError("");
      try {
        const res = await fetch(`/api/gaokao/kline/${encodeURIComponent(selectedMajor)}`);
        if (!res.ok) throw new Error("api_failed");
        const data = await res.json();
        if (!cancelled) {
          setKlineSeries(Array.isArray(data?.series) ? data.series : []);
        }
      } catch {
        try {
          const localRes = await fetch("/gaokao/kline_data.json");
          if (!localRes.ok) throw new Error("local_failed");
          const localData = await localRes.json();
          const series = localData?.[selectedMajor] || [];
          if (!cancelled) {
            setKlineSeries(series);
            if (series.length === 0) setKlineError("该专业暂无K线数据");
          }
        } catch {
          if (!cancelled) setKlineError("该专业暂无K线数据");
        }
      } finally {
        if (!cancelled) setKlineLoading(false);
      }
    }
    loadKline();
    return () => { cancelled = true; };
  }, [selectedMajor]);

  const majorMap = useMemo(() => {
    const map = {};
    majors.forEach((m) => { map[m.name] = m; });
    return map;
  }, [majors]);

  const calcMajorCareerMatch = (majorName, careerName) => {
    const m = majorMap[majorName];
    if (!m) return 0;
    if (m.careers?.includes(careerName)) return 95;
    const hit = (m.careers || []).some((c) => careerName.includes(c) || c.includes(careerName));
    return hit ? 75 : 20;
  };

  const filtered = useMemo(() => {
    return majors.filter((m) => {
      if (catFilter !== "全部" && m.category !== catFilter) return false;
      if (search && !m.name.includes(search) && !m.subCategory?.includes(search)) return false;
      if (tagFilter && !(m.tags || []).includes(tagFilter)) return false;
      return true;
    });
  }, [majors, catFilter, search, tagFilter]);
  const hotRank = useMemo(() => majors.slice().sort((a, b) => (b.heat || 0) - (a.heat || 0)).slice(0, 10), [majors]);
  const aiHighRank = useMemo(() => majors.slice().sort((a, b) => (b.aiImpact || 0) - (a.aiImpact || 0)).slice(0, 10), [majors]);
  const salaryRank = useMemo(() => majors.slice().sort((a, b) => (b.salaryTier || 0) - (a.salaryTier || 0)).slice(0, 10), [majors]);
  const stableRank = useMemo(() => majors.slice().sort((a, b) => (b.stability || 0) - (a.stability || 0)).slice(0, 10), [majors]);
  const trendingCareers = useMemo(() => TRENDING_CAREERS.slice(0, 5), []);
  const decliningCareers = useMemo(() => DECLINING_CAREERS.slice(0, 4), []);

  const major = selectedMajor ? majorMap[selectedMajor] : null;

  const matchedCareers = useMemo(() => {
    if (!major) return [];
    return major.careers.map(cName => {
      const career = CAREER_MAP[cName];
      if (!career) return null;
      const series = generateCareerSeries(cName);
      const latest = series[series.length - 1];
      return { ...career, latest, match: calcMajorCareerMatch(major.name, cName) };
    }).filter(Boolean).sort((a, b) => b.match - a.match);
  }, [major]);

  useEffect(() => {
    if (matchedCareers.length >= 2) {
      setCompareA(matchedCareers[0].career_name);
      setCompareB(matchedCareers[1].career_name);
    }
  }, [matchedCareers]);

  const compareData = useMemo(() => {
    const toItem = (name) => {
      if (!name) return null;
      const career = CAREER_MAP[name];
      if (!career) return null;
      const series = generateCareerSeries(name);
      const latest = series[series.length - 1];
      return { ...career, latest };
    };
    const a = toItem(compareA);
    const b = toItem(compareB);
    return { a, b };
  }, [compareA, compareB]);

  const outlook = useMemo(() => {
    if (!major || matchedCareers.length === 0) return null;
    const topCareer = matchedCareers[0];
    const series = generateCareerSeries(topCareer.career_name);
    const latest = series[series.length - 1];
    const prev = series[Math.max(0, series.length - 6)];
    const industryDelta = (latest?.industry_index ?? 0) - (prev?.industry_index ?? 0);
    const avgGrowth = Math.round(matchedCareers.reduce((s, c) => s + (c.growth_score ?? 0), 0) / matchedCareers.length);
    const avgStability = Math.round(matchedCareers.reduce((s, c) => s + (c.stability_score ?? 0), 0) / matchedCareers.length);
    const avgAiRisk = Math.round(matchedCareers.reduce((s, c) => s + (c.ai_replace_risk ?? 0), 0) / matchedCareers.length);
    return {
      industry: latest?.industry || "科技互联网",
      industryDelta,
      avgGrowth,
      avgStability,
      avgAiRisk,
      topCareerName: topCareer.career_name
    };
  }, [major, matchedCareers]);

  const decadeSalary = useMemo(() => {
    if (!major || matchedCareers.length === 0) return [];
    const topCareer = matchedCareers[0];
    const series = generateCareerSeries(topCareer.career_name);
    return series.slice(-10);
  }, [major, matchedCareers]);

  const klineWithForecast = useMemo(() => {
    if (!klineSeries || klineSeries.length < 2) return klineSeries || [];
    const last = klineSeries[klineSeries.length - 1];
    const lastYear = last.year;
    if (lastYear >= 2035) return klineSeries;
    const recent = klineSeries.slice(-5);
    const slope = recent.length >= 2
      ? (recent[recent.length - 1].close - recent[0].close) / (recent.length - 1)
      : 0;
    const damping = 0.5;
    const forecast = [];
    let prevClose = last.close;
    for (let y = lastYear + 1; y <= 2035; y++) {
      const yrsAhead = y - lastYear;
      const dampedSlope = slope * damping * Math.exp(-yrsAhead * 0.08);
      const close = Math.max(30, Math.min(95, prevClose + dampedSlope));
      const open = prevClose;
      const vol = 1.5 + yrsAhead * 0.1;
      const high = Math.max(open, close) + vol;
      const low = Math.min(open, close) - vol;
      forecast.push({ year: y, open, close, high, low, isForecast: true });
      prevClose = close;
    }
    return [...klineSeries, ...forecast];
  }, [klineSeries]);

  const majorKlineOption = useMemo(() => {
    if (!klineWithForecast || klineWithForecast.length === 0) return null;
    const years = klineWithForecast.map((d) => d.year);
    const forecastStart = klineWithForecast.findIndex((d) => d.isForecast);
    const firstForecastYear = forecastStart >= 0 ? klineWithForecast[forecastStart].year : null;
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
        textStyle: { fontSize: 11 },
        backgroundColor: "rgba(15,23,42,0.95)",
        borderColor: "#334155",
        formatter: (params) => {
          if (!params?.length) return "";
          const year = params[0]?.axisValue;
          const isF = Number(year) > 2026;
          const lines = [year + (isF ? "（预测）" : "")];
          params.forEach((p) => {
            const v = p?.value?.value ?? p?.value;
            if (v && Array.isArray(v) && v.length >= 4) {
              lines.push(`${p.seriesName}: 开${Number(v[0]).toFixed(1)} 高${Number(v[3]).toFixed(1)} 低${Number(v[2]).toFixed(1)} 收${Number(v[1]).toFixed(1)}`);
            }
          });
          if (isF) lines.push("⚠️ 2027年后为趋势预测，仅供参考");
          return lines.join("<br/>");
        },
      },
      grid: { left: 52, right: 24, top: 36, bottom: 28 },
      xAxis: {
        type: "category",
        data: years,
        axisLabel: { color: "#7a8ba8" },
        axisLine: { lineStyle: { color: "#1a2540" } },
      },
      yAxis: {
        min: (v) => Math.max(0, v.min - 5),
        max: (v) => Math.min(100, v.max + 5),
        scale: true,
        axisLabel: { color: "#7a8ba8" },
        splitLine: { lineStyle: { color: "#1a2540" } },
      },
      series: [
        {
          name: "专业价值指数K线",
          type: "candlestick",
          data: klineWithForecast.map((d) => ({
            value: [d.open, d.close, d.low, d.high],
            isForecast: Boolean(d.isForecast),
          })),
          itemStyle: {
            color: (params) => (params.data?.isForecast ? "rgba(239,68,68,0.5)" : "#ef4444"),
            color0: (params) => (params.data?.isForecast ? "rgba(34,197,94,0.5)" : "#22c55e"),
            borderColor: (params) => (params.data?.isForecast ? "rgba(239,68,68,0.7)" : "#ef4444"),
            borderColor0: (params) => (params.data?.isForecast ? "rgba(34,197,94,0.7)" : "#22c55e"),
            borderType: (params) => (params.data?.isForecast ? "dashed" : "solid"),
          },
          markLine: firstForecastYear
            ? {
                symbol: "none",
                lineStyle: { type: "dashed", color: "#6366f1", width: 1 },
                label: { formatter: "← 历史 | 预测 →", color: "#94a3b8", fontSize: 10 },
                data: [{ xAxis: firstForecastYear }],
              }
            : { show: false },
          markArea: firstForecastYear
            ? {
                itemStyle: { color: "rgba(99, 102, 241, 0.05)" },
                data: [[{ xAxis: firstForecastYear }, { xAxis: years[years.length - 1] }]],
              }
            : { show: false },
        },
      ],
      title: {
        text: "专业价值指数K线（含未来趋势预测）",
        left: 12,
        top: 4,
        textStyle: { color: "#e2e8f0", fontSize: 12, fontWeight: 600 },
      },
    };
  }, [klineWithForecast]);

  return (
    <>
      <section className="hero">
        <div className="hero-info">
          <div className="hero-title">🎓 高考专业 × 职业K线</div>
          <div className="hero-meta">
            <span>教育部2025版本科专业目录 · 12大门类 · {majors.length}个专业 · 专业→职业趋势匹配</span>
          </div>
        </div>
      </section>

      <div className="filter-row" style={{ marginBottom: 12 }}>
        {[{ k: "browse", l: "📋 专业浏览" }, { k: "ranking", l: "🏆 热门排行" }, { k: "match", l: "🎯 专业→职业匹配" }].map(t => (
          <button key={t.k} className={`pill ${tab === t.k ? "pill-active" : ""}`} onClick={() => setTab(t.k)}>{t.l}</button>
        ))}
      </div>

      {/* ════ 专业浏览 ════ */}
      {tab === "browse" && (
        <>
          <div className="filter-row" style={{ marginBottom: 8 }}>
            <button className={`pill pill-sm ${catFilter === "全部" ? "pill-active" : ""}`} onClick={() => setCatFilter("全部")}>全部</button>
            {MAJOR_CATEGORIES.map(c => (
              <button key={c.key} className={`pill pill-sm ${catFilter === c.key ? "pill-active" : ""}`} onClick={() => setCatFilter(c.key)}>
                {c.icon} {c.key}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
            <input className="search-input" placeholder="搜索专业..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 200, marginBottom: 0 }} />
            {["热门", "冷门", "新专业", "新工科", "国控"].map(t => (
              <button key={t} className={`pill pill-sm ${tagFilter === t ? "pill-active" : ""}`} onClick={() => setTagFilter(tagFilter === t ? "" : t)}>{t}</button>
            ))}
            <span style={{ fontSize: 10, color: "#4a5a78" }}>
              共 {filtered.length} 个专业 {majorsLoading ? "· 数据加载中..." : ""}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 8 }}>
            {filtered.map(m => (
              <button key={m.name} className="trending-card" onClick={() => { setSelectedMajor(m.name); setTab("match"); }}
                style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</span>
                  <span style={{ fontSize: 9, color: "#4a5a78" }}>{m.code}</span>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, color: MAJOR_CATEGORIES.find(c => c.key === m.category)?.color || "#6b7fa0" }}>
                    {MAJOR_CATEGORIES.find(c => c.key === m.category)?.icon} {m.subCategory}
                  </span>
                  {m.tags.map(t => <Tag key={t} tag={t} />)}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Bar value={m.heat} color="#ef4444" label="热度" />
                  <Bar value={m.aiImpact} color="#a78bfa" label="AI影响" />
                  <Bar value={m.stability} color="#22c55e" label="稳定性" />
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ════ 排行 ════ */}
      {tab === "ranking" && (
        <div className="chart-grid">
          {[
            { title: "🔥 报考热度TOP10", data: hotRank, key: "heat", color: "#ef4444" },
            { title: "🤖 AI冲击最大TOP10", data: aiHighRank, key: "aiImpact", color: "#a78bfa" },
            { title: "💰 薪资潜力TOP10", data: salaryRank, key: "salaryTier", color: "#22c55e", max: 5 },
            { title: "🛡️ 就业最稳TOP10", data: stableRank, key: "stability", color: "#60a5fa" },
          ].map(g => (
            <div key={g.title} className="chart-card" style={{ padding: 14 }}>
              <div className="panel-title" style={{ marginBottom: 8 }}>{g.title}</div>
              {g.data.map((m, i) => (
                <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer" }}
                  onClick={() => { setSelectedMajor(m.name); setTab("match"); }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: i < 3 ? g.color : "#4a5a78", width: 20 }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{m.name}</span>
                  <span style={{ fontSize: 10, color: "#4a5a78" }}>{m.category}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: g.color, width: 36, textAlign: "right" }}>{m[g.key]}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ════ 匹配详情 ════ */}
      {tab === "match" && (
        <div className="gaokao-match-layout" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 12, alignItems: "start" }}>
          <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#6b7fa0" }}>选择专业：</span>
            <select value={selectedMajor || ""} onChange={e => setSelectedMajor(e.target.value)}
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0", padding: "8px 10px", borderRadius: 8, fontFamily: "inherit", fontSize: 12, minWidth: 200 }}>
              <option value="">— 请选择 —</option>
              {majors.map(m => <option key={m.name} value={m.name}>{m.name} ({m.category})</option>)}
            </select>
          </div>

          {major ? (
            <>
              <div className="report-card" style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                      {MAJOR_CATEGORIES.find(c => c.key === major.category)?.icon} {major.name}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: 11, color: "#6b7fa0" }}>
                      <span>{major.category} · {major.subCategory} · {major.code}</span>
                      {major.tags.map(t => <Tag key={t} tag={t} />)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[["报考热度", major.heat, "#ef4444"], ["AI影响", major.aiImpact, "#a78bfa"], ["稳定性", major.stability, "#22c55e"], ["薪资", `${major.salaryTier}/5`, "#f59e0b"]].map(([l, v, c]) => (
                      <div key={l} className="metric-card" style={{ minWidth: 75, textAlign: "center" }}>
                        <div className="metric-label">{l}</div>
                        <div className="metric-value" style={{ color: c }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {outlook && (
                <div className="report-card" style={{ marginBottom: 12 }}>
                  <div className="panel-title" style={{ marginBottom: 8 }}>🌍 行业前景分析</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, marginBottom: 10 }}>
                    <div className="metric-card" style={{ minWidth: 160 }}>
                      <div className="metric-label">核心行业</div>
                      <div className="metric-value">{outlook.industry}</div>
                      <div style={{ fontSize: 10, color: "#4a5a78", marginTop: 4 }}>
                        近5年景气度 {outlook.industryDelta >= 0 ? "上升" : "回落"} {Math.abs(outlook.industryDelta).toFixed(1)}
                      </div>
                    </div>
                    <div className="metric-card" style={{ minWidth: 160 }}>
                      <div className="metric-label">成长性均值</div>
                      <div className="metric-value" style={{ color: "#22c55e" }}>{outlook.avgGrowth}/100</div>
                      <div style={{ fontSize: 10, color: "#4a5a78", marginTop: 4 }}>对口职业平均成长分</div>
                    </div>
                    <div className="metric-card" style={{ minWidth: 160 }}>
                      <div className="metric-label">稳定性均值</div>
                      <div className="metric-value" style={{ color: "#60a5fa" }}>{outlook.avgStability}/100</div>
                      <div style={{ fontSize: 10, color: "#4a5a78", marginTop: 4 }}>就业波动越低越稳</div>
                    </div>
                    <div className="metric-card" style={{ minWidth: 160 }}>
                      <div className="metric-label">AI风险均值</div>
                      <div className="metric-value" style={{ color: "#f97316" }}>{outlook.avgAiRisk}/100</div>
                      <div style={{ fontSize: 10, color: "#4a5a78", marginTop: 4 }}>数值越低越安全</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7fa0" }}>
                    对口职业中以「{outlook.topCareerName}」为代表，行业景气度与岗位成长性提供参考。
                  </div>
                </div>
              )}

              <div className="report-card" style={{ marginBottom: 12 }}>
                <div className="panel-title" style={{ marginBottom: 8 }}>📈 专业价值K线</div>
                {klineLoading && (
                  <div style={{ fontSize: 11, color: "#4a5a78" }}>加载中...</div>
                )}
                {!klineLoading && klineError && (
                  <div style={{ fontSize: 11, color: "#f87171" }}>{klineError}</div>
                )}
                {!klineLoading && !klineError && majorKlineOption && (
                  <>
                    <ReactECharts option={majorKlineOption} style={{ height: 320 }} notMerge />
                    <div style={{ fontSize: 10, color: "#6b7fa0", marginTop: 8 }}>
                      2027-2035 为基于近5年趋势的预测区间，虚线表示预测段，仅供参考
                    </div>
                  </>
                )}
                {!klineLoading && !klineError && !majorKlineOption && (
                  <div style={{ fontSize: 11, color: "#4a5a78" }}>暂无K线数据</div>
                )}
              </div>

              {decadeSalary.length > 0 && (
                <div className="report-card" style={{ marginBottom: 12 }}>
                  <div className="panel-title" style={{ marginBottom: 8 }}>💰 毕业后10年薪资K线（参考）</div>
                  <div style={{ fontSize: 10, color: "#6b7fa0", marginBottom: 8 }}>
                    以「{matchedCareers[0]?.career_name}」为基准，展示近10年薪资K线区间（K）
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
                    {decadeSalary.map((d) => (
                      <div key={d.year} className="chart-card" style={{ padding: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 11, color: "#6b7fa0" }}>{d.year}</span>
                          <span style={{ fontSize: 12, fontWeight: 700 }}>{d.salary_median}K</span>
                        </div>
                        <div style={{ display: "flex", gap: 6, fontSize: 10, color: "#4a5a78" }}>
                          <span>开 {d.open}K</span>
                          <span>高 {d.high}K</span>
                          <span>低 {d.low}K</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="panel-title" style={{ marginBottom: 8 }}>🎯 对口职业K线（{matchedCareers.length}个）</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 8, marginBottom: 16 }}>
                {matchedCareers.map(c => (
                  <div key={c.career_name} className="chart-card" style={{ padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 6, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <button
                          className="pill pill-sm"
                          onClick={() => navigate(`/career/${encodeURIComponent(c.career_name)}`)}
                          style={{ fontWeight: 700 }}
                        >
                          {c.career_name}
                        </button>
                        <button className="pill pill-sm" onClick={() => navigate(`/career/${encodeURIComponent(c.career_name)}`)}>
                          📈查看K线
                        </button>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                        background: c.match >= 90 ? "rgba(34,197,94,0.1)" : "rgba(96,165,250,0.1)",
                        color: c.match >= 90 ? "#22c55e" : "#60a5fa" }}>
                        匹配 {c.match}%
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Bar value={c.latest?.hiring_index ?? 0} color="#60a5fa" label="需求" />
                      <Bar value={c.latest?.salary_median ?? 0} color="#22c55e" label="薪资K" />
                      <Bar value={c.ai_replace_risk ?? 0} color="#f97316" label="AI风险" />
                      <Bar value={c.stability_score ?? 0} color="#a78bfa" label="稳定" />
                    </div>
                    <div style={{ fontSize: 10, color: "#4a5a78", marginTop: 4 }}>{c.category} · 成长性 {c.growth_score}/100</div>
                  </div>
                ))}
              </div>

              <div className="report-card">
                <div className="panel-title" style={{ marginBottom: 8 }}>📋 专业 × 职业匹配报告</div>
                <pre className="report-text">
{`📌 专业：${major.name}（${major.category} · ${major.subCategory}）

🔥 报考热度：${major.heat}/100 — ${major.heat >= 75 ? "非常热门，竞争激烈" : major.heat >= 50 ? "中等热度，性价比不错" : "相对冷门，分数门槛低"}

🤖 AI影响度：${major.aiImpact}/100 — ${major.aiImpact >= 60 ? "⚠️ 受AI冲击大，建议强化AI工具能力" : major.aiImpact >= 35 ? "AI影响中等，部分岗位会被重塑" : "✅ 受AI冲击小，核心技能不易被替代"}

💰 薪资潜力：${"★".repeat(major.salaryTier)}${"☆".repeat(5 - major.salaryTier)} — ${major.salaryTier >= 4 ? "高薪资赛道" : major.salaryTier >= 3 ? "薪资中等" : "薪资较低"}

🛡️ 就业稳定性：${major.stability}/100 — ${major.stability >= 75 ? "非常稳定" : major.stability >= 55 ? "中等稳定" : "波动较大"}

🎯 对口职业：${major.careers.join("、")}

💡 综合建议：${major.salaryTier >= 4 && major.aiImpact <= 30 ? "高薪+低AI风险，黄金赛道，优先选择。" : major.heat >= 80 ? "超热门专业，分数够就冲，不够看同门类替代。" : major.stability >= 80 ? "就业稳定，适合求稳考生。" : major.aiImpact >= 60 ? "AI冲击大，在校期间务必学编程和AI工具。" : "综合中等，结合兴趣和地域就业市场选择。"}`}
                </pre>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#4a5a78" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🎓</div>
              <div style={{ fontSize: 14, marginBottom: 4 }}>选择一个专业，查看对口职业K线分析</div>
              <div style={{ fontSize: 11 }}>或在「专业浏览」中点击卡片</div>
            </div>
          )}
          </div>

          <aside className="gaokao-aside" style={{ position: "sticky", top: 68, display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="chart-card" style={{ padding: 12 }}>
              <div className="panel-title" style={{ marginBottom: 8 }}>🚀 热门上升职业</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {trendingCareers.map((c, i) => (
                  <div key={c.career_name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#22c55e", width: 18 }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.career_name}</div>
                      <div style={{ fontSize: 9, color: "#4a5a78" }}>{c.category}</div>
                    </div>
                    <div style={{ fontSize: 10, color: "#4a5a78" }}>{formatSalaryK(c.salary)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card" style={{ padding: 12 }}>
              <div className="panel-title" style={{ marginBottom: 8 }}>⚠️ 需求下降职业</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {decliningCareers.map((c) => (
                  <div key={c.career_name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.career_name}</div>
                      <div style={{ fontSize: 9, color: "#4a5a78" }}>{c.category}</div>
                    </div>
                    <div style={{ fontSize: 10, color: "#ef4444" }}>{c.change.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card" style={{ padding: 12 }}>
              <div className="panel-title" style={{ marginBottom: 8 }}>🧭 功能速达</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button className="pill" onClick={() => {
                  const name = CAREER_DB[0]?.career_name || "";
                  navigate(`/career/${encodeURIComponent(name)}`);
                }}>职业K线</button>
                <button className="pill" onClick={() => navigate("/compare")}>职业对比</button>
                <button className="pill" onClick={() => {
                  const name = COMPANY_LIST[0]?.company || "";
                  navigate(`/company/${encodeURIComponent(name)}`);
                }}>公司用工</button>
              </div>
            </div>

            <div className="chart-card" style={{ padding: 12 }}>
              <div className="panel-title" style={{ marginBottom: 8 }}>⚖️ 职业对比速览</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <select value={compareA} onChange={(e) => setCompareA(e.target.value)}
                  style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0", padding: "6px 8px", borderRadius: 8, fontFamily: "inherit", fontSize: 11 }}>
                  {CAREER_DB.map((c) => <option key={c.career_name} value={c.career_name}>{c.career_name}</option>)}
                </select>
                <select value={compareB} onChange={(e) => setCompareB(e.target.value)}
                  style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0", padding: "6px 8px", borderRadius: 8, fontFamily: "inherit", fontSize: 11 }}>
                  {CAREER_DB.map((c) => <option key={c.career_name} value={c.career_name}>{c.career_name}</option>)}
                </select>
              </div>

              {compareData.a && compareData.b && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { key: "salary", label: "薪资K", get: (c) => c.latest?.salary_median ?? 0, color: "#22c55e" },
                    { key: "hiring", label: "需求", get: (c) => c.latest?.hiring_index ?? 0, color: "#60a5fa" },
                    { key: "ai", label: "AI风险", get: (c) => c.ai_replace_risk ?? 0, color: "#f97316" },
                    { key: "stable", label: "稳定", get: (c) => c.stability_score ?? 0, color: "#a78bfa" },
                  ].map((m) => {
                    const aVal = m.get(compareData.a);
                    const bVal = m.get(compareData.b);
                    const max = Math.max(aVal, bVal, 1);
                    return (
                      <div key={m.key}>
                        <div style={{ fontSize: 10, color: "#4a5a78", marginBottom: 4 }}>{m.label}</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <div style={{ flex: 1 }}>
                            <Bar value={aVal} max={max} color={m.color} label={compareData.a.career_name} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <Bar value={bVal} max={max} color="#f59e0b" label={compareData.b.career_name} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
