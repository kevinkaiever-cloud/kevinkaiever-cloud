import { useState, useMemo, useEffect, useRef } from "react";
import "./App.css";

// ═══════════════════════════════════════════════════════════════
// REALISTIC DATA GENERATION ENGINE
// ═══════════════════════════════════════════════════════════════

const CAREERS = {
  "AI算法工程师": { base: [25, 50], growth: 0.18, volatility: 0.12, season: [1.05, 1.02, 1.08, 1.0], demandBase: 82, category: "tech" },
  "后端开发工程师": { base: [15, 30], growth: 0.06, volatility: 0.08, season: [1.03, 0.98, 1.05, 0.97], demandBase: 75, category: "tech" },
  "前端开发工程师": { base: [13, 28], growth: 0.04, volatility: 0.09, season: [1.02, 0.97, 1.04, 0.96], demandBase: 70, category: "tech" },
  "数据分析师": { base: [12, 24], growth: 0.08, volatility: 0.07, season: [1.01, 1.0, 1.03, 0.98], demandBase: 73, category: "tech" },
  "产品经理": { base: [14, 28], growth: 0.05, volatility: 0.10, season: [1.02, 0.99, 1.04, 0.98], demandBase: 68, category: "tech" },
  "UI/UX设计师": { base: [10, 22], growth: 0.03, volatility: 0.08, season: [1.01, 0.98, 1.03, 0.97], demandBase: 58, category: "tech" },
  "网络安全工程师": { base: [18, 35], growth: 0.12, volatility: 0.09, season: [1.02, 1.01, 1.05, 1.0], demandBase: 78, category: "tech" },
  "云计算架构师": { base: [25, 45], growth: 0.10, volatility: 0.08, season: [1.03, 1.0, 1.04, 0.99], demandBase: 76, category: "tech" },
  "新能源电池工程师": { base: [15, 30], growth: 0.14, volatility: 0.11, season: [1.04, 1.01, 1.06, 0.98], demandBase: 80, category: "energy" },
  "光伏研发工程师": { base: [14, 28], growth: 0.11, volatility: 0.10, season: [1.03, 1.0, 1.05, 0.97], demandBase: 74, category: "energy" },
  "储能系统工程师": { base: [16, 32], growth: 0.13, volatility: 0.09, season: [1.03, 1.01, 1.04, 0.99], demandBase: 77, category: "energy" },
  "临床医生": { base: [12, 30], growth: 0.04, volatility: 0.05, season: [1.0, 1.0, 1.01, 1.0], demandBase: 85, category: "medical" },
  "护理人员": { base: [6, 12], growth: 0.03, volatility: 0.04, season: [1.0, 0.99, 1.01, 1.0], demandBase: 90, category: "medical" },
  "药剂师": { base: [8, 16], growth: 0.03, volatility: 0.04, season: [1.0, 1.0, 1.01, 0.99], demandBase: 72, category: "medical" },
  "银行客户经理": { base: [8, 18], growth: -0.02, volatility: 0.07, season: [1.02, 0.96, 1.01, 1.03], demandBase: 45, category: "finance" },
  "基金经理": { base: [30, 80], growth: 0.03, volatility: 0.18, season: [1.05, 0.92, 1.08, 0.95], demandBase: 40, category: "finance" },
  "风控分析师": { base: [15, 30], growth: 0.06, volatility: 0.08, season: [1.02, 0.98, 1.03, 0.99], demandBase: 65, category: "finance" },
  "机械工程师": { base: [10, 20], growth: 0.02, volatility: 0.06, season: [1.01, 0.98, 1.02, 0.97], demandBase: 55, category: "manufacturing" },
  "质量工程师": { base: [8, 16], growth: 0.02, volatility: 0.05, season: [1.0, 0.99, 1.01, 0.98], demandBase: 52, category: "manufacturing" },
  "供应链经理": { base: [12, 25], growth: 0.04, volatility: 0.07, season: [1.02, 0.97, 1.03, 1.01], demandBase: 60, category: "manufacturing" },
  "中学教师": { base: [6, 12], growth: 0.02, volatility: 0.03, season: [0.98, 1.05, 0.99, 1.02], demandBase: 65, category: "education" },
  "大学讲师": { base: [10, 20], growth: 0.03, volatility: 0.04, season: [0.99, 1.04, 0.98, 1.03], demandBase: 35, category: "education" },
  "在线教育运营": { base: [10, 20], growth: -0.05, volatility: 0.15, season: [1.02, 0.95, 1.05, 0.98], demandBase: 42, category: "education" },
  "外卖骑手": { base: [5, 10], growth: 0.01, volatility: 0.12, season: [0.95, 1.08, 0.97, 1.05], demandBase: 88, category: "service" },
  "直播电商运营": { base: [8, 25], growth: 0.10, volatility: 0.20, season: [1.0, 0.95, 1.02, 1.12], demandBase: 72, category: "service" },
};

