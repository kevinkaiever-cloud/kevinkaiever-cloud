import { CAREER_DB } from "../data/careers";
import { FUTURE_TYPES, CAREER_FUTURE_MAP } from "../data/futureTrends";
import { formatSalaryK } from "../utils/format";

function trendLabel(start, end) {
  const change = end - start;
  if (change > 12) return "强势上行";
  if (change > 4) return "温和上行";
  if (change > -3) return "横盘整理";
  if (change > -10) return "温和回调";
  return "显著下行";
}

function trendEmoji(start, end) {
  const change = end - start;
  if (change > 12) return "🟢";
  if (change > 4) return "🟢";
  if (change > -3) return "🟡";
  if (change > -10) return "🟠";
  return "🔴";
}

function aiImpactLabel(aiRisk) {
  if (aiRisk >= 70) return "高冲击 🔴";
  if (aiRisk >= 45) return "中等冲击 🟠";
  return "低冲击 🟢";
}

function stabilityLabel(score) {
  if (score >= 80) return "高稳定";
  if (score >= 60) return "中等稳定";
  return "低稳定";
}

function entryAdvice(growth, stability, aiRisk) {
  if (growth >= 70 && aiRisk < 50) return "适合具备学习能力与成长预期的求职者进入，是当前市场中的优质赛道。";
  if (growth >= 55 && stability >= 60) return "适合追求稳健增长的人群，职业发展路径清晰。";
  if (aiRisk >= 70) return "不建议低技能者进入，必须构建差异化竞争力，强化不可替代的人际/创意/判断类技能。";
  return "进入需评估个人技能门槛与岗位替代风险，建议先积累相关经验再做决定。";
}

function wealthCurve(growth, stability) {
  if (growth >= 75) return "财富曲线呈陡峭上行，但波动较大，适合有风险承受能力的从业者。";
  if (growth >= 60) return "财富曲线稳步上行，回撤可控，长期看收益可观。";
  if (stability >= 70) return "财富曲线缓慢上行，以稳定现金流为主，适合追求确定性的人群。";
  return "财富曲线低位震荡，建议通过技能跃迁或副业组合提升整体收入水平。";
}

function futureOutlook(careerName, futureTypeKey) {
  switch (futureTypeKey) {
    case "AI_REPLACE":
      return `⏳ 未来10年展望 ─ 该职业面临AI直接替代风险。${careerName}的核心工作内容正在被AI系统化解决。预计2028-2030年间需求指数将降至当前的60%。
建议：① 向不可标准化环节转移（如现场服务/复杂沟通/质量把控）② 学习AI工具，成为“AI+${careerName}”的复合型人才 ③ 设定2年转型窗口期，不宜被动等待。`;
    case "AI_SPLIT":
      return `⚡ 未来10年展望 ─ ${careerName}将经历剧烈分化。低端标准化工作被AI压缩，但掌握AI工具的高端从业者产出翻倍、薪资上行。
建议：① 立即开始使用AI辅助工具提升效率 ② 向“判断、创意、沟通”等AI难以替代环节聚焦 ③ 关注头部公司JD变化，提前适配新能力要求。`;
    case "AI_BOOST":
      return `🚀 未来10年展望 ─ AI浪潮将放大${careerName}的价值。2030年前后需求与薪资会同步上行，是确定性上升赛道。
建议：① 提前布局前沿技术栈 ② 强化跨学科协作能力 ③ 关注行业龙头与政策红利窗口（2026-2030年）。`;
    case "AGING_BOOM":
      return `🧓 未来10年展望 ─ 中国老龄人口将在2035年突破4亿，${careerName}处于确定性上行赛道。
建议：① 考取专业资质提升溢价 ② 深耕高端/专业化细分领域 ③ 积累口碑与私域客户建立个人品牌。`;
    case "MEDICAL":
      return `🏥 未来10年展望 ─ 医疗刚需长期存在，${careerName}需求稳步上行。
建议：① 走专业化/专科化路线 ② 重视合规与证照 ③ 关注2026-2032年基层医疗下沉机会。`;
    case "PHYSICAL_SKILL":
      return `🔧 未来10年展望 ─ “技工荒”将持续加剧，${careerName}需求刚性不减。
建议：① 向技术+管理复合方向发展 ② 通过短视频/口碑获取高端客源 ③ 学习智能家居/新能源相关技能拓宽服务面。`;
    case "CRAFT":
      return `✂️ 未来10年展望 ─ 手艺体验型服务依赖人际信任与非标判断，AI难以替代。
建议：① 打造个人风格与作品集 ② 经营私域与复购 ③ 2年内形成稳定客户圈层。`;
    case "TRUST":
      return `🤝 未来10年展望 ─ 信任关系型岗位价值上行，核心在于长期口碑与决策能力。
建议：① 提升专业资质与案例沉淀 ② 强化客户关系管理 ③ 关注高净值/细分人群需求变化。`;
    case "GREEN":
      return `🌱 未来10年展望 ─ 双碳政策驱动绿色能源持续扩张，${careerName}需求提升。
建议：① 关注政策周期与补贴窗口 ② 补齐工程/数据能力 ③ 2026-2032年优先布局核心城市项目。`;
    case "HARD_TECH":
      return `🔬 未来10年展望 ─ 硬科技国产替代加速，${careerName}中长期受益。
建议：① 深耕关键工艺/底层技术 ② 参与产业链协同 ③ 把握2027-2035高景气区间。`;
    case "REAL_ESTATE":
      return `🏠 未来10年展望 ─ 房地产进入下行周期，${careerName}需求承压。
建议：① 向城市更新/存量改造转型 ② 增加装配式/节能改造技能 ③ 2-3年内完成能力迁移。`;
    case "TRANSPORT":
      return `🚗 未来10年展望 ─ 自动驾驶推进将压缩传统运输岗位需求。
建议：① 提升服务与安全管理能力 ② 关注新能源/智能调度岗位 ③ 2027-2030提前转型。`;
    case "FINTECH":
      return `💳 未来10年展望 ─ 金融科技替代加速，基础金融岗位收缩。
建议：① 向风控/投研/数据方向升级 ② 掌握自动化与合规工具 ③ 2年内完成能力跃迁。`;
    case "ECOM_PEAK":
      return `📱➡️ 未来10年展望 ─ 电商与直播红利见顶，增长放缓。
建议：① 向品牌化与供应链上游迁移 ② 关注私域复购 ③ 2026-2028调整业务结构。`;
    case "GOV":
      return `🏛️➡️ 未来10年展望 ─ 编制收缩但存量稳定，新增岗位竞争加剧。
建议：① 提前准备考试与资格 ② 向信息化/数字治理方向靠拢 ③ 关注区域编制政策窗口。`;
    case "FIN_HIGH":
      return `💰 未来10年展望 ─ 金融高端岗位需求稳定，绩效分化加大。
建议：① 强化量化/风控能力 ② 保持策略迭代与研究深度 ③ 关注监管周期与产品结构变化。`;
    default:
      return `➡️ 未来10年展望 ─ ${careerName}整体呈温和波动趋势，机会与风险并存。
建议：① 关注核心技能升级 ② 形成可迁移的通用能力 ③ 2026-2030尝试跨界与复合发展。`;
  }
}

