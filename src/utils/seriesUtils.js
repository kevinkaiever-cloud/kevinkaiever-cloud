// ─── Series normalization & aggregation ──────────────────────────

export function toDate(value) {
  if (!value) return null;
  if (typeof value === "number") return new Date(`${value}-01-01`);
  return new Date(value);
}

export function getGranularityKey(date, granularity) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  if (granularity === "day") return date.toISOString().slice(0, 10);
  if (granularity === "month") return `${year}-${String(month).padStart(2, "0")}`;
  if (granularity === "quarter") return `${year}-Q${Math.floor((month - 1) / 3) + 1}`;
  if (granularity === "half") return `${year}-H${month <= 6 ? 1 : 2}`;
  return String(year);
}

export function normalizeCareerSeries(series) {
  return series
    .map((item) => {
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
        industry: item.industry,
      };
    })
    .filter((item) => item.date);
}

export function aggregateSeries(series, granularity) {
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
      const yearMatch = String(key).match(/^(\d{4})/);
      const year = yearMatch ? parseInt(yearMatch[1], 10) : sorted[0]?._date?.getFullYear();
      return {
        date: key,
        year,
        open,
        close,
        high,
        low,
        hiring_index: +hiring.toFixed(2),
        salary_median: +salary.toFixed(2),
        isForecast: year > 2025,
      };
    })
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

export function filterByTimeRange(normalizedSeries, timeRange, TIME_RANGES) {
  if (normalizedSeries.length === 0) return [];
  const range = TIME_RANGES.find((item) => item.label === timeRange) || TIME_RANGES[1];
  const lastDate = toDate(normalizedSeries[normalizedSeries.length - 1].date);
  if (!lastDate) return normalizedSeries;
  if (range.months >= 9999) {
    return aggregateSeries(normalizedSeries, range.granularity);
  }
  const cut = new Date(lastDate);
  cut.setMonth(cut.getMonth() - range.months);
  const sliced = normalizedSeries.filter((item) => {
    const date = toDate(item.date);
    return date && date >= cut;
  });
  return aggregateSeries(sliced, range.granularity);
}
