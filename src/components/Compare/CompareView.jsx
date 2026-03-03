import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactECharts from "echarts-for-react";
import { CAREER_DB, CAREER_MAP } from "../../data/careers";
import { useCareerData } from "../../hooks/useData";
import { buildCompareRadarOption, buildCompareKlineOption } from "../../utils/chartBuilders";
import { formatSalaryK } from "../../utils/format";
import { FUTURE_TYPES, CAREER_FUTURE_MAP } from "../../data/futureTrends";

function CompareSelect({ label, value, onChange, excludeValue, color }) {
  return (
    <div className="compare-select">
      <span className="compare-select-dot" style={{ background: color }} />
      <span className="compare-select-label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {CAREER_DB.map((c) => (
          <option key={c.career_name} value={c.career_name} disabled={c.career_name === excludeValue}>
            {c.career_name} ({c.category})
          </option>
        ))}
      </select>
    </div>
  );
}

function DiffRow({ label, valA, valB, unit = "", higher = "higher-is-better", format }) {
  const diff = valA - valB;
  const winner = higher === "higher-is-better" ? (diff > 0 ? "A" : diff < 0 ? "B" : null) : (diff < 0 ? "A" : diff > 0 ? "B" : null);
  const displayA = format ? format(valA) : `${valA}${unit}`;
  const displayB = format ? format(valB) : `${valB}${unit}`;
  return (
    <div className="diff-row">
      <span className={`diff-val ${winner === "A" ? "diff-winner" : ""}`}>{displayA}</span>
      <span className="diff-label">{label}</span>
      <span className={`diff-val ${winner === "B" ? "diff-winner" : ""}`}>{displayB}</span>
    </div>
  );
}

