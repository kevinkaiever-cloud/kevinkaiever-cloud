import { LAYOFF_YEARS, FORECAST_START } from "../engine/companyTrend";

// ─── Shared chart theme ─────────────────────────────────────────
const AXIS_LABEL = { color: "#7a8ba8" };
const AXIS_LINE = { lineStyle: { color: "#1a2540" } };
const SPLIT_LINE = { lineStyle: { color: "#1a2540" } };
const TITLE_STYLE = { color: "#e2e8f0", fontSize: 12, fontWeight: 600 };

// ─── Career K-Line chart ────────────────────────────────────────
const KLINE_BASE_OPTION = {
  backgroundColor: "transparent",
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "cross", crossStyle: { color: "#475569" } },
    textStyle: { fontSize: 11 },
    backgroundColor: "rgba(15,23,42,0.95)",
    borderColor: "#334155",
  },
  grid: { left: 52, right: 56, top: 40, bottom: 36 },
  yAxis: [
    { scale: true, axisLabel: AXIS_LABEL, splitLine: SPLIT_LINE },
    { min: 0, max: 100, axisLabel: AXIS_LABEL, splitLine: { show: false } },
  ],
  legend: {
    data: ["薪资K线", "招聘需求指数", "招聘需求预测"],
    textStyle: { color: "#7a8ba8", fontSize: 10 },
    top: 4,
    right: 12,
  },
};

function parseYear(d) {
  if (typeof d.year === "number" && !Number.isNaN(d.year)) return d.year;
  const str = String(d.date || "");
  const m = str.match(/^(\d{4})/);
  return m ? parseInt(m[1], 10) : NaN;
}

export function buildKlineOption(series, name, showForecast = true) {
  const baseSeries = showForecast ? series : series.filter((d) => !d.isForecast);
  const years = baseSeries.map((d) => d.year ?? (typeof d.date === "number" ? d.date : parseYear(d)) ?? d.date);
  const tooltipFormatter = (params) => {
    if (!params?.length) return "";
    const year = params[0]?.axisValue;
    const yearNum = parseInt(String(year).slice(0, 4), 10);
    const lines = [`${year}`];
    params.forEach((p) => {
      if (!p || p.value == null) return;
      if (Array.isArray(p.value)) {
        lines.push(`${p.seriesName}: 开${p.value[0]} 高${p.value[3]} 低${p.value[2]} 收${p.value[1]}`);
      } else {
        lines.push(`${p.seriesName}: ${p.value}`);
      }
    });
    if (!Number.isNaN(yearNum) && yearNum > 2025) {
      lines.push("⚠️ 2026年以后为AI模型预测，仅供参考");
    }
    return lines.join("<br/>");
  };
  return {
    ...KLINE_BASE_OPTION,
    tooltip: { ...KLINE_BASE_OPTION.tooltip, formatter: tooltipFormatter },
    xAxis: {
      type: "category",
      data: years,
      axisLabel: AXIS_LABEL,
      axisLine: AXIS_LINE,
    },
    series: [
      {
        name: "薪资K线",
        type: "candlestick",
        data: baseSeries.map((d) => ({
          value: [
            d.open || d.salary_median,
            d.close || d.salary_median,
            d.low || d.salary_median,
            d.high || d.salary_median,
          ],
          isForecast: Boolean(d.isForecast),
        })),
        itemStyle: {
          color: (params) => (params.data?.isForecast ? "rgba(239,68,68,0.5)" : "#ef4444"),
          color0: (params) => (params.data?.isForecast ? "rgba(34,197,94,0.5)" : "#22c55e"),
          borderColor: (params) => (params.data?.isForecast ? "rgba(239,68,68,0.7)" : "#ef4444"),
          borderColor0: (params) => (params.data?.isForecast ? "rgba(34,197,94,0.7)" : "#22c55e"),
          borderType: (params) => (params.data?.isForecast ? "dashed" : "solid"),
        },
        markLine: {
          symbol: "none",
          lineStyle: { type: "dashed", color: "#6366f1", width: 1 },
          label: { formatter: "← 历史 | 预测 →", color: "#94a3b8", fontSize: 10 },
          data: [{ xAxis: 2025 }],
        },
        markArea: {
          itemStyle: { color: "rgba(99, 102, 241, 0.05)" },
          data: [[{ xAxis: 2026 }, { xAxis: 2035 }]],
        },
      },
      {
        name: "招聘需求指数",
        type: "line",
        yAxisIndex: 1,
        data: baseSeries.map((d) => {
          const yr = parseYear(d);
          return yr <= 2025 ? (d.hiring_index ?? null) : null;
        }),
        smooth: true,
        symbol: "circle",
        symbolSize: 4,
        connectNulls: true,
        lineStyle: { color: "#60a5fa", width: 2 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(96,165,250,0.15)" },
              { offset: 1, color: "rgba(96,165,250,0)" },
            ],
          },
        },
      },
      {
        name: "招聘需求预测",
        type: "line",
        yAxisIndex: 1,
        data: baseSeries.map((d) => {
          const yr = parseYear(d);
          return yr >= 2025 ? (d.hiring_index ?? null) : null;
        }),
        smooth: true,
        symbol: "circle",
        symbolSize: 4,
        connectNulls: true,
        lineStyle: { color: "#a78bfa", width: 2, type: "dashed" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(167,139,250,0.08)" },
              { offset: 1, color: "rgba(167,139,250,0)" },
            ],
          },
        },
      },
    ],
    title: {
      text: `${name} · 薪资与需求趋势`,
      left: 12,
      top: 4,
      textStyle: TITLE_STYLE,
    },
  };
}