const CITIES = {
  "全国": 1.0, "北京": 1.35, "上海": 1.30, "深圳": 1.25, "杭州": 1.15,
  "广州": 1.10, "成都": 0.85, "武汉": 0.82, "南京": 0.95, "西安": 0.78,
  "长沙": 0.75, "重庆": 0.78, "苏州": 0.92, "合肥": 0.75, "郑州": 0.72,
};

const CATEGORIES = {
  tech: { label: "科技互联网", color: "#00d4aa", icon: "💻" },
  energy: { label: "新能源", color: "#fbbf24", icon: "⚡" },
  medical: { label: "医疗健康", color: "#f472b6", icon: "🏥" },
  finance: { label: "金融", color: "#60a5fa", icon: "💰" },
  manufacturing: { label: "制造业", color: "#a78bfa", icon: "🏭" },
  education: { label: "教育", color: "#34d399", icon: "📚" },
  service: { label: "服务/新零售", color: "#fb923c", icon: "🛒" },
};

/**
 * Custom hook that memoizes career data generation.  Because
 * generateCareerData is a relatively expensive operation, calling it on
 * every re-render of the component can noticeably impact performance.
 * This hook wraps the call in a useMemo so that the data is only
 * recomputed when the selected career or city change.  Extracting
 * this logic into its own hook also improves readability in the main
 * component.
 *
 * @param {string} careerName The name of the career to generate data for
 * @param {string} city The city to generate data for
 * @returns {Array} Generated time series data for the given career and city
 */
function useCareerData(careerName, city) {
  return useMemo(() => generateCareerData(careerName, city), [careerName, city]);
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateCareerData(careerName, city, months = 30) {
  const career = CAREERS[careerName];
  if (!career) return [];
  const cityMult = CITIES[city] || 1.0;
  const seed = [...(careerName + city)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = mulberry32(seed);

  const data = [];
  const startDate = new Date(2023, 8, 4);
  let prevClose = ((career.base[0] + career.base[1]) / 2) * cityMult;
  let trend = 0;

  for (let w = 0; w < months * 4.3; w++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + w * 7);
    if (date > new Date(2026, 1, 27)) break;

    const quarter = Math.floor(date.getMonth() / 3);
    const seasonFactor = career.season[quarter];
    const yearProgress = w / (months * 4.3);
    const growthFactor = 1 + career.growth * yearProgress;

    let eventShock = 0;
    if (w === 28) eventShock = -0.04;
    if (w === 42) eventShock = 0.05;
    if (w === 68) eventShock = -0.025;
    if (w === 88) eventShock = 0.035;
    if (w === 110) eventShock = -0.02;

    const baseVal = ((career.base[0] + career.base[1]) / 2) * cityMult * growthFactor * seasonFactor;
    const reversion = (baseVal - prevClose) * 0.04;
    trend = trend * 0.9 + (rand() - 0.48) * career.volatility * 0.6;
    const noise = (rand() - 0.5) * career.volatility * prevClose * 0.07;
    const change = reversion + trend * prevClose * 0.08 + noise + eventShock * prevClose;
    const close = Math.max(career.base[0] * cityMult * 0.6, prevClose + change);

    const range = (career.base[1] - career.base[0]) * cityMult;
    const daySpread = range * (0.2 + rand() * 0.35) * (0.7 + career.volatility);
    const open = prevClose + (rand() - 0.5) * daySpread * 0.25;
    const high = Math.max(open, close) + rand() * daySpread * 0.35;
    const low = Math.min(open, close) - rand() * daySpread * 0.35;

    const baseJobs = (career.demandBase * 3 + rand() * career.demandBase * 2) * (city === "全国" ? 8 : 1);
    const jobCount = Math.round(baseJobs * seasonFactor * growthFactor * (1 + (rand() - 0.5) * 0.35));

    const demandNoise = (rand() - 0.5) * 10;
    const demandIndex = Math.min(99, Math.max(10, career.demandBase * seasonFactor * growthFactor + demandNoise));
    const supplyRatio = 0.75 + rand() * 0.65 + (career.demandBase > 70 ? -0.12 : 0.12);

    data.push({
      date: date.toISOString().slice(0, 10),
      open: +open.toFixed(1), close: +close.toFixed(1),
      high: +high.toFixed(1), low: +low.toFixed(1),
      volume: jobCount,
      demandIndex: +demandIndex.toFixed(1),
      supplyRatio: +supplyRatio.toFixed(2),
    });
    prevClose = close;
  }
  return data;
}

function calcMA(data, period) {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return +(slice.reduce((s, d) => s + d.close, 0) / period).toFixed(2);
  });
}

