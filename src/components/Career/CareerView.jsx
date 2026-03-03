import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { CAREER_MAP } from "../../data/careers";
import { useCareerData, useFilteredSeries, useIndustryData } from "../../hooks/useData";
import { buildKlineOption, buildIndustryOption, buildRadarOption } from "../../utils/chartBuilders";
import { formatSalaryK } from "../../utils/format";
import { buildCareerReport, buildProReport } from "../../engine/report";
import { FUTURE_TYPES, CAREER_FUTURE_MAP } from "../../data/futureTrends";
import { TIME_RANGES } from "../../utils/constants";
import MetricCard from "../shared/MetricCard";
import DataSourceBadge from "../shared/DataSourceBadge";

export default function CareerView({ careerName, timeRange, setTimeRange, onShare, onOpenPricing }) {
  const career = CAREER_MAP[careerName];
  const { normalized, simulated, source: careerSource, loading: loadingCareer } = useCareerData(careerName);
  const filtered = useFilteredSeries(normalized, timeRange);
  const [isPro, setIsPro] = useState(false);
  const [entitlementLoading, setEntitlementLoading] = useState(false);
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [showForecast, setShowForecast] = useState(true);

  const industryName = simulated[simulated.length - 1]?.industry || "科技互联网";
  const { series: industrySeries, source: industrySource, loading: loadingIndustry } = useIndustryData(industryName);

  const klineOption = useMemo(
    () => buildKlineOption(filtered, careerName, showForecast),
    [filtered, careerName, showForecast]
  );
  const industryOption = useMemo(() => buildIndustryOption(industrySeries), [industrySeries]);
  const radarOption = useMemo(() => buildRadarOption(career), [career]);
  const reportText = useMemo(
    () => (isPro ? buildProReport(career, normalized) : buildCareerReport(career, normalized)),
    [career, normalized, isPro]
  );
  const reportSections = useMemo(
    () => (reportText ? reportText.split("\n\n").filter(Boolean) : []),
    [reportText]
  );

  const latest = filtered[filtered.length - 1];
  const latestIndustry = industrySeries[industrySeries.length - 1];
  const sourceTag = (() => {
    const src = career?.dataSource || "D";
    if (src === "A" || src === "B") return { text: "✅ 智联实采", color: "#22c55e", bg: "rgba(34,197,94,0.08)" };
    if (src === "C") return { text: "⚠️ 少量样本", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" };
    if (src === "M") return { text: "📊 统计局估算", color: "#60a5fa", bg: "rgba(96,165,250,0.08)" };
    return { text: "🔮 AI模型推算", color: "#94a3b8", bg: "rgba(148,163,184,0.08)" };
  })();
  const futureTypeKey = CAREER_FUTURE_MAP[careerName] || "NEUTRAL";
  const futureType = FUTURE_TYPES[futureTypeKey] || FUTURE_TYPES.NEUTRAL;

  useEffect(() => {
    let cancelled = false;
    async function loadEntitlements() {
      // 管理员（已输入 ADMIN_TOKEN）可直接查看完整报告
      const adminToken = localStorage.getItem("ckl_admin_token") || "";
      if (adminToken) {
        setIsPro(true);
        setEntitlementLoading(false);
        return;
      }
      const token = localStorage.getItem("auth_token") || "";
      if (!token) {
        setIsPro(false);
        return;
      }
      setEntitlementLoading(true);
      try {
        const res = await fetch(`/api/entitlements?career=${encodeURIComponent(careerName)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled) {
          setIsPro(Boolean(data?.singleReport));
        }
      } catch {
        if (!cancelled) setIsPro(false);
      } finally {
        if (!cancelled) setEntitlementLoading(false);
      }
    }
    loadEntitlements();
    return () => { cancelled = true; };
  }, [careerName]);

  useEffect(() => {
    if (!isPro && (timeRange === "10Y" || timeRange === "ALL")) {
      setTimeRange("5Y");
    }
  }, [isPro, timeRange, setTimeRange]);

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-info">
          <div className="hero-title-row">
            <div className="hero-title">{careerName}</div>
            <div className="hero-actions">
              <button className="hero-action-btn" onClick={onShare} title="分享职业卡片">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                <span>分享</span>
              </button>
              <button className="hero-action-btn hero-action-pro" onClick={() => onOpenPricing("report")} title="生成深度报告">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span>深度报告</span>
                <span className="pro-badge">PRO</span>
              </button>
            </div>
          </div>
          <div className="hero-meta">
            <span className="hero-category">{career?.category}</span>
            {latestIndustry && <span>行业：{latestIndustry.industry || industryName}</span>}
            <DataSourceBadge loading={loadingCareer} source={careerSource} />
            <DataSourceBadge loading={loadingIndustry} source={industrySource} label="行业源" />
            <span style={{
              padding: "2px 8px",
              borderRadius: 10,
              fontSize: 10,
              color: futureType.color,
              background: `${futureType.color}20`,
              border: `1px solid ${futureType.color}33`,
            }}>
              {futureType.emoji} {futureType.label}
            </span>
            <span style={{
              padding: "2px 8px",
              borderRadius: 10,
              fontSize: 10,
              color: sourceTag.color,
              background: sourceTag.bg,
              border: `1px solid ${sourceTag.color}33`,
            }}>
              {sourceTag.text}
            </span>
          </div>
        </div>
        <div className="hero-metrics">
          <MetricCard label="招聘指数" value={latest?.hiring_index} color="#60a5fa" />
          <MetricCard label="薪资中位数" value={latest ? formatSalaryK(latest.salary_median) : null} color="#22c55e" />
          <MetricCard label="AI冲击指数" value={career?.ai_replace_risk} color="#f97316" />
          <MetricCard label="稳定性评分" value={career?.stability_score} color="#a78bfa" />
        </div>
      </section>

      {/* ── Charts ── */}
      <section className="chart-grid">
        <div className="chart-card chart-span-2">
          <div className="chart-toolbar">
            <div className="filter-row">
              {TIME_RANGES.map((item) => (
                <button
                  key={item.label}
                  className={`pill pill-sm ${timeRange === item.label ? "pill-active" : ""}`}
                  onClick={() => {
                    if (!isPro && (item.label === "10Y" || item.label === "ALL")) {
                      onOpenPricing("report");
                      return;
                    }
                    setTimeRange(item.label);
                  }}
                >
                  {item.label}
                </button>
              ))}
              <button
                className={`pill pill-sm ${showForecast ? "pill-active" : ""}`}
                onClick={() => setShowForecast((v) => !v)}
              >
                {showForecast ? "隐藏预测" : "显示预测"}
              </button>
            </div>
          </div>
          <ReactECharts option={klineOption} style={{ height: 340 }} notMerge />
        </div>
        <div className="chart-card">
          <ReactECharts option={radarOption} style={{ height: 340 }} notMerge />
        </div>
        <div className="chart-card">
          <ReactECharts option={industryOption} style={{ height: 340 }} notMerge />
        </div>
      </section>

      {/* ── Report ── */}
      {reportText && (
        <section className="report-card">
          <div className="report-header">
            <div className="panel-title">📋 职业未来10年K线分析报告</div>
            <button className="pill pill-sm pill-ai" onClick={() => onOpenPricing("report")}>
              🔮 生成AI深度报告 <span className="pro-badge">PRO</span>
            </button>
          </div>
          {isPro ? (
            <pre className="report-text">{reportText}</pre>
          ) : (
            <div>
              <pre className="report-text">{reportSections.slice(0, 2).join("\n\n")}</pre>
              <div className="report-blur">
                <pre className="report-text">{reportSections.slice(2).join("\n\n")}</pre>
                <div className="report-unlock">
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>
                    {entitlementLoading ? "验证权益中..." : "解锁完整报告，获取更深度的职业分析"}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <button className="pill pill-ai" onClick={() => onOpenPricing("report")}>
                      🔓 解锁完整报告
                    </button>
                    <button
                      className="pill pill-sm"
                      style={{ background: "rgba(148,163,184,0.15)", color: "#94a3b8", fontSize: 10 }}
                      onClick={() => setShowAdminInput((v) => !v)}
                    >
                      🔑 管理员
                    </button>
                  </div>
                  {showAdminInput && (
                    <div style={{ marginTop: 10, display: "flex", gap: 6, alignItems: "center" }}>
                      <input
                        type="password"
                        placeholder="输入 ADMIN_TOKEN"
                        value={adminInput}
                        onChange={(e) => setAdminInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (localStorage.setItem("ckl_admin_token", adminInput), setIsPro(true), setShowAdminInput(false))}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: "1px solid rgba(148,163,184,0.3)",
                          background: "rgba(0,0,0,0.2)",
                          color: "#e2e8f0",
                          fontSize: 11,
                          width: 180,
                        }}
                      />
                      <button
                        className="pill pill-sm"
                        onClick={() => {
                          if (adminInput) {
                            localStorage.setItem("ckl_admin_token", adminInput);
                            setIsPro(true);
                            setShowAdminInput(false);
                          }
                        }}
                      >
                        确认
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="report-footnote">
            数据说明：薪资中位数基于智联招聘2025年{career?.samples ?? "若干"}条岗位数据 / 国家统计局2024年数据 / AI趋势模型推算。
            历史趋势基于GDP增速与行业周期建模。仅供参考，不构成任何投资或择业建议。
          </div>
        </section>
      )}
    </>
  );
}