// ─── Industry index chart ───────────────────────────────────────
export function buildIndustryOption(series) {
  return {
    backgroundColor: "transparent",
    grid: { left: 48, right: 24, top: 40, bottom: 36 },
    xAxis: {
      type: "category",
      data: series.map((d) => d.year || d.date),
      axisLabel: AXIS_LABEL,
      axisLine: AXIS_LINE,
    },
    yAxis: {
      min: 0,
      max: 100,
      axisLabel: AXIS_LABEL,
      splitLine: SPLIT_LINE,
    },
    series: [
      {
        name: "行业景气度",
        type: "line",
        smooth: true,
        symbol: "none",
        data: series.map((d) => d.industry_index),
        lineStyle: { color: "#34d399", width: 2 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(52,211,153,0.18)" },
              { offset: 1, color: "rgba(52,211,153,0)" },
            ],
          },
        },
      },
    ],
    title: {
      text: "行业景气度",
      left: 12,
      top: 4,
      textStyle: TITLE_STYLE,
    },
  };
}

// ─── Radar chart ────────────────────────────────────────────────
export function buildRadarOption(career) {
  if (!career) return {};
  return {
    backgroundColor: "transparent",
    radar: {
      indicator: [
        { name: "AI替代风险", max: 100 },
        { name: "稳定性", max: 100 },
        { name: "成长性", max: 100 },
        { name: "风险等级", max: 100 },
      ],
      radius: "65%",
      axisName: { color: "#7a8ba8", fontSize: 11 },
      axisLine: { lineStyle: { color: "#233152" } },
      splitLine: { lineStyle: { color: "#1a2540" } },
      splitArea: {
        areaStyle: {
          color: ["rgba(30,41,59,0.4)", "rgba(15,23,42,0.4)"],
        },
      },
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
              career.risk_level * 10,
            ],
            areaStyle: { color: "rgba(96,165,250,0.25)" },
            lineStyle: { color: "#60a5fa", width: 2 },
            symbol: "circle",
            symbolSize: 5,
            itemStyle: { color: "#60a5fa" },
          },
        ],
      },
    ],
    title: {
      text: "职业画像雷达",
      left: 12,
      top: 4,
      textStyle: TITLE_STYLE,
    },
  };
}