// ═══════════════════════════════════════════════════════════════
// CHART COMPONENT
// ═══════════════════════════════════════════════════════════════

const BULL = "#ef4444";
const BEAR = "#22c55e";

function CandlestickChart({ data, width, height, showMA, hoveredIdx, setHoveredIdx }) {
  const margin = { top: 12, right: 58, bottom: 22, left: 54 };
  const chartW = width - margin.left - margin.right;
  const mainH = height * 0.62;
  const volH = height * 0.2;
  const gap = height * 0.06;

  if (!data || data.length === 0) return <div style={{ padding: 40, textAlign: "center", color: "#475569" }}>暂无数据</div>;

  const prices = data.flatMap(d => [d.high, d.low]);
  const minP = Math.min(...prices) * 0.97;
  const maxP = Math.max(...prices) * 1.03;
  const maxV = Math.max(...data.map(d => d.volume));

  const ma5 = showMA ? calcMA(data, 5) : [];
  const ma20 = showMA ? calcMA(data, 20) : [];
  const ma60 = showMA ? calcMA(data, 60) : [];

  const x = (i) => margin.left + (i / Math.max(1, data.length - 1)) * chartW;
  const y = (v) => margin.top + mainH - ((v - minP) / (maxP - minP || 1)) * mainH;
  const vy = (v) => margin.top + mainH + gap + volH - (v / (maxV || 1)) * volH;
  const cw = Math.max(1, Math.min(9, chartW / data.length * 0.65));

  const gridSteps = 5;
  const pStep = (maxP - minP) / gridSteps;

  function maLine(vals, color) {
    let d = "";
    vals.forEach((v, i) => {
      if (v === null) return;
      d += `${d === "" ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)} `;
    });
    return d ? <path d={d} fill="none" stroke={color} strokeWidth="1.3" opacity="0.75" /> : null;
  }

  return (
    <svg width={width} height={height} style={{ display: "block", cursor: "crosshair" }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mx = e.clientX - rect.left - margin.left;
        const idx = Math.round((mx / chartW) * (data.length - 1));
        if (idx >= 0 && idx < data.length) setHoveredIdx(idx);
      }}
      onMouseLeave={() => setHoveredIdx(-1)}
    >
      {/* Price grid */}
      {Array.from({ length: gridSteps + 1 }, (_, i) => {
        const val = minP + pStep * i;
        const py = y(val);
        return (
          <g key={i}>
            <line x1={margin.left} x2={width - margin.right} y1={py} y2={py} stroke="#1e293b" strokeWidth="0.5" />
            <text x={width - margin.right + 4} y={py + 3.5} fill="#475569" fontSize="9" fontFamily="monospace">{val.toFixed(1)}</text>
          </g>
        );
      })}

      {/* Volume bars */}
      {data.map((d, i) => {
        const bull = d.close >= d.open;
        return (
          <rect key={`v${i}`} x={x(i) - cw / 2} y={vy(d.volume)}
            width={cw} height={Math.max(0, margin.top + mainH + gap + volH - vy(d.volume))}
            fill={bull ? BULL : BEAR} opacity={hoveredIdx === i ? 0.8 : 0.25}
          />
        );
      })}

      {/* Candlesticks */}
      {data.map((d, i) => {
        const bull = d.close >= d.open;
        const col = bull ? BULL : BEAR;
        const cx = x(i);
        const top = y(Math.max(d.open, d.close));
        const bot = y(Math.min(d.open, d.close));
        const bh = Math.max(1, bot - top);
        return (
          <g key={`c${i}`} opacity={hoveredIdx >= 0 ? (hoveredIdx === i ? 1 : 0.6) : 0.85}>
            <line x1={cx} x2={cx} y1={y(d.high)} y2={y(d.low)} stroke={col} strokeWidth="1" />
            <rect x={cx - cw / 2} y={top} width={cw} height={bh}
              fill={bull ? col : "#0f172a"} stroke={col} strokeWidth="1" />
          </g>
        );
      })}

      {/* MA lines */}
      {showMA && maLine(ma5, "#fbbf24")}
      {showMA && maLine(ma20, "#60a5fa")}
      {showMA && maLine(ma60, "#a78bfa")}

      {/* Crosshair */}
      {hoveredIdx >= 0 && hoveredIdx < data.length && (
        <>
          <line x1={x(hoveredIdx)} x2={x(hoveredIdx)} y1={margin.top} y2={margin.top + mainH + gap + volH}
            stroke="#475569" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1={margin.left} x2={width - margin.right}
            y1={y(data[hoveredIdx].close)} y2={y(data[hoveredIdx].close)}
            stroke="#475569" strokeWidth="0.5" strokeDasharray="2,2" />
          <rect x={width - margin.right + 1} y={y(data[hoveredIdx].close) - 8} width="50" height="16" rx="3" fill="#334155" />
          <text x={width - margin.right + 5} y={y(data[hoveredIdx].close) + 3.5}
            fill="#e2e8f0" fontSize="9" fontFamily="monospace">{data[hoveredIdx].close.toFixed(1)}K</text>
        </>
      )}

      {/* Date labels */}
      {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 7)) === 0).map((d) => {
        const idx = data.indexOf(d);
        return (
          <text key={`d${idx}`} x={x(idx)} y={height - 2}
            fill="#475569" fontSize="8" textAnchor="middle" fontFamily="monospace">{d.date.slice(0, 7)}</text>
        );
      })}

      {/* MA Legend */}
      {showMA && (
        <g transform={`translate(${margin.left + 4}, ${margin.top + 2})`}>
          <rect width="175" height="16" rx="3" fill="#0f172a" opacity="0.85" />
          <line x1="6" x2="18" y1="9" y2="9" stroke="#fbbf24" strokeWidth="1.5" />
          <text x="22" y="12" fill="#fbbf24" fontSize="8" fontFamily="monospace">MA5</text>
          <line x1="48" x2="60" y1="9" y2="9" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="64" y="12" fill="#60a5fa" fontSize="8" fontFamily="monospace">MA20</text>
          <line x1="95" x2="107" y1="9" y2="9" stroke="#a78bfa" strokeWidth="1.5" />
          <text x="111" y="12" fill="#a78bfa" fontSize="8" fontFamily="monospace">MA60</text>
        </g>
      )}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// SPARKLINE & GAUGE
