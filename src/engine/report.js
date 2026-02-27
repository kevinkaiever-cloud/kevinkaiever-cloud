function trendLabel(start, end) {
  const change = end - start;
  if (change > 12) return "强势上行";
  if (change > 4) return "温和上行";
  if (change > -3) return "横盘整理";
  if (change > -10) return "温和回调";
  return "显著下行";
}

function aiImpactLabel(aiRisk) {
  if (aiRisk >= 70) return "高冲击";
  if (aiRisk >= 45) return "中等冲击";
  return "低冲击";
}

function stabilityLabel(score) {
  if (score >= 80) return "高稳定";
  if (score >= 60) return "中等稳定";
  return "低稳定";
}

function entryAdvice(growth, stability, aiRisk) {
  if (growth >= 70 && aiRisk < 50) return "适合具备学习能力与成长预期的求职者进入。";
  if (growth >= 55 && stability >= 60) return "适合追求稳健增长的人群进入。";
  if (aiRisk >= 70) return "不建议低技能进入，需明确差异化竞争力。";
  return "进入需评估技能门槛与岗位替代风险。";
}

function wealthCurve(growth, stability) {
  if (growth >= 75) return "财富曲线呈陡峭上行，但波动较大。";
  if (growth >= 60) return "财富曲线稳步上行，回撤可控。";
  if (stability >= 70) return "财富曲线缓慢上行，以稳定现金流为主。";
  return "财富曲线低位震荡，需要二次技能跃迁。";
}

export function buildCareerReport(career, series) {
  if (!career || !series || series.length === 0) return "";
  const start = series[0];
  const end = series[series.length - 1];
  const mid = series[Math.max(0, series.length - 5)];
  const trend = trendLabel(start.hiring_index, end.hiring_index);
  const demandTrend = end.hiring_index - mid.hiring_index >= 0 ? "近年回升" : "近年回落";
  const aiImpact = aiImpactLabel(career.ai_replace_risk);
  const stability = stabilityLabel(career.stability_score);
  const advice = entryAdvice(career.growth_score, career.stability_score, career.ai_replace_risk);
  const wealth = wealthCurve(career.growth_score, career.stability_score);

  return [
    `【趋势判断】2005-2025 需求指数从 ${start.hiring_index} 升至 ${end.hiring_index}，整体呈 ${trend}，${demandTrend}。`,
    `【AI冲击】AI替代风险 ${career.ai_replace_risk}/100，冲击等级为${aiImpact}，建议强化不可替代技能。`,
    `【稳定性】稳定性评分 ${career.stability_score}/100，属于${stability}轨道。`,
    `【进入建议】${advice}`,
    `【财富曲线】${wealth}`
  ].join("\n");
}