// ─── Compare radar (two careers) ────────────────────────────────
export function buildCompareRadarOption(careerA, careerB) {
  if (!careerA || !careerB) return {};
  return {
    backgroundColor: "transparent",
    legend: {
      data: [careerA.career_name, careerB.career_name],
      textStyle: { color: "#7a8ba8", fontSize: 10 },
      top: 4,
      right: 12,
    },
    radar: {
      indicator: [
        { name: "AI替代风险", max: 100 },
        { name: "稳定性", max: 100 },
        { name: "成长性", max: 100 },
        { name: "风险等级", max: 100 },
      ],
      radius: "60%",
      axisName: { color: "#7a8ba8", fontSize: 11 },
      axisLine: { lineStyle: { color: "#233152" } },
      splitLine: { lineStyle: { color: "#1a2540" } },
      splitArea: {
        areaStyle: { color: ["rgba(30,41,59,0.4)", "rgba(15,23,42,0.4)"] },
      },
    },
    series: [
      {
        type: "radar",
        data: [
          {
            name: careerA.career_name,
            value: [careerA.ai_replace_risk, careerA.stability_score, careerA.growth_score, careerA.risk_level * 10],
            areaStyle: { color: "rgba(96,165,250,0.2)" },
            lineStyle: { color: "#60a5fa", width: 2 },
            symbol: "circle",
            symbolSize: 5,
            itemStyle: { color: "#60a5fa" },
          },
          {
            name: careerB.career_name,
            value: [careerB.ai_replace_risk, careerB.stability_score, careerB.growth_score, careerB.risk_level * 10],
            areaStyle: { color: "rgba(251,113,133,0.2)" },
            lineStyle: { color: "#fb7185", width: 2 },
            symbol: "circle",
            symbolSize: 5,
            itemStyle: { color: "#fb7185" },
          },
        ],
      },
    ],
    title: {
      text: "职业画像对比",
      left: 12,
      top: 4,
      textStyle: TITLE_STYLE,
    },
  };
}

// ─── Compare K-Line overlay ─────────────────────────────────────
export function buildCompareKlineOption(seriesA, seriesB, nameA, nameB) {
  const years = seriesA.map((d) => d.year || d.date);
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      textStyle: { fontSize: 11 },
      backgroundColor: "rgba(15,23,42,0.95)",
      borderColor: "#334155",
    },
    grid: { left: 52, right: 24, top: 40, bottom: 36 },
    xAxis: {
      type: "category",
      data: years,
      axisLabel: AXIS_LABEL,
      axisLine: AXIS_LINE,
    },
    yAxis: { scale: true, axisLabel: AXIS_LABEL, splitLine: SPLIT_LINE },
    legend: {
      data: [`${nameA} 招聘指数`, `${nameB} 招聘指数`],
      textStyle: { color: "#7a8ba8", fontSize: 10 },
      top: 4,
      right: 12,
    },
    series: [
      {
        name: `${nameA} 招聘指数`,
        type: "line",
        smooth: true,
        symbol: "none",
        data: seriesA.map((d) => d.hiring_index),
        lineStyle: { color: "#60a5fa", width: 2 },
        areaStyle: { color: "rgba(96,165,250,0.08)" },
      },
      {
        name: `${nameB} 招聘指数`,
        type: "line",
        smooth: true,
        symbol: "none",
        data: seriesB.map((d) => d.hiring_index),
        lineStyle: { color: "#fb7185", width: 2 },
        areaStyle: { color: "rgba(251,113,133,0.08)" },
      },
    ],
    title: {
      text: "招聘需求趋势对比",
      left: 12,
      top: 4,
      textStyle: TITLE_STYLE,
    },
  };
}