// ═══════════════════════════════════════════════════════════════

function Sparkline({ data, width = 60, height = 22, color }) {
  if (!data || data.length < 2) return null;
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - mn) / rng) * (height - 2) - 1}`).join(" ");
  return <svg width={width} height={height}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" /></svg>;
}

function DemandGauge({ value, size = 72 }) {
  const angle = (value / 100) * 180;
  const r = size / 2 - 6;
  const cx = size / 2, cy = size / 2 + 4;
  const color = value > 70 ? "#ef4444" : value > 50 ? "#fbbf24" : "#22c55e";
  const rad = (a) => ((180 + a) * Math.PI) / 180;
  const pt = (a, radius) => ({ x: cx + radius * Math.cos(rad(a)), y: cy + radius * Math.sin(rad(a)) });
  const s = pt(0, r), e = pt(angle, r), bg = pt(180, r);
  return (
    <svg width={size} height={size / 2 + 14}>
      <path d={`M ${pt(0, r).x} ${pt(0, r).y} A ${r} ${r} 0 1 1 ${bg.x} ${bg.y}`} fill="none" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
      <path d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${angle > 180 ? 1 : 0} 1 ${e.x} ${e.y}`} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <text x={cx} y={cy - 1} textAnchor="middle" fill={color} fontSize="14" fontWeight="800" fontFamily="monospace">{value.toFixed(0)}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#64748b" fontSize="7">需求指数</text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

const TIME_RANGES = [
  { label: "1M", months: 1 }, { label: "3M", months: 3 },
  { label: "6M", months: 6 }, { label: "1Y", months: 12 }, { label: "ALL", months: 999 },
];