export default function CompareView() {
  const navigate = useNavigate();
  const params = useParams();
  const defaultA = CAREER_DB[0]?.career_name;
  const defaultB = CAREER_DB.find((c) => c.category === "AI")?.career_name || CAREER_DB[5]?.career_name;
  const [nameA, setNameA] = useState(defaultA);
  const [nameB, setNameB] = useState(defaultB);

  useEffect(() => {
    const a = params.a ? decodeURIComponent(params.a) : "";
    const b = params.b ? decodeURIComponent(params.b) : "";
    if (a && CAREER_DB.some((c) => c.career_name === a)) {
      setNameA(a);
    }
    if (b && CAREER_DB.some((c) => c.career_name === b)) {
      setNameB(b);
    }
  }, [params.a, params.b]);

  const careerA = CAREER_MAP[nameA];
  const careerB = CAREER_MAP[nameB];
  const { simulated: seriesA } = useCareerData(nameA);
  const { simulated: seriesB } = useCareerData(nameB);

  const radarOption = useMemo(() => buildCompareRadarOption(careerA, careerB), [careerA, careerB]);
  const klineOption = useMemo(() => buildCompareKlineOption(seriesA, seriesB, nameA, nameB), [seriesA, seriesB, nameA, nameB]);
  const futureLineOption = useMemo(() => {
    if (!seriesA.length || !seriesB.length) return null;
    const years = seriesA.map((d) => d.year);
    const aHistory = seriesA.map((d) => (d.year <= 2025 ? d.salary_median : null));
    const aForecast = seriesA.map((d) => (d.year >= 2025 ? d.salary_median : null));
    const bHistory = seriesB.map((d) => (d.year <= 2025 ? d.salary_median : null));
    const bForecast = seriesB.map((d) => (d.year >= 2025 ? d.salary_median : null));
    return {
      backgroundColor: "transparent",
      tooltip: { trigger: "axis" },
      grid: { left: 52, right: 24, top: 40, bottom: 36 },
      xAxis: {
        type: "category",
        data: years,
        axisLabel: { color: "#7a8ba8" },
        axisLine: { lineStyle: { color: "#1a2540" } },
      },
      yAxis: {
        scale: true,
        axisLabel: { color: "#7a8ba8" },
        splitLine: { lineStyle: { color: "#1a2540" } },
      },
      legend: {
        data: [`${nameA} 历史`, `${nameA} 预测`, `${nameB} 历史`, `${nameB} 预测`],
        textStyle: { color: "#7a8ba8", fontSize: 10 },
        top: 4,
        right: 12,
      },
      series: [
        { name: `${nameA} 历史`, type: "line", data: aHistory, smooth: true, symbol: "none", lineStyle: { color: "#60a5fa", width: 2 } },
        { name: `${nameA} 预测`, type: "line", data: aForecast, smooth: true, symbol: "none", lineStyle: { color: "#60a5fa", width: 2, type: "dashed" } },
        { name: `${nameB} 历史`, type: "line", data: bHistory, smooth: true, symbol: "none", lineStyle: { color: "#fb7185", width: 2 } },
        { name: `${nameB} 预测`, type: "line", data: bForecast, smooth: true, symbol: "none", lineStyle: { color: "#fb7185", width: 2, type: "dashed" } },
      ],
      markLine: {
        symbol: "none",
        lineStyle: { type: "dashed", color: "#6366f1", width: 1 },
        label: { formatter: "← 历史 | 预测 →", color: "#94a3b8", fontSize: 10 },
        data: [{ xAxis: 2025 }],
      },
      title: {
        text: "未来10年薪资走势对比",
        left: 12,
        top: 4,
        textStyle: { color: "#e2e8f0", fontSize: 12, fontWeight: 600 },
      },
    };
  }, [seriesA, seriesB, nameA, nameB]);

  const latestA = seriesA[seriesA.length - 1];
  const latestB = seriesB[seriesB.length - 1];
  const futureTypeA = FUTURE_TYPES[CAREER_FUTURE_MAP[nameA] || "NEUTRAL"] || FUTURE_TYPES.NEUTRAL;
  const futureTypeB = FUTURE_TYPES[CAREER_FUTURE_MAP[nameB] || "NEUTRAL"] || FUTURE_TYPES.NEUTRAL;
  const salary2035A = seriesA.find((d) => d.year === 2035)?.salary_median;
  const salary2035B = seriesB.find((d) => d.year === 2035)?.salary_median;
  const demandTrendA = futureTypeA.demandSlope > 0.2 ? "上行" : futureTypeA.demandSlope < -0.2 ? "下行" : "平稳";
  const demandTrendB = futureTypeB.demandSlope > 0.2 ? "上行" : futureTypeB.demandSlope < -0.2 ? "下行" : "平稳";
  const aiLevelA = careerA?.ai_replace_risk >= 70 ? "高" : careerA?.ai_replace_risk >= 45 ? "中" : "低";
  const aiLevelB = careerB?.ai_replace_risk >= 70 ? "高" : careerB?.ai_replace_risk >= 45 ? "中" : "低";

  const advice = (() => {
    if (!careerA || !careerB) return "";
    if (futureTypeA.demandSlope < futureTypeB.demandSlope) {
      return `如果你是${nameA}正在考虑转向${nameB}：短期薪资可能波动，但长期确定性更强。建议在2年内完成技能迁移，并关注行业转型窗口。`;
    }
    if (futureTypeA.demandSlope > futureTypeB.demandSlope) {
      return `如果你在${nameA}与${nameB}之间选择：${nameA}的长期趋势更占优，但需要持续技能升级来对冲分化风险。`;
    }
    return `两个职业的长期趋势接近，建议根据个人技能结构与兴趣做取舍，优先选择成长性更高的一方。`;
  })();

  return (
    <>
      <section className="hero">
        <div className="hero-info">
          <div className="hero-title">⚖️ 职业对比分析</div>
          <div className="hero-meta">
            <span>选择两个职业，用数据辅助你的职业决策</span>
          </div>
        </div>
      </section>

      <section className="compare-selects">
        <CompareSelect label="职业 A" value={nameA} onChange={(val) => {
          setNameA(val);
          navigate(`/compare/${encodeURIComponent(val)}/${encodeURIComponent(nameB)}`);
        }} excludeValue={nameB} color="#60a5fa" />
        <div className="compare-vs">VS</div>
        <CompareSelect label="职业 B" value={nameB} onChange={(val) => {
          setNameB(val);
          navigate(`/compare/${encodeURIComponent(nameA)}/${encodeURIComponent(val)}`);
        }} excludeValue={nameA} color="#fb7185" />
      </section>

      <section className="chart-grid">
        <div className="chart-card chart-span-2">
          <ReactECharts option={klineOption} style={{ height: 340 }} notMerge />
        </div>
        <div className="chart-card">
          <ReactECharts option={radarOption} style={{ height: 340 }} notMerge />
        </div>
        <div className="chart-card compare-diff-card">
          <div className="panel-title">📊 关键指标对比</div>
          <div className="diff-header">
            <span className="diff-name" style={{ color: "#60a5fa" }}>{nameA}</span>
            <span className="diff-name" style={{ color: "#fb7185" }}>{nameB}</span>
          </div>
          {careerA && careerB && (
            <div className="diff-table">
              <DiffRow label="成长性" valA={careerA.growth_score} valB={careerB.growth_score} />
              <DiffRow label="稳定性" valA={careerA.stability_score} valB={careerB.stability_score} />
              <DiffRow label="AI替代风险" valA={careerA.ai_replace_risk} valB={careerB.ai_replace_risk} higher="lower-is-better" />
              <DiffRow label="招聘指数" valA={latestA?.hiring_index ?? 0} valB={latestB?.hiring_index ?? 0} />
              <DiffRow label="薪资中位数" valA={latestA?.salary_median ?? 0} valB={latestB?.salary_median ?? 0} format={formatSalaryK} />
            </div>
          )}
        </div>
      </section>

      {futureLineOption && (
        <section className="chart-grid">
          <div className="chart-card chart-span-2">
            <ReactECharts option={futureLineOption} style={{ height: 340 }} notMerge />
          </div>
          <div className="chart-card">
            <div className="panel-title">🔮 未来走势对比</div>
            <div className="diff-table" style={{ marginTop: 8 }}>
              <DiffRow label="未来趋势类型" valA={`${futureTypeA.emoji} ${futureTypeA.label}`} valB={`${futureTypeB.emoji} ${futureTypeB.label}`} />
              <DiffRow label="2035预测薪资" valA={salary2035A ?? 0} valB={salary2035B ?? 0} format={formatSalaryK} />
              <DiffRow label="需求趋势" valA={demandTrendA} valB={demandTrendB} />
              <DiffRow label="AI冲击等级" valA={aiLevelA} valB={aiLevelB} />
            </div>
            {advice && (
              <div style={{ marginTop: 10, fontSize: 11, color: "#6b7fa0", lineHeight: 1.6 }}>
                {advice}
              </div>
            )}
          </div>
        </section>
      )}

      {careerA && careerB && (
        <section className="report-card">
          <div className="panel-title">📋 对比分析摘要</div>
          <pre className="report-text">
{`【成长性】${nameA} (${careerA.growth_score}/100) vs ${nameB} (${careerB.growth_score}/100)
  → ${careerA.growth_score > careerB.growth_score ? nameA : nameB} 的长期增长潜力更强。

【稳定性】${nameA} (${careerA.stability_score}/100) vs ${nameB} (${careerB.stability_score}/100)
  → ${careerA.stability_score > careerB.stability_score ? nameA : nameB} 的职业稳定性更高，适合风险偏好低的求职者。

【AI冲击】${nameA} (${careerA.ai_replace_risk}/100) vs ${nameB} (${careerB.ai_replace_risk}/100)
  → ${careerA.ai_replace_risk < careerB.ai_replace_risk ? nameA : nameB} 受AI冲击更小，抗替代能力更强。

【薪资趋势】${nameA} (${formatSalaryK(latestA?.salary_median)}) vs ${nameB} (${formatSalaryK(latestB?.salary_median)})
  → ${(latestA?.salary_median ?? 0) > (latestB?.salary_median ?? 0) ? nameA : nameB} 当前薪资中位数更高。

【综合建议】如果追求高成长高收入，${careerA.growth_score > careerB.growth_score ? nameA : nameB} 更有优势；如果更看重稳定和低风险，${careerA.stability_score > careerB.stability_score ? nameA : nameB} 是更安全的选择。`}
          </pre>
        </section>
      )}
    </>
  );
}
