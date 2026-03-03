export default function MetricCard({ label, value, trend, color }) {
  const trendClass = trend === "up" ? "metric-up" : trend === "down" ? "metric-down" : "";
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className={`metric-value ${trendClass}`} style={color ? { color } : undefined}>
        {value ?? "—"}
      </div>
    </div>
  );
}