// ─── Company K-Line chart ───────────────────────────────────────
export function buildCompanyKlineOption(series, company) {
  const years = series.map((d) => d.year || d.date);
  const hasForecast = series.some((d) => d.isForecast || (d.year && d.year >= FORECAST_START));
  const layoffLines = LAYOFF_YEARS.filter((y) => years.includes(y)).map((y) => ({ xAxis: y, label: { formatter: `裁员 ${y}` } }));
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      backgroundColor: "rgba(15,23,42,0.95)",
      borderColor: "#334155",
      formatter: (params) => {
        if (!params?.length) return "";
        const year = params[0]?.axisValue;
        const isF = Number(year) >= FORECAST_START;
        const lines = [year + (isF ? "（预测）" : "")];
        params.forEach((p) => {
          const v = p?.value?.value ?? p?.value;
          if (v && Array.isArray(v) && v.length >= 4) {
            lines.push(`${p.seriesName}: 开${Number(v[0]).toFixed(1)} 高${Number(v[3]).toFixed(1)} 低${Number(v[2]).toFixed(1)} 收${Number(v[1]).toFixed(1)}`);
          }
        });
        if (isF) lines.push("⚠️ 2026年后为趋势预测，仅供参考");
        return lines.join("<br/>");
      },
    },
    grid: { left: 52, right: 56, top: 40, bottom: 36 },
    xAxis: {
      type: "category",
      data: years,
      axisLabel: AXIS_LABEL,
      axisLine: AXIS_LINE,
    },
    yAxis: { scale: true, axisLabel: AXIS_LABEL, splitLine: SPLIT_LINE },
    series: [
      {
        name: "招聘需求K线",
        type: "candlestick",
        data: series.map((d) => ({
          value: [d.open || d.hiring_index, d.close || d.hiring_index, d.low || d.hiring_index, d.high || d.hiring_index],
          isForecast: Boolean(d.isForecast),
        })),
        itemStyle: {
          color: (params) => (params.data?.isForecast ? "rgba(249,115,22,0.5)" : "#f97316"),
          color0: (params) => (params.data?.isForecast ? "rgba(34,197,94,0.5)" : "#22c55e"),
          borderColor: (params) => (params.data?.isForecast ? "rgba(249,115,22,0.7)" : "#f97316"),
          borderColor0: (params) => (params.data?.isForecast ? "rgba(34,197,94,0.7)" : "#22c55e"),
          borderType: (params) => (params.data?.isForecast ? "dashed" : "solid"),
        },
        markLine: {
          symbol: "none",
          label: { color: "#7a8ba8", fontSize: 10 },
          lineStyle: { type: "dashed", color: "#ef4444", opacity: 0.4 },
          data: hasForecast
            ? [...layoffLines, { xAxis: FORECAST_START, label: { formatter: "← 历史 | 预测 →", color: "#6366f1" }, lineStyle: { color: "#6366f1" } }]
            : layoffLines,
        },
        markArea: hasForecast
          ? {
              itemStyle: { color: "rgba(99, 102, 241, 0.05)" },
              data: [[{ xAxis: FORECAST_START }, { xAxis: years[years.length - 1] }]],
            }
          : { show: false },
      },
    ],
    title: {
      text: `${company} · 招聘需求K线（含未来预测）`,
      left: 12,
      top: 4,
      textStyle: TITLE_STYLE,
    },
  };
}

// ─── Company ratio chart ────────────────────────────────────────
export function buildCompanyRatioOption(series) {
  const years = series.map((d) => d.year || d.date);
  const hasForecast = series.some((d) => d.isForecast || (d.year && d.year >= FORECAST_START));
  return {
    backgroundColor: "transparent",
    grid: { left: 48, right: 24, top: 40, bottom: 36 },
    xAxis: {
      type: "category",
      data: years,
      axisLabel: AXIS_LABEL,
      axisLine: AXIS_LINE,
    },
    yAxis: {
      min: 0,
      max: 100,
      axisLabel: AXIS_LABEL,
      splitLine: SPLIT_LINE,
    },
    legend: {
      textStyle: { color: "#7a8ba8", fontSize: 10 },
      top: 4,
      right: 12,
    },
    series: [
      {
        name: "技术岗占比",
        type: "line",
        smooth: true,
        symbol: "none",
        data: series.map((d) => d.tech_ratio),
        lineStyle: { color: "#38bdf8", width: 2 },
        areaStyle: { color: "rgba(56,189,248,0.08)" },
        markLine: hasForecast
          ? {
              symbol: "none",
              label: { formatter: "← 历史 | 预测 →", color: "#6366f1", fontSize: 10 },
              lineStyle: { type: "dashed", color: "#6366f1", width: 1 },
              data: [{ xAxis: FORECAST_START }],
            }
          : { show: false },
      },
      {
        name: "AI岗位占比",
        type: "line",
        smooth: true,
        symbol: "none",
        data: series.map((d) => d.ai_job_ratio),
        lineStyle: { color: "#a78bfa", width: 2 },
        areaStyle: { color: "rgba(167,139,250,0.08)" },
      },
    ],
    title: {
      text: hasForecast ? "技术岗 vs AI岗位占比（含预测）" : "技术岗 vs AI岗位占比",
      left: 12,
      top: 4,
      textStyle: TITLE_STYLE,
    },
  };
}
