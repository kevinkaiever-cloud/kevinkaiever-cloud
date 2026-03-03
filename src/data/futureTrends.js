import { CAREER_DB } from "./careers.js";

const FUTURE_TYPES = {
  // ━━ AI冲击维度 ━━
  AI_REPLACE:   { label: "AI直接替代", emoji: "🤖📉", color: "#ef4444", demandSlope: -2.5, salarySlope: -1.5 },
  AI_SPLIT:     { label: "AI分化(高端留存)", emoji: "⚡", color: "#f59e0b", demandSlope: -1.0, salarySlope: 0.5 },
  AI_BOOST:     { label: "AI增强", emoji: "🚀", color: "#22c55e", demandSlope: 2.0, salarySlope: 2.5 },

  // ━━ 人口结构维度 ━━
  DEMO_SHRINK:  { label: "人口收缩冲击", emoji: "👶📉", color: "#f97316", demandSlope: -1.5, salarySlope: -0.5 },
  AGING_BOOM:   { label: "老龄化红利", emoji: "🧓📈", color: "#22c55e", demandSlope: 1.8, salarySlope: 1.5 },
  MEDICAL:      { label: "医疗刚需增长", emoji: "🏥📈", color: "#06b6d4", demandSlope: 1.2, salarySlope: 1.0 },

  // ━━ 不可标准化维度 ━━
  PHYSICAL_SKILL: { label: "技工荒·不可替代", emoji: "🔧📈", color: "#10b981", demandSlope: 0.8, salarySlope: 1.2 },
  CRAFT:          { label: "手艺体验型", emoji: "✂️", color: "#8b5cf6", demandSlope: 0.5, salarySlope: 0.8 },
  TRUST:          { label: "信任关系型", emoji: "🤝📈", color: "#6366f1", demandSlope: 1.0, salarySlope: 1.0 },

  // ━━ 产业趋势维度 ━━
  GREEN:        { label: "绿色能源", emoji: "🌱📈", color: "#22c55e", demandSlope: 1.5, salarySlope: 1.5 },
  HARD_TECH:    { label: "硬科技国产替代", emoji: "🔬📈", color: "#3b82f6", demandSlope: 1.2, salarySlope: 1.5 },
  REAL_ESTATE:  { label: "房地产下行", emoji: "🏠📉", color: "#ef4444", demandSlope: -1.0, salarySlope: -0.8 },
  TRANSPORT:    { label: "自动驾驶威胁", emoji: "🚗📉", color: "#f97316", demandSlope: -0.8, salarySlope: -0.3 },
  FINTECH:      { label: "金融科技替代", emoji: "💳📉", color: "#ef4444", demandSlope: -1.5, salarySlope: -1.0 },
  ECOM_PEAK:    { label: "电商/直播见顶", emoji: "📱➡️", color: "#f59e0b", demandSlope: -0.5, salarySlope: -0.3 },
  GOV:          { label: "体制内编制收缩", emoji: "🏛️➡️", color: "#64748b", demandSlope: -0.3, salarySlope: 0.2 },

  // ━━ 追加 ━━
  FIN_HIGH:     { label: "金融高端", emoji: "💰", color: "#f59e0b", demandSlope: 0.3, salarySlope: 0.5 },

  // ━━ 默认 ━━
  NEUTRAL:      { label: "温和波动", emoji: "➡️", color: "#94a3b8", demandSlope: 0.0, salarySlope: 0.3 },
};

