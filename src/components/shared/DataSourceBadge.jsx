export default function DataSourceBadge({ loading, source, label = "数据源" }) {
  const isReal = source === "daily" || source === "api";
  return (
    <span className={`data-source ${isReal ? "data-source-real" : ""}`}>
      {label}：{loading ? "加载中..." : isReal ? "API/真实" : "智联实采+统计局+AI模型"}
    </span>
  );
}
