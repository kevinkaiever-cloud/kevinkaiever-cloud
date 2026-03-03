import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatSalaryK } from "../../utils/format";
import { TRENDING_CAREERS, DECLINING_CAREERS } from "../../data/trendingCache";
import { FUTURE_TYPES, CAREER_FUTURE_MAP } from "../../data/futureTrends";
import { CAREER_DB } from "../../data/careers";
import useAppStore from "../../store/useAppStore";

export default function LandingHero() {
  const navigate = useNavigate();
  const selectCareer = useAppStore((s) => s.selectCareer);
  const setAiOpen = useAppStore((s) => s.setAiOpen);
  const [expandedType, setExpandedType] = useState("");
  const trending = TRENDING_CAREERS.slice(0, 6);
  const declining = DECLINING_CAREERS.slice(0, 4);

  const typeOrder = [
    "AI_BOOST", "AGING_BOOM", "MEDICAL", "PHYSICAL_SKILL",
    "CRAFT", "TRUST", "GREEN", "HARD_TECH", "FIN_HIGH",
    "NEUTRAL",
    "AI_SPLIT", "DEMO_SHRINK", "ECOM_PEAK", "TRANSPORT",
    "FINTECH", "REAL_ESTATE", "GOV", "AI_REPLACE",
  ];
  const typeEntries = typeOrder
    .filter((key) => FUTURE_TYPES[key])
    .map((key) => {
      const careers = CAREER_DB.filter((c) => (CAREER_FUTURE_MAP[c.career_name] || "NEUTRAL") === key);
      const type = FUTURE_TYPES[key];
      const trendScore = (type.demandSlope || 0) + (type.salarySlope || 0);
      return { key, type, careers, trendScore };
    });

  return (
    <section className="landing">
      {/* ── Main hero ── */}
      <div className="landing-hero">
        <div className="landing-badge">🔥 覆盖 200+ 职业 · 20年数据 · AI驱动分析</div>
        <h1 className="landing-h1">
          用<span className="landing-accent">K线</span>看懂你的职业未来
        </h1>
        <p className="landing-desc">
          薪资趋势、招聘需求、AI替代风险、行业景气度 — 像炒股一样分析职业走势，用数据做出更好的职业决策。
        </p>
        <div className="landing-ctas">
          <button className="landing-btn landing-btn-primary" onClick={() => {
            const name = useAppStore.getState().careerName;
            navigate(`/career/${encodeURIComponent(name)}`);
          }}>
            开始分析 →
          </button>
          <button className="landing-btn landing-btn-secondary" onClick={() => navigate("/gaokao")}>
            🎓 高考选专业
          </button>
          <button className="landing-btn landing-btn-secondary" onClick={() => {
            const name = useAppStore.getState().careerName;
            navigate(`/career/${encodeURIComponent(name)}`);
            setAiOpen(true);
          }}>
            🧠 AI职业顾问
          </button>
        </div>
        <div className="landing-stats">
          <div className="landing-stat">
            <span className="landing-stat-num">200+</span>
            <span className="landing-stat-label">职业数据</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-num">20年</span>
            <span className="landing-stat-label">趋势回溯</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-num">5大</span>
            <span className="landing-stat-label">行业分类</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-num">AI</span>
            <span className="landing-stat-label">智能分析</span>
          </div>
        </div>
      </div>

      {/* ── Trending careers ── */}
      <div className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-h2">🚀 热门上升职业</h2>
          <span className="landing-section-sub">近年需求指数增长最快</span>
        </div>
        <div className="trending-grid">
          {trending.map((c, i) => (
            <button key={c.career_name} className="trending-card" onClick={() => { selectCareer(c.career_name); navigate(`/career/${encodeURIComponent(c.career_name)}`); }}>
              <div className="trending-rank">#{i + 1}</div>
              <div className="trending-info">
                <div className="trending-name">{c.career_name}</div>
                <div className="trending-meta">
                  <span className={`career-tag tag-${c.category}`}>{c.category}</span>
                  <span className="trending-salary">{formatSalaryK(c.salary)}</span>
                </div>
              </div>
              <div className="trending-change trending-up">+{c.change.toFixed(1)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Future trend map ── */}
      <div className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-h2">🔮 未来十年职业趋势地图</h2>
          <span className="landing-section-sub">
            基于AI替代浪潮、人口结构变化、产业政策三大力量，我们将289个职业划分为16种未来趋势类型。
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
          {typeEntries.map(({ key, type, careers, trendScore }) => {
            const isUp = trendScore > 0.2;
            const isDown = trendScore < -0.2;
            const borderColor = isUp ? "rgba(34,197,94,0.4)" : isDown ? "rgba(239,68,68,0.4)" : "rgba(148,163,184,0.4)";
            const arrow = isUp ? "📈" : isDown ? "📉" : "➡️";
            const sample = careers.slice(0, 5);
            const expanded = expandedType === key;
            return (
              <div key={key} className="chart-card" style={{ borderLeft: `3px solid ${borderColor}`, padding: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: type.color }}>
                    {type.emoji} {type.label}
                    <span style={{ marginLeft: 6, fontSize: 10, color: "#4a5a78" }}>({careers.length})</span>
                  </div>
                  <button className="pill pill-sm" onClick={() => setExpandedType(expanded ? "" : key)}>
                    {expanded ? "收起" : "展开"}
                  </button>
                </div>
                <div style={{ fontSize: 10, color: "#4a5a78", marginBottom: 6 }}>{arrow} 趋势方向</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(expanded ? careers : sample).map((c) => (
                    <button
                      key={c.career_name}
                      className="pill pill-sm"
                      onClick={() => {
                        selectCareer(c.career_name);
                        navigate(`/career/${encodeURIComponent(c.career_name)}`);
                      }}
                    >
                      {c.career_name}
                    </button>
                  ))}
                  {careers.length === 0 && (
                    <span style={{ fontSize: 10, color: "#4a5a78" }}>暂无职业</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Declining careers ── */}
      <div className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-h2">⚠️ 需求下降职业</h2>
          <span className="landing-section-sub">近年需求指数降幅最大 · 提前规划转型</span>
        </div>
        <div className="trending-grid trending-grid-sm">
          {declining.map((c) => (
            <button key={c.career_name} className="trending-card trending-card-warn" onClick={() => { selectCareer(c.career_name); navigate(`/career/${encodeURIComponent(c.career_name)}`); }}>
              <div className="trending-info">
                <div className="trending-name">{c.career_name}</div>
                <div className="trending-meta">
                  <span className={`career-tag tag-${c.category}`}>{c.category}</span>
                  <span className="trending-salary">{formatSalaryK(c.salary)}</span>
                </div>
              </div>
              <div className="trending-change trending-down">{c.change.toFixed(1)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Features / value prop ── */}
      <div className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-h2">💡 你能做什么</h2>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <div className="feature-title">职业K线</div>
            <div className="feature-desc">像看股票一样查看任何职业的20年薪资与需求走势</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚖️</div>
            <div className="feature-title">职业对比</div>
            <div className="feature-desc">任意两个职业的雷达图、趋势线、核心指标一键对比</div>
          </div>
          <div className="feature-card feature-card-highlight" onClick={() => navigate("/gaokao")} style={{ cursor: "pointer" }}>
            <div className="feature-icon">🎓</div>
            <div className="feature-title">高考选专业</div>
            <div className="feature-desc">845个本科专业 × 职业K线智能匹配，用数据选对专业不踩坑</div>
            <div className="feature-badge" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>HOT</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <div className="feature-title">AI职业顾问</div>
            <div className="feature-desc">基于实时数据的AI对话，帮你分析转行风险与最优路径</div>
          </div>
          <div className="feature-card feature-card-highlight">
            <div className="feature-icon">🔮</div>
            <div className="feature-title">天赋 × 趋势分析</div>
            <div className="feature-desc">结合传统命理智慧，发现你的性格天赋与职业趋势的最佳交叉点</div>
            <div className="feature-badge">即将上线</div>
          </div>
        </div>
      </div>
    </section>
  );
}