export default function App() {
  const [career, setCareer] = useState("AI算法工程师");
  const [city, setCity] = useState("全国");
  const [range, setRange] = useState("1Y");
  const [showMA, setShowMA] = useState(true);
  const [hoverIdx, setHoverIdx] = useState(-1);
  const [activeCat, setActiveCat] = useState("all");
  const [compare, setCompare] = useState(false);
  const [compareTo, setCompareTo] = useState("后端开发工程师");
  const [chartW, setChartW] = useState(860);
  const chartRef = useRef(null);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const updateWidth = () => {
      const rect = el.getBoundingClientRect();
      setChartW(Math.max(500, rect.width - 4));
    };
    updateWidth();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }
    const ro = new ResizeObserver((es) => {
      for (const e of es) setChartW(Math.max(500, e.contentRect.width - 4));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Memoize primary and comparison career data using the custom hook.  This
  // prevents generateCareerData from re-running on every render and keeps
  // the main component body concise.
  const fullData = useCareerData(career, city);
  const compareData = useCareerData(compareTo, city);
  const data = useMemo(() => {
    const tr = TIME_RANGES.find((t) => t.label === range);
    if (!tr || tr.months >= 999) return fullData;
    const cut = new Date();
    cut.setMonth(cut.getMonth() - tr.months);
    return fullData.filter((d) => new Date(d.date) >= cut);
  }, [fullData, range]);

  const careerList = useMemo(() => {
    if (activeCat === "all") return Object.keys(CAREERS);
    return Object.keys(CAREERS).filter(c => CAREERS[c].category === activeCat);
  }, [activeCat]);

  const summary = useMemo(() => {
    if (data.length === 0) return null;
    const last = data[data.length - 1];
    const prev = data[Math.max(0, data.length - 5)];
    const first = data[0];
    const ch = last.close - prev.close;
    const chPct = (ch / prev.close) * 100;
    const pCh = last.close - first.close;
    const pPct = (pCh / first.close) * 100;
    const avgVol = Math.round(data.reduce((s, d) => s + d.volume, 0) / data.length);
    const hi = Math.max(...data.map(d => d.high));
    const lo = Math.min(...data.map(d => d.low));
    const avgD = +(data.reduce((s, d) => s + d.demandIndex, 0) / data.length).toFixed(1);
    const avgS = +(data.reduce((s, d) => s + d.supplyRatio, 0) / data.length).toFixed(2);
    return { last, ch, chPct, pCh, pPct, avgVol, hi, lo, avgD, avgS };
  }, [data]);

  const ranking = useMemo(() => {
    // For ranking purposes we only need short-term performance.  Generate
    // approximately three months of data for each career instead of the
    // full series to reduce computation overhead.
    return Object.entries(CAREERS)
      .map(([n, c]) => {
        const d = generateCareerData(n, city, 3);
        if (d.length < 2) return null;
        const lastIdx = d.length - 1;
        const prevIdx = Math.max(0, d.length - 13);
        const l = d[lastIdx];
        const p = d[prevIdx];
        return {
          name: n,
          close: l.close,
          ch: ((l.close - p.close) / p.close) * 100,
          demand: l.demandIndex,
          cat: c.category,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.ch - a.ch);
  }, [city]);

  const hd = hoverIdx >= 0 && hoverIdx < data.length ? data[hoverIdx] : null;
  const cfg = CAREERS[career];
  const catInfo = cfg ? CATEGORIES[cfg.category] : null;

  const sty = {
    sel: (active) => ({
      background: active ? "#334155" : "transparent",
      color: active ? "#e2e8f0" : "#64748b",
      border: active ? "1px solid #475569" : "1px solid transparent",
      borderRadius: 5, padding: "4px 11px", fontSize: 11, cursor: "pointer",
      fontWeight: active ? 600 : 400, fontFamily: "inherit",
    }),
    card: (color) => ({
      background: "#1e293b", borderRadius: 8, padding: "10px 14px",
      borderLeft: `3px solid ${color}`,
    }),
    input: {
      background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155",
      borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer",
      outline: "none", fontFamily: "inherit",
    },
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #080c18 0%, #0f172a 40%, #0c1220 100%)",
      color: "#e2e8f0",
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
      fontSize: 13,
    }}>
      {/* ─── HEADER ─── */}
      <div style={{
        borderBottom: "1px solid #1e293b", padding: "10px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
        background: "rgba(15,23,42,0.8)", backdropFilter: "blur(8px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 7,
            background: "linear-gradient(135deg, #ef4444, #f97316)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900, color: "#fff",
          }}>K</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.5 }}>职业K线 · Career KLine</div>
            <div style={{ fontSize: 9, color: "#475569" }}>职业市场供需薪资趋势分析平台</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <select value={city} onChange={e => setCity(e.target.value)} style={sty.input}>
            {Object.keys(CITIES).map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={() => setShowMA(!showMA)} style={{
            ...sty.input, color: showMA ? "#fbbf24" : "#64748b",
            background: showMA ? "#33415580" : "#1e293b",
          }}>MA均线</button>
          <button onClick={() => setCompare(!compare)} style={{
            ...sty.input, color: compare ? "#60a5fa" : "#64748b",
            background: compare ? "#33415580" : "#1e293b",
          }}>对比模式</button>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 55px)" }}>
        {/* ─── SIDEBAR ─── */}
        <div style={{
          width: 215, minWidth: 215, borderRight: "1px solid #1e293b",
          overflowY: "auto", maxHeight: "calc(100vh - 55px)",
          background: "rgba(15,23,42,0.4)",
        }}>
          <div style={{ padding: "8px 10px 6px", display: "flex", flexWrap: "wrap", gap: 3 }}>
            <button onClick={() => setActiveCat("all")} style={{
              ...sty.sel(activeCat === "all"), padding: "2px 7px", fontSize: 9,
            }}>全部</button>
            {Object.entries(CATEGORIES).map(([k, c]) => (
              <button key={k} onClick={() => setActiveCat(k)} style={{
                ...sty.sel(activeCat === k), padding: "2px 7px", fontSize: 9,
                color: activeCat === k ? c.color : "#64748b",
              }}>{c.icon}{c.label}</button>
            ))}
          </div>
          {careerList.map(name => {
            const c = CAREERS[name], cat = CATEGORIES[c.category];
            const active = name === career;
            // Generate only a few months of data for sidebar summaries to avoid
            // recomputing the full multi-year series on every render.  Three
            // months is sufficient to calculate recent changes and sparkline.
            const d = generateCareerData(name, city, 3);
            const l = d[d.length - 1], p = d.length > 4 ? d[d.length - 5] : d[0];
            const ch = l && p ? ((l.close - p.close) / p.close * 100) : 0;
            return (
              <div key={name} onClick={() => setCareer(name)} style={{
                padding: "7px 10px", cursor: "pointer",
                background: active ? "#1e293b" : "transparent",
                borderLeft: active ? `3px solid ${cat.color}` : "3px solid transparent",
                transition: "all 0.12s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? "#f1f5f9" : "#94a3b8" }}>{name}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: ch >= 0 ? BULL : BEAR }}>{ch >= 0 ? "+" : ""}{ch.toFixed(1)}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                  <span style={{ fontSize: 9, color: "#64748b" }}>{l ? l.close.toFixed(1) + "K" : "-"}</span>
                  <Sparkline data={d.slice(-20).map(x => x.close)} width={48} height={14} color={ch >= 0 ? BULL : BEAR} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── MAIN ─── */}
        <div style={{ flex: 1, overflow: "auto", padding: "14px 18px" }}>
          {/* Title bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 800 }}>{career}</span>
                {catInfo && <span style={{
                  fontSize: 9, padding: "2px 8px", borderRadius: 4,
                  background: catInfo.color + "20", color: catInfo.color, fontWeight: 500,
                }}>{catInfo.icon} {catInfo.label}</span>}
              </div>
              {summary && (
                <div style={{ display: "flex", gap: 14, marginTop: 5, alignItems: "baseline", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: summary.ch >= 0 ? BULL : BEAR }}>
                    {(hd || summary.last).close.toFixed(1)}K
                  </span>
                  <div>
                    <div style={{ fontSize: 11, color: summary.ch >= 0 ? BULL : BEAR }}>
                      {summary.ch >= 0 ? "▲" : "▼"} {Math.abs(summary.ch).toFixed(1)}K ({summary.chPct >= 0 ? "+" : ""}{summary.chPct.toFixed(2)}%)
                    </div>
                    <div style={{ fontSize: 9, color: "#475569" }}>较上周 · 薪资区间 {summary.lo.toFixed(0)}-{summary.hi.toFixed(0)}K</div>
                  </div>
                </div>
              )}
            </div>
            {summary && <DemandGauge value={summary.avgD} />}
          </div>

          {/* Hover info strip */}
          {hd && (
            <div style={{
              display: "flex", gap: 14, padding: "5px 10px", marginBottom: 6,
              background: "#1e293b", borderRadius: 5, fontSize: 10, flexWrap: "wrap",
            }}>
              <span style={{ color: "#94a3b8" }}>{hd.date}</span>
              <span>开 <b>{hd.open.toFixed(1)}</b></span>
              <span>收 <b style={{ color: hd.close >= hd.open ? BULL : BEAR }}>{hd.close.toFixed(1)}</b></span>
              <span>高 <b style={{ color: BULL }}>{hd.high.toFixed(1)}</b></span>
              <span>低 <b style={{ color: BEAR }}>{hd.low.toFixed(1)}</b></span>
              <span>岗位 <b style={{ color: "#fbbf24" }}>{hd.volume.toLocaleString()}</b></span>
              <span>需求 <b style={{ color: "#60a5fa" }}>{hd.demandIndex}</b></span>
              <span>供需比 <b style={{ color: hd.supplyRatio > 1 ? BEAR : BULL }}>{hd.supplyRatio}</b></span>
            </div>
          )}

          {/* Time range buttons + compare selector */}
          <div style={{ display: "flex", gap: 3, marginBottom: 6, alignItems: "center", flexWrap: "wrap" }}>
            {TIME_RANGES.map(tr => (
              <button key={tr.label} onClick={() => setRange(tr.label)} style={sty.sel(range === tr.label)}>{tr.label}</button>
            ))}
            {compare && (
              <select value={compareTo} onChange={e => setCompareTo(e.target.value)}
                style={{ ...sty.input, marginLeft: "auto", fontSize: 11, color: "#60a5fa" }}>
                {Object.keys(CAREERS).filter(c => c !== career).map(c => <option key={c}>{c}</option>)}
              </select>
            )}
          </div>

          {/* Chart */}
          <div ref={chartRef} style={{ background: "#0c1220", borderRadius: 8, border: "1px solid #1e293b", marginBottom: 14, overflow: "hidden" }}>
            <CandlestickChart data={data} width={chartW} height={360} showMA={showMA} hoveredIdx={hoverIdx} setHoveredIdx={setHoverIdx} />
          </div>

          {/* Compare panel */}
          {compare && (() => {
            // Use the memoized comparison data instead of regenerating on every render.
            const cd = compareData;
            const cl = cd[cd.length - 1];
            const cp = cd.length > 4 ? cd[cd.length - 5] : cd[0];
            const cch = cl && cp ? ((cl.close - cp.close) / cp.close) * 100 : 0;
            return (
              <div
                style={{
                  background: "#1e293b",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 14,
                  border: "1px solid #334155",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 8,
                    color: "#60a5fa",
                  }}
                >
                  📊 对比分析
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    fontSize: 11,
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#94a3b8",
                        marginBottom: 3,
                        fontWeight: 600,
                      }}
                    >
                      {career}
                    </div>
                    <div>
                      薪资: <b>{summary?.last.close.toFixed(1)}K</b>
                    </div>
                    <div>
                      周涨幅: <b style={{ color: (summary?.chPct || 0) >= 0 ? BULL : BEAR }}>
                        {(summary?.chPct || 0).toFixed(2)}%
                      </b>
                    </div>
                    <div>
                      需求: <b>{summary?.avgD}</b>
                    </div>
                    <div>
                      供需比: <b>{summary?.avgS}</b>
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        color: "#94a3b8",
                        marginBottom: 3,
                        fontWeight: 600,
                      }}
                    >
                      {compareTo}
                    </div>
                    <div>
                      薪资: <b>{cl?.close.toFixed(1)}K</b>
                    </div>
                    <div>
                      周涨幅: <b style={{ color: cch >= 0 ? BULL : BEAR }}>{cch.toFixed(2)}%</b>
                    </div>
                    <div>
                      需求: <b>{cl?.demandIndex}</b>
                    </div>
                    <div>
                      供需比: <b>{cl?.supplyRatio}</b>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Stats cards */}
          {summary && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 8, marginBottom: 14 }}>
              {[
                { l: "周期涨幅", v: `${summary.pPct >= 0 ? "+" : ""}${summary.pPct.toFixed(1)}%`, c: summary.pPct >= 0 ? BULL : BEAR },
                { l: "均岗位量/周", v: summary.avgVol.toLocaleString(), c: "#fbbf24" },
                { l: "薪资最高", v: `${summary.hi.toFixed(1)}K`, c: BULL },
                { l: "薪资最低", v: `${summary.lo.toFixed(1)}K`, c: BEAR },
                { l: "需求指数", v: String(summary.avgD), c: "#60a5fa" },
                { l: "供需比", v: String(summary.avgS), c: summary.avgS > 1 ? BEAR : BULL },
              ].map((c, i) => (
                <div key={i} style={sty.card(c.c)}>
                  <div style={{ fontSize: 9, color: "#64748b", marginBottom: 3 }}>{c.l}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: c.c }}>{c.v}</div>
                </div>
              ))}
            </div>
          )}

          {/* Ranking */}
          <div style={{ background: "#1e293b", borderRadius: 8, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>🏆 薪资涨幅排行 · {city}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 4 }}>
              {ranking.slice(0, 15).map((r, i) => {
                const ct = CATEGORIES[r.cat];
                const sel = r.name === career;
                return (
                  <div key={r.name} onClick={() => setCareer(r.name)} style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "5px 8px", borderRadius: 5, cursor: "pointer",
                    background: sel ? "#334155" : "transparent",
                  }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: 3, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      background: i < 3 ? ["#fbbf2430", "#94a3b830", "#fb923c30"][i] : "#0f172a",
                      color: i < 3 ? ["#fbbf24", "#94a3b8", "#fb923c"][i] : "#475569",
                      fontSize: 9, fontWeight: 700,
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 11, flex: 1, color: sel ? "#f1f5f9" : "#94a3b8" }}>{r.name}</span>
                    <span style={{ fontSize: 9 }}>{ct.icon}</span>
                    <span style={{ fontSize: 10, color: "#94a3b8", width: 45, textAlign: "right" }}>{r.close.toFixed(1)}K</span>
                    <span style={{ fontSize: 10, fontWeight: 600, width: 55, textAlign: "right", color: r.ch >= 0 ? BULL : BEAR }}>
                      {r.ch >= 0 ? "+" : ""}{r.ch.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insight */}
          <div style={{
            padding: 14, borderRadius: 8,
            background: "linear-gradient(135deg, #1e293b, #0f172a)",
            border: "1px solid #334155", fontSize: 11, color: "#94a3b8", lineHeight: 1.9,
          }}>
            <div style={{ fontWeight: 700, color: "#e2e8f0", marginBottom: 5, fontSize: 12 }}>💡 市场洞察</div>
            {summary && cfg && (() => {
              const trend = summary.pPct > 8 ? "强势上涨" : summary.pPct > 2 ? "温和增长" : summary.pPct > -2 ? "横盘整理" : summary.pPct > -8 ? "小幅回调" : "显著下行";
              const demand = summary.avgD > 75 ? "旺盛" : summary.avgD > 55 ? "稳健" : summary.avgD > 35 ? "平淡" : "低迷";
              const supply = summary.avgS > 1.2 ? "供过于求，竞争激烈，建议差异化定位" : summary.avgS > 0.8 ? "供需平衡，入场时机适中" : "供不应求，求职者议价空间大";
              return (
                <div>
                  <b style={{ color: "#e2e8f0" }}>{career}</b>（{city}）整体呈<b style={{ color: summary.pPct >= 0 ? BULL : BEAR }}>{trend}</b>态势，
                  薪资由{data[0]?.close.toFixed(1)}K变动至{summary.last.close.toFixed(1)}K（{summary.pPct >= 0 ? "+" : ""}{summary.pPct.toFixed(1)}%）。
                  市场需求{demand}（指数{summary.avgD}），{supply}（比值{summary.avgS}）。
                  周均岗位发布{summary.avgVol.toLocaleString()}个。
                  {cfg.growth > 0.1 && " 该赛道正处快速成长期，先发优势明显，值得重点关注技能储备。"}
                  {cfg.growth > 0 && cfg.growth <= 0.05 && " 该职业发展平稳，适合追求稳定性的求职者。"}
                  {cfg.growth < 0 && " 行业整体收缩，建议关注技能迁移和跨界转型机会。"}
                  {cfg.volatility > 0.14 && " 薪资波动幅度较大，谈薪时建议以P50-P75区间为锚点。"}
                </div>
              );
            })()}
          </div>

          <div style={{ marginTop: 16, paddingTop: 10, borderTop: "1px solid #1e293b", textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "#334155" }}>
              数据基于招聘市场公开信息模拟 · 仅供参考 · 不构成任何职业建议 · Career KLine Analytics © 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
