function formatSalaryK(value) {
  if (value === null || value === undefined) return "-";
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  // num is in K (thousands yuan), e.g. 5.5 = ¥5,500/month
  if (num < 10) {
    // Below 1万: show as "5.5K" style
    return `${num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)}K`;
  }
  // 1万+: show as "X.X万"
  const wan = num / 10;
  const raw = wan >= 10 ? wan.toFixed(1) : wan.toFixed(2);
  const text = raw.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
  return `${text}万`;
}

export { formatSalaryK };