export function buildCareerReport(career, series) {
  if (!career || !series || series.length === 0) return "";
  const start = series[0];
  const end = series[series.length - 1];
  const mid = series[Math.max(0, series.length - 5)];
  const trend = trendLabel(start.hiring_index, end.hiring_index);
  const emoji = trendEmoji(start.hiring_index, end.hiring_index);
  const demandTrend = end.hiring_index - mid.hiring_index >= 0 ? "近年回升" : "近年回落";
  const aiImpact = aiImpactLabel(career.ai_replace_risk);
  const stability = stabilityLabel(career.stability_score);
  const advice = entryAdvice(career.growth_score, career.stability_score, career.ai_replace_risk);
  const wealth = wealthCurve(career.growth_score, career.stability_score);

  const futureTypeKey = CAREER_FUTURE_MAP[career.career_name] || "NEUTRAL";
  const futureSegment = futureOutlook(career.career_name, futureTypeKey);

  return [
    `${emoji} 趋势判断 ─ 需求指数从 ${start.hiring_index} → ${end.hiring_index}，整体呈${trend}，${demandTrend}。`,
    "",
    `🤖 AI冲击 ─ 替代风险 ${career.ai_replace_risk}/100（${aiImpact}），建议强化不可替代技能。`,
    "",
    `🛡️ 稳定性 ─ 评分 ${career.stability_score}/100，属于${stability}轨道。`,
    "",
    `🚪 进入建议 ─ ${advice}`,
    "",
    `💰 财富曲线 ─ ${wealth}`,
    "",
    futureSegment,
  ].join("\n");
}

function salaryAt(series, year) {
  const item = series.find((d) => d.year === year);
  return item?.salary_median ?? null;
}

function aiTimeline(aiRisk) {
  if (aiRisk >= 70) return "高冲击：3-5年内大概率被自动化重塑，需尽快转向高附加值岗位。";
  if (aiRisk >= 45) return "中等冲击：5-8年内岗位形态会明显变化，建议逐步强化复合技能。";
  return "低冲击：8年以上相对稳定，但仍建议跟进行业技术变化。";
}

export function buildProReport(career, series) {
  if (!career || !series || series.length === 0) return "";
  const base = buildCareerReport(career, series);

  const milestones = [2005, 2010, 2015, 2020, 2025];
  const salaryPoints = milestones.map((y) => ({
    year: y,
    value: salaryAt(series, y),
  })).filter((p) => p.value !== null);
  const salaryLine = salaryPoints
    .map((p, i) => {
      if (i === 0) return `${p.year}: ${formatSalaryK(p.value)}`;
      const prev = salaryPoints[i - 1];
      const growth = prev.value ? (((p.value - prev.value) / prev.value) * 100).toFixed(1) : "0.0";
      return `${p.year}: ${formatSalaryK(p.value)}（较${prev.year} +${growth}%）`;
    })
    .join(" / ");

  const topSalary = CAREER_DB
    .filter((c) => c.category === career.category)
    .slice()
    .sort((a, b) => (b.salary_2025 || 0) - (a.salary_2025 || 0))
    .slice(0, 5)
    .map((c, idx) => `${idx + 1}. ${c.career_name}（${formatSalaryK(c.salary_2025)}）`)
    .join("\n");

  const transition = CAREER_DB
    .filter((c) => c.category === career.category && c.career_name !== career.career_name)
    .slice()
    .sort((a, b) => (b.growth_score || 0) - (a.growth_score || 0))
    .slice(0, 3)
    .map((c) => `${c.career_name}（成长性 ${c.growth_score}/100）`)
    .join("、");

  return [
    base,
    "",
    "📈 薪资历史回顾",
    salaryLine || "暂无历史薪资数据。",
    "",
    "🏆 同类别高薪职业 Top5",
    topSalary || "暂无同类对比数据。",
    "",
    "🧠 AI替代时间线预测",
    aiTimeline(career.ai_replace_risk),
    "",
    "🧭 转行推荐路径",
    transition ? `优先考虑：${transition}` : "暂无推荐路径。",
  ].join("\n");
}
