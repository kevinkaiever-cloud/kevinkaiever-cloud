import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ReactECharts from "echarts-for-react";
import { COMPANY_LIST } from "../../data/companies";
import { YEARS, LAYOFF_YEARS, FORECAST_START } from "../../engine/companyTrend";
import { useCompanyData } from "../../hooks/useData";
import { buildCompanyKlineOption, buildCompanyRatioOption } from "../../utils/chartBuilders";
import DataSourceBadge from "../shared/DataSourceBadge";

export default function CompanyView({ companyName, setCompanyName }) {
  const navigate = useNavigate();
  const { series, source, loading } = useCompanyData(companyName);
  const klineOption = useMemo(() => buildCompanyKlineOption(series, companyName), [series, companyName]);
  const ratioOption = useMemo(() => buildCompanyRatioOption(series), [series]);

  return (
    <>
      <section className="hero">
        <div className="hero-info">
          <div className="hero-title">🏢 公司用工需求K线</div>
          <div className="hero-meta">
            <span>共 {COMPANY_LIST.length} 家企业</span>
            <span>周期：{YEARS[0]}-{YEARS[YEARS.length - 1]}</span>
            <span>裁员周期标记：{LAYOFF_YEARS.join(", ")}</span>
            <DataSourceBadge loading={loading} source={source} />
          </div>
        </div>
        <div className="company-select">
          <span>选择公司</span>
          <select value={companyName} onChange={(e) => {
            const name = e.target.value;
            setCompanyName(name);
            navigate(`/company/${encodeURIComponent(name)}`);
          }}>
            <optgroup label="互联网">
              {COMPANY_LIST.filter((c) => c.type === "internet").map((item) => (
                <option key={item.company} value={item.company}>{item.company}</option>
              ))}
            </optgroup>
            <optgroup label="科技/制造">
              {COMPANY_LIST.filter((c) => c.type === "tech" || c.type === "manufacture").map((item) => (
                <option key={item.company} value={item.company}>{item.company}</option>
              ))}
            </optgroup>
            <optgroup label="国企/央企">
              {COMPANY_LIST.filter((c) => c.type === "state").map((item) => (
                <option key={item.company} value={item.company}>{item.company}</option>
              ))}
            </optgroup>
            <optgroup label="银行/金融">
              {COMPANY_LIST.filter((c) => c.type === "bank").map((item) => (
                <option key={item.company} value={item.company}>{item.company}</option>
              ))}
            </optgroup>
            <optgroup label="外资/跨国">
              {COMPANY_LIST.filter((c) => c.type === "global").map((item) => (
                <option key={item.company} value={item.company}>{item.company}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </section>

      <section className="chart-grid">
        <div className="chart-card chart-span-2">
          <ReactECharts option={klineOption} style={{ height: 340 }} notMerge />
          <div style={{ fontSize: 10, color: "#6b7fa0", marginTop: 8 }}>
            {FORECAST_START}-2035 为基于行业趋势的预测区间，虚线表示预测段，仅供参考
          </div>
        </div>
        <div className="chart-card">
          <ReactECharts option={ratioOption} style={{ height: 340 }} notMerge />
        </div>
        <div className="chart-card">
          <div className="panel-title">📖 用工解读</div>
          <div className="report-text company-report">
            <p>招聘需求指数反映公司整体用工景气度。互联网公司在裁员周期年（{LAYOFF_YEARS.join(" / ")}）波动更为明显。</p>
            <p>技术岗占比持续上升趋势，AI相关岗位自 2016 年后进入快速增长区间。</p>
            <p>海外公司曲线更平滑体现出更稳定的用工策略；国企与银行类更强调稳定性。</p>
            <p>{FORECAST_START}年后为趋势预测：新能源/制造类上行，互联网/银行类趋稳或小幅下行。</p>
          </div>
        </div>
      </section>
    </>
  );
}