const LISTS = {
  AI_REPLACE: [
    "前台接待","收银员","售票员","票务员","剪辑师","摄影后期","客服主管",
    "档案管理员","数据标注经理","配音演员","翻译",
  ],
  AI_SPLIT: [
    "程序员","后端开发工程师","前端开发工程师","全栈开发工程师","测试工程师",
    "UI设计师","视觉设计师","内容运营","新媒体运营","财务分析师","技术写作",
    "医学编辑","插画师","平面设计师","自由撰稿人",
  ],
  AI_BOOST: [
    "算法工程师","机器学习工程师","语音算法工程师","地图算法工程师",
    "芯片设计工程师","IC验证工程师","自动驾驶工程师",
    "AI工程师","AI算法工程师","AI提示词工程师","AI内容创作者","AI产品经理",
    "虚拟人运营","自动化运营专家","智能体设计师","AIGC设计师","AIGC视频导演",
    "AI训练师","AI质检师","AI安全治理专家","AI伦理官","数字人产品经理",
    "机器人产品经理","多模态算法工程师","联邦学习工程师","MLOps工程师",
    "AI知识库工程师","RPA流程设计师","低代码自动化工程师",
    "AI教育导师","AI商业顾问","算力调度工程师","计算机视觉工程师",
  ],
  DEMO_SHRINK: [
    "教育产品经理","中学教师","在线教育运营","教师","高校行政","公立学校教师","课程讲师",
  ],
  AGING_BOOM: [
    "保姆","月嫂","护工","护理人员","心理咨询师","营养师","康复治疗师",
    "公共卫生专员","家政服务经理",
  ],
  MEDICAL: [
    "临床医生","药剂师","临床研究协调员","药品注册专员","生物信息分析师",
    "食品安全工程师","医生","公立医院护士","公立医院药师",
  ],
  PHYSICAL_SKILL: [
    "厨师","厨师长","面点师","烘焙师","电工","水管工","电焊工","木工","瓦工",
    "泥瓦工","钢筋工","高空作业工","隧道工","家电维修","手机维修","汽修工","上门维修师",
  ],
  CRAFT: [
    "理发师","裁缝","钟表维修","美容师","美甲师","按摩师","宠物美容师","宠物训练师","纹身师",
  ],
  TRUST: [
    "企业咨询顾问","金融顾问","独立咨询顾问","婚礼策划师","旅行定制师",
    "私人教练","占星咨询师","穿搭顾问",
  ],
  GREEN: [
    "ESG分析师","碳管理经理","环境工程师","新能源电池工程师","储能系统工程师","光伏工程师",
  ],
  HARD_TECH: [
    "智能硬件工程师","物联网工程师","嵌入式工程师","半导体工艺工程师",
    "材料工程师","机器人调试工程师","汽车电子工程师",
  ],
  REAL_ESTATE: [
    "建筑工人","测量员","房地产策划","物业经理","房地产中介",
  ],
  TRANSPORT: [
    "司机","公交司机","出租车司机","货车司机","冷链司机","叉车司机",
  ],
  FINTECH: [
    "理财经理","保险理赔专员","银行客户经理","证券经纪人",
  ],
  ECOM_PEAK: [
    "电商运营","跨境电商运营","直播电商运营","主播","网店店主","直播带货","微商",
  ],
  GOV: [
    "银行柜员","公务员","国企员工","社区社工","街道办工作人员","税务专员",
    "海关关员","法院书记员","检察官助理","警察","消防员","军人",
    "事业单位管理","邮政员工","铁路调度员","地铁站务员","电力公司员工",
    "自来水公司员工","国有企业工程师","统计局工作人员","市场监管专员",
    "审计局工作人员","交通管理执法","公共资源交易管理","政府信息化工程师",
  ],
  FIN_HIGH: [
    "量化研究员","基金经理","投资经理","保险精算师","风控分析师",
  ],
};

const LIST_SETS = Object.fromEntries(
  Object.entries(LISTS).map(([key, list]) => [key, new Set(list)])
);

function classifyCareer(name) {
  for (const [key, set] of Object.entries(LIST_SETS)) {
    if (set.has(name)) return key;
  }
  return "NEUTRAL";
}

const CAREER_FUTURE_MAP = CAREER_DB.reduce((acc, career) => {
  acc[career.career_name] = classifyCareer(career.career_name);
  return acc;
}, {});

export { FUTURE_TYPES, CAREER_FUTURE_MAP };
