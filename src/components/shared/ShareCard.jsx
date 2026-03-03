import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { CAREER_MAP } from "../../data/careers";
import { generateCareerSeries } from "../../engine/careerTrend";
import { buildCareerReport } from "../../engine/report";
import { formatSalaryK } from "../../utils/format";

function getGrade(score, reverse = false) {
  const v = reverse ? 100 - score : score;
  if (v >= 80) return { grade: "A+", color: "#22c55e" };
  if (v >= 65) return { grade: "A", color: "#34d399" };
  if (v >= 50) return { grade: "B", color: "#60a5fa" };
  if (v >= 35) return { grade: "C", color: "#f59e0b" };
  return { grade: "D", color: "#ef4444" };
}

export default function ShareCard({ careerName, onClose }) {
  const career = CAREER_MAP[careerName];
  const cardRef = useRef(null);
  const [saving, setSaving] = useState(false);

  if (!career) return null;

  const series = generateCareerSeries(careerName);
  const latest = series[series.length - 1];
  const growthG = getGrade(career.growth_score);
  const stabilityG = getGrade(career.stability_score);
  const aiG = getGrade(career.ai_replace_risk, true); // lower is better
  const reportText = useMemo(() => buildCareerReport(career, series), [career, series]);
  const summaryLine = useMemo(() => {
    if (!reportText) return "职业趋势整体向上，建议关注核心技能提升。";
    return reportText.split("\n").map((line) => line.trim()).find(Boolean) || "职业趋势整体向上，建议关注核心技能提升。";
  }, [reportText]);

  async function handleSaveImage() {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0c1225",
        scale: 2,
        useCORS: true,
      });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `职业K线-${careerName}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }
      if (/MicroMessenger/i.test(navigator.userAgent)) {
        alert("微信内请长按图片保存到相册");
      }
    } finally {
      setSaving(false);
    }
  }

  function handleCopyLink() {
    const url = `${window.location.origin}?career=${encodeURIComponent(careerName)}`;
    navigator.clipboard?.writeText(
      `【职业K线】${careerName} 的未来趋势分析：薪资${formatSalaryK(latest?.salary_median)}，AI替代风险${career.ai_replace_risk}/100。看完这个我沉默了... ${url}`
    ).then(() => {
      alert("已复制到剪贴板，可以分享到微信/微博了！");
    }).catch(() => {
      prompt("复制以下内容分享:", url);
    });
  }

  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <button className="share-close" onClick={onClose}>✕</button>

        <div
          ref={cardRef}
          style={{
            width: 375,
            background: "#0c1225",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 20,
            color: "#e2e8f0",
            boxShadow: "0 12px 36px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: "linear-gradient(135deg, #ef4444, #f97316)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, color: "#fff",
            }}>K</div>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>职业K线 · Career K-Line</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{careerName}</div>
            <span className={`career-tag tag-${career.category}`}>{career.category}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginBottom: 12 }}>
            {[
              { label: "薪资中位数", value: formatSalaryK(latest?.salary_median), color: "#22c55e" },
              { label: "招聘指数", value: `${latest?.hiring_index ?? "--"}/100`, color: "#60a5fa" },
              { label: "AI风险", value: `${career.ai_replace_risk}/100`, color: "#f97316" },
              { label: "稳定性", value: `${career.stability_score}/100`, color: "#a78bfa" },
            ].map((m) => (
              <div key={m.label} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
                padding: "10px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}>
                <span style={{ fontSize: 10, color: "#94a3b8" }}>{m.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{m.value}</span>
              </div>
            ))}
          </div>

          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 11,
            color: "#cbd5f5",
            lineHeight: 1.6,
            marginBottom: 14,
          }}>
            {summaryLine}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>
              <div style={{ fontWeight: 700, color: "#e2e8f0" }}>Career K-Line</div>
              <div>career-kline.com</div>
            </div>
            <div style={{
              width: 64, height: 64,
              borderRadius: 10,
              border: "1px dashed rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              fontSize: 9,
              textAlign: "center",
              padding: 6,
            }}>
              二维码占位
            </div>
          </div>
        </div>

        <div className="share-actions">
          <button className="share-btn share-btn-primary" onClick={handleCopyLink}>
            📋 复制分享文案
          </button>
          <button className="share-btn" onClick={handleSaveImage} disabled={saving}>
            {saving ? "生成中..." : "📸 保存分享卡片"}
          </button>
          <button className="share-btn" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
}
