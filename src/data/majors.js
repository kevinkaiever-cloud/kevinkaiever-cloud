/**
 * 中国高考本科专业目录（2025版）
 * 来源：教育部《普通高等学校本科专业目录（2025年）》
 * 12大门类 · 93个专业类 · 845种专业（本文件收录主要/热门专业约400+）
 * 每个专业含：门类、专业类、专业名称、对应职业方向、就业热度、AI影响度
 */

// ════════════════════════════════════════════════════════════
// 12大学科门类 完整专业数据
// ════════════════════════════════════════════════════════════

export const MAJOR_CATEGORIES = [
  { key: "哲学", icon: "🤔", color: "#a78bfa" },
  { key: "经济学", icon: "💰", color: "#f59e0b" },
  { key: "法学", icon: "⚖️", color: "#ef4444" },
  { key: "教育学", icon: "📚", color: "#22c55e" },
  { key: "文学", icon: "✍️", color: "#ec4899" },
  { key: "历史学", icon: "📜", color: "#d97706" },
  { key: "理学", icon: "🔬", color: "#3b82f6" },
  { key: "工学", icon: "⚙️", color: "#6366f1" },
  { key: "农学", icon: "🌾", color: "#16a34a" },
  { key: "医学", icon: "🏥", color: "#dc2626" },
  { key: "管理学", icon: "📊", color: "#0891b2" },
  { key: "艺术学", icon: "🎨", color: "#d946ef" },
];

/**
 * MAJOR_DB 字段说明：
 * - name: 专业名称
 * - category: 学科门类
 * - subCategory: 专业类
 * - code: 专业代码
 * - careers: 典型就业方向（对应 CAREER_DB 中的职业名或描述）
 * - heat: 报考热度 1-100（越高越热门）
 * - aiImpact: AI对该专业的影响 1-100（越高AI冲击越大）
 * - salaryTier: 薪资水平 1-5（5最高）
 * - stability: 就业稳定性 1-100
 * - tags: 标签（"新专业"/"国控"/"热门"/"冷门"/"新工科"/"新医科"等）
 */

export const MAJOR_DB = [
  // ═══════════════════ 01 哲学 ═══════════════════
  { name:"哲学", category:"哲学", subCategory:"哲学类", code:"010101", careers:["公务员","高校行政","独立咨询顾问","自由撰稿人"], heat:15, aiImpact:25, salaryTier:2, stability:55, tags:["冷门"] },
  { name:"逻辑学", category:"哲学", subCategory:"哲学类", code:"010102", careers:["数据分析师","AI工程师","公务员"], heat:10, aiImpact:30, salaryTier:2, stability:50, tags:["冷门"] },
  { name:"宗教学", category:"哲学", subCategory:"哲学类", code:"010103K", careers:["公务员","大学讲师","自由撰稿人"], heat:5, aiImpact:15, salaryTier:2, stability:50, tags:["国控","冷门"] },
  { name:"伦理学", category:"哲学", subCategory:"哲学类", code:"010104T", careers:["AI伦理官","公务员","大学讲师"], heat:12, aiImpact:20, salaryTier:2, stability:55, tags:["新兴"] },

  // ═══════════════════ 02 经济学 ═══════════════════
  { name:"经济学", category:"经济学", subCategory:"经济学类", code:"020101", careers:["商业分析师","投研分析师","公务员","银行客户经理"], heat:75, aiImpact:45, salaryTier:4, stability:65, tags:["热门"] },
  { name:"经济统计学", category:"经济学", subCategory:"经济学类", code:"020102", careers:["数据分析师","商业分析师","投研分析师"], heat:55, aiImpact:55, salaryTier:3, stability:60, tags:[] },
  { name:"数字经济", category:"经济学", subCategory:"经济学类", code:"020109T", careers:["数据分析师","产品经理","电商运营"], heat:80, aiImpact:40, salaryTier:4, stability:55, tags:["热门","新专业"] },
  { name:"财政学", category:"经济学", subCategory:"财政学类", code:"020201K", careers:["公务员","税务专员","审计"], heat:60, aiImpact:35, salaryTier:3, stability:80, tags:["国控"] },
  { name:"税收学", category:"经济学", subCategory:"财政学类", code:"020202", careers:["税务专员","审计","公务员"], heat:45, aiImpact:40, salaryTier:3, stability:78, tags:[] },
  { name:"金融学", category:"经济学", subCategory:"金融学类", code:"020301K", careers:["投资经理","风控分析师","银行客户经理","基金经理"], heat:88, aiImpact:50, salaryTier:5, stability:60, tags:["热门","国控"] },
  { name:"金融工程", category:"经济学", subCategory:"金融学类", code:"020302", careers:["量化研究员","风控分析师","算法工程师"], heat:82, aiImpact:45, salaryTier:5, stability:55, tags:["热门"] },
  { name:"保险学", category:"经济学", subCategory:"金融学类", code:"020303", careers:["保险精算师","保险理赔专员","风控分析师"], heat:35, aiImpact:50, salaryTier:3, stability:65, tags:[] },
  { name:"投资学", category:"经济学", subCategory:"金融学类", code:"020304", careers:["投资经理","投研分析师","基金经理"], heat:65, aiImpact:45, salaryTier:4, stability:55, tags:[] },
  { name:"金融科技", category:"经济学", subCategory:"金融学类", code:"020310T", careers:["AI工程师","数据分析师","产品经理"], heat:85, aiImpact:35, salaryTier:5, stability:55, tags:["热门","新专业"] },
  { name:"精算学", category:"经济学", subCategory:"金融学类", code:"020308T", careers:["保险精算师","风控分析师","数据分析师"], heat:50, aiImpact:55, salaryTier:4, stability:60, tags:[] },
  { name:"国际经济与贸易", category:"经济学", subCategory:"经济与贸易类", code:"020401", careers:["跨境电商运营","国际物流专员","市场营销"], heat:55, aiImpact:40, salaryTier:3, stability:55, tags:[] },

  // ═══════════════════ 03 法学 ═══════════════════
  { name:"法学", category:"法学", subCategory:"法学类", code:"030101K", careers:["法务","合规经理","公务员","检察官助理"], heat:78, aiImpact:35, salaryTier:4, stability:75, tags:["热门","国控"] },
  { name:"知识产权", category:"法学", subCategory:"法学类", code:"030102T", careers:["法务","合规经理","AI伦理官"], heat:55, aiImpact:30, salaryTier:4, stability:70, tags:["新兴"] },
  { name:"政治学与行政学", category:"法学", subCategory:"政治学类", code:"030201", careers:["公务员","高校行政","企业咨询顾问"], heat:40, aiImpact:20, salaryTier:2, stability:72, tags:[] },
  { name:"社会学", category:"法学", subCategory:"社会学类", code:"030301", careers:["社区社工","公务员","市场营销"], heat:25, aiImpact:20, salaryTier:2, stability:60, tags:["冷门"] },
  { name:"社会工作", category:"法学", subCategory:"社会学类", code:"030302", careers:["社区社工","街道办工作人员","人力资源"], heat:20, aiImpact:15, salaryTier:2, stability:65, tags:["冷门"] },
  { name:"思想政治教育", category:"法学", subCategory:"马克思主义理论类", code:"030503", careers:["教师","公务员","高校行政"], heat:40, aiImpact:15, salaryTier:2, stability:80, tags:[] },
  { name:"治安学", category:"法学", subCategory:"公安学类", code:"030601K", careers:["警察","公务员"], heat:45, aiImpact:15, salaryTier:3, stability:90, tags:["国控"] },
  { name:"侦查学", category:"法学", subCategory:"公安学类", code:"030602K", careers:["警察","公务员"], heat:42, aiImpact:20, salaryTier:3, stability:88, tags:["国控"] },

  // ═══════════════════ 04 教育学 ═══════════════════
  { name:"教育学", category:"教育学", subCategory:"教育学类", code:"040101", careers:["教师","公立学校教师","在线教育运营"], heat:55, aiImpact:30, salaryTier:2, stability:80, tags:[] },
  { name:"科学教育", category:"教育学", subCategory:"教育学类", code:"040102", careers:["教师","中学教师","课程讲师"], heat:40, aiImpact:25, salaryTier:2, stability:78, tags:[] },
  { name:"教育技术学", category:"教育学", subCategory:"教育学类", code:"040104", careers:["在线教育运营","AI教育导师","产品经理"], heat:50, aiImpact:45, salaryTier:3, stability:60, tags:[] },
  { name:"学前教育", category:"教育学", subCategory:"教育学类", code:"040106", careers:["教师","公立学校教师"], heat:55, aiImpact:10, salaryTier:2, stability:82, tags:[] },
  { name:"小学教育", category:"教育学", subCategory:"教育学类", code:"040107", careers:["教师","公立学校教师"], heat:65, aiImpact:15, salaryTier:2, stability:85, tags:["热门"] },
  { name:"特殊教育", category:"教育学", subCategory:"教育学类", code:"040108", careers:["教师","公务员"], heat:20, aiImpact:10, salaryTier:2, stability:80, tags:["冷门"] },
  { name:"人工智能教育", category:"教育学", subCategory:"教育学类", code:"040117TK", careers:["AI教育导师","AI训练师","在线教育运营"], heat:70, aiImpact:20, salaryTier:3, stability:55, tags:["新专业","热门"] },
  { name:"体育教育", category:"教育学", subCategory:"体育学类", code:"040201", careers:["教师","健身教练","私人教练"], heat:45, aiImpact:8, salaryTier:2, stability:75, tags:[] },
  { name:"运动训练", category:"教育学", subCategory:"体育学类", code:"040202K", careers:["健身教练","私人教练","教师"], heat:40, aiImpact:5, salaryTier:2, stability:60, tags:["国控"] },
  { name:"电子竞技运动与管理", category:"教育学", subCategory:"体育学类", code:"040210TK", careers:["游戏策划","内容运营","新媒体运营"], heat:60, aiImpact:25, salaryTier:3, stability:35, tags:["新专业"] },

  // ═══════════════════ 05 文学 ═══════════════════
  { name:"汉语言文学", category:"文学", subCategory:"中国语言文学类", code:"050101", careers:["自由撰稿人","内容运营","教师","公务员"], heat:65, aiImpact:55, salaryTier:2, stability:70, tags:["热门"] },
  { name:"汉语国际教育", category:"文学", subCategory:"中国语言文学类", code:"050103", careers:["教师","翻译","公务员"], heat:35, aiImpact:40, salaryTier:2, stability:55, tags:[] },
  { name:"中国古典学", category:"文学", subCategory:"中国语言文学类", code:"050111T", careers:["大学讲师","自由撰稿人","占星咨询师"], heat:15, aiImpact:15, salaryTier:2, stability:50, tags:["新专业","冷门"] },
  { name:"英语", category:"文学", subCategory:"外国语言文学类", code:"050201", careers:["翻译","市场营销","跨境电商运营","教师"], heat:70, aiImpact:70, salaryTier:3, stability:55, tags:["热门"] },
  { name:"日语", category:"文学", subCategory:"外国语言文学类", code:"050207", careers:["翻译","跨境电商运营","游戏策划"], heat:45, aiImpact:65, salaryTier:3, stability:50, tags:[] },
  { name:"翻译", category:"文学", subCategory:"外国语言文学类", code:"050261", careers:["翻译","配音演员","跨境电商运营"], heat:50, aiImpact:75, salaryTier:3, stability:40, tags:[] },
  { name:"商务英语", category:"文学", subCategory:"外国语言文学类", code:"050262", careers:["跨境电商运营","市场营销","翻译"], heat:55, aiImpact:60, salaryTier:3, stability:50, tags:[] },
  { name:"新闻学", category:"文学", subCategory:"新闻传播学类", code:"050301", careers:["新媒体运营","内容运营","自由撰稿人"], heat:50, aiImpact:60, salaryTier:3, stability:45, tags:[] },
  { name:"广告学", category:"文学", subCategory:"新闻传播学类", code:"050303", careers:["市场营销","品牌经理","内容运营"], heat:45, aiImpact:55, salaryTier:3, stability:45, tags:[] },
  { name:"传播学", category:"文学", subCategory:"新闻传播学类", code:"050304", careers:["新媒体运营","品牌经理","公关经理"], heat:50, aiImpact:50, salaryTier:3, stability:45, tags:[] },
  { name:"网络与新媒体", category:"文学", subCategory:"新闻传播学类", code:"050306T", careers:["新媒体运营","内容运营","直播电商运营"], heat:78, aiImpact:45, salaryTier:3, stability:40, tags:["热门"] },

  // ═══════════════════ 06 历史学 ═══════════════════
  { name:"历史学", category:"历史学", subCategory:"历史学类", code:"060101", careers:["教师","公务员","自由撰稿人"], heat:20, aiImpact:20, salaryTier:2, stability:65, tags:["冷门"] },
  { name:"考古学", category:"历史学", subCategory:"历史学类", code:"060103", careers:["公务员","大学讲师"], heat:15, aiImpact:15, salaryTier:2, stability:60, tags:["冷门"] },
  { name:"文物与博物馆学", category:"历史学", subCategory:"历史学类", code:"060104", careers:["公务员","大学讲师"], heat:18, aiImpact:15, salaryTier:2, stability:65, tags:["冷门"] },

  // ═══════════════════ 07 理学 ═══════════════════
  { name:"数学与应用数学", category:"理学", subCategory:"数学类", code:"070101", careers:["算法工程师","量化研究员","数据分析师","教师"], heat:72, aiImpact:35, salaryTier:4, stability:60, tags:["热门"] },
  { name:"信息与计算科学", category:"理学", subCategory:"数学类", code:"070102", careers:["算法工程师","程序员","数据分析师"], heat:65, aiImpact:35, salaryTier:4, stability:55, tags:[] },
  { name:"物理学", category:"理学", subCategory:"物理学类", code:"070201", careers:["芯片设计工程师","大学讲师","算法工程师"], heat:45, aiImpact:25, salaryTier:3, stability:55, tags:[] },
  { name:"应用物理学", category:"理学", subCategory:"物理学类", code:"070202", careers:["芯片设计工程师","光伏工程师","材料工程师"], heat:40, aiImpact:25, salaryTier:3, stability:55, tags:[] },
  { name:"量子信息科学", category:"理学", subCategory:"物理学类", code:"070206T", careers:["算法工程师","AI工程师"], heat:55, aiImpact:15, salaryTier:5, stability:45, tags:["新专业"] },
  { name:"化学", category:"理学", subCategory:"化学类", code:"070301", careers:["材料工程师","制药工人","食品安全工程师"], heat:40, aiImpact:30, salaryTier:3, stability:55, tags:[] },
  { name:"应用化学", category:"理学", subCategory:"化学类", code:"070302", careers:["材料工程师","质量工程师","环境工程师"], heat:42, aiImpact:30, salaryTier:3, stability:55, tags:[] },
  { name:"地理科学", category:"理学", subCategory:"地理科学类", code:"070501", careers:["教师","公务员","环境工程师"], heat:30, aiImpact:25, salaryTier:2, stability:65, tags:[] },
  { name:"地理信息科学", category:"理学", subCategory:"地理科学类", code:"070504", careers:["数据分析师","程序员","环境工程师"], heat:45, aiImpact:35, salaryTier:3, stability:55, tags:[] },
  { name:"海洋科学", category:"理学", subCategory:"海洋科学类", code:"070701", careers:["环境工程师","公务员","大学讲师"], heat:25, aiImpact:20, salaryTier:2, stability:55, tags:["冷门"] },
  { name:"生物科学", category:"理学", subCategory:"生物科学类", code:"071001", careers:["临床研究协调员","生物信息分析师","大学讲师"], heat:40, aiImpact:30, salaryTier:3, stability:50, tags:[] },
  { name:"生物技术", category:"理学", subCategory:"生物科学类", code:"071002", careers:["生物信息分析师","临床研究协调员","制药工人"], heat:42, aiImpact:30, salaryTier:3, stability:50, tags:[] },
  { name:"生态学", category:"理学", subCategory:"生物科学类", code:"071004", careers:["环境工程师","公务员"], heat:22, aiImpact:20, salaryTier:2, stability:55, tags:["冷门"] },
  { name:"心理学", category:"理学", subCategory:"心理学类", code:"071101", careers:["心理咨询师","人力资源","用户研究员"], heat:55, aiImpact:25, salaryTier:3, stability:55, tags:[] },
  { name:"应用心理学", category:"理学", subCategory:"心理学类", code:"071102", careers:["心理咨询师","用户研究员","人力资源"], heat:58, aiImpact:25, salaryTier:3, stability:55, tags:[] },
  { name:"统计学", category:"理学", subCategory:"统计学类", code:"071201", careers:["数据分析师","量化研究员","商业分析师"], heat:65, aiImpact:45, salaryTier:4, stability:55, tags:[] },
  { name:"数据科学", category:"理学", subCategory:"统计学类", code:"071203T", careers:["数据分析师","数据工程师","AI算法工程师"], heat:85, aiImpact:35, salaryTier:5, stability:55, tags:["热门","新专业"] },

  // ═══════════════════ 08 工学 ═══════════════════
  { name:"机械工程", category:"工学", subCategory:"机械类", code:"080201", careers:["机械工程师","质量工程师","项目经理"], heat:55, aiImpact:30, salaryTier:3, stability:65, tags:[] },
  { name:"机械设计制造及其自动化", category:"工学", subCategory:"机械类", code:"080202", careers:["机械工程师","自动化工程师","质量工程师"], heat:60, aiImpact:35, salaryTier:3, stability:65, tags:[] },
  { name:"车辆工程", category:"工学", subCategory:"机械类", code:"080207", careers:["汽车电子工程师","机械工程师","自动驾驶工程师"], heat:55, aiImpact:30, salaryTier:3, stability:60, tags:[] },
  { name:"智能制造工程", category:"工学", subCategory:"机械类", code:"080213T", careers:["自动化工程师","机器人调试工程师","智能硬件工程师"], heat:72, aiImpact:25, salaryTier:4, stability:55, tags:["新工科","热门"] },
  { name:"新能源汽车工程", category:"工学", subCategory:"机械类", code:"080216T", careers:["新能源电池工程师","汽车电子工程师","自动驾驶工程师"], heat:78, aiImpact:25, salaryTier:4, stability:55, tags:["新工科","热门"] },
  { name:"材料科学与工程", category:"工学", subCategory:"材料类", code:"080401", careers:["材料工程师","质量工程师","芯片设计工程师"], heat:45, aiImpact:30, salaryTier:3, stability:60, tags:[] },
  { name:"新能源材料与器件", category:"工学", subCategory:"材料类", code:"080414T", careers:["新能源电池工程师","储能系统工程师","材料工程师"], heat:65, aiImpact:25, salaryTier:4, stability:55, tags:["新工科"] },
  { name:"电子信息材料", category:"工学", subCategory:"材料类", code:"080421T", careers:["半导体工艺工程师","芯片设计工程师","材料工程师"], heat:60, aiImpact:20, salaryTier:4, stability:55, tags:["新专业"] },
  { name:"能源与动力工程", category:"工学", subCategory:"能源动力类", code:"080501", careers:["电力公司员工","光伏工程师","机械工程师"], heat:50, aiImpact:25, salaryTier:3, stability:70, tags:[] },
  { name:"新能源科学与工程", category:"工学", subCategory:"能源动力类", code:"080503T", careers:["光伏工程师","储能系统工程师","电力公司员工"], heat:70, aiImpact:20, salaryTier:4, stability:60, tags:["新工科","热门"] },
  { name:"储能科学与工程", category:"工学", subCategory:"能源动力类", code:"080504T", careers:["储能系统工程师","电气工程师","新能源电池工程师"], heat:68, aiImpact:20, salaryTier:4, stability:55, tags:["新工科"] },
  { name:"电气工程及其自动化", category:"工学", subCategory:"电气类", code:"080601", careers:["电气工程师","电力公司员工","自动化工程师"], heat:75, aiImpact:25, salaryTier:4, stability:75, tags:["热门"] },
  { name:"电子信息工程", category:"工学", subCategory:"电子信息类", code:"080701", careers:["嵌入式工程师","智能硬件工程师","通信工程"], heat:72, aiImpact:30, salaryTier:4, stability:60, tags:["热门"] },
  { name:"通信工程", category:"工学", subCategory:"电子信息类", code:"080703", careers:["运维工程师","嵌入式工程师","物联网工程师"], heat:68, aiImpact:30, salaryTier:4, stability:60, tags:[] },
  { name:"微电子科学与工程", category:"工学", subCategory:"电子信息类", code:"080704", careers:["芯片设计工程师","IC验证工程师","半导体工艺工程师"], heat:78, aiImpact:20, salaryTier:5, stability:60, tags:["热门"] },
  { name:"集成电路设计与集成系统", category:"工学", subCategory:"电子信息类", code:"080710T", careers:["芯片设计工程师","IC验证工程师"], heat:85, aiImpact:20, salaryTier:5, stability:60, tags:["热门","新工科"] },
  { name:"人工智能", category:"工学", subCategory:"电子信息类", code:"080717T", careers:["AI工程师","AI算法工程师","机器学习工程师","AI产品经理"], heat:95, aiImpact:15, salaryTier:5, stability:50, tags:["热门","新工科"] },
  { name:"自动化", category:"工学", subCategory:"自动化类", code:"080801", careers:["自动化工程师","机器人调试工程师","算法工程师"], heat:65, aiImpact:30, salaryTier:4, stability:60, tags:[] },
  { name:"机器人工程", category:"工学", subCategory:"自动化类", code:"080803T", careers:["机器人调试工程师","自动化工程师","机器人产品经理"], heat:75, aiImpact:20, salaryTier:4, stability:55, tags:["新工科","热门"] },
  { name:"计算机科学与技术", category:"工学", subCategory:"计算机类", code:"080901", careers:["程序员","算法工程师","AI工程师","运维工程师"], heat:92, aiImpact:35, salaryTier:5, stability:55, tags:["热门"] },
  { name:"软件工程", category:"工学", subCategory:"计算机类", code:"080902", careers:["程序员","前端开发工程师","后端开发工程师","测试工程师"], heat:90, aiImpact:40, salaryTier:5, stability:55, tags:["热门"] },
  { name:"网络工程", category:"工学", subCategory:"计算机类", code:"080903", careers:["网络安全工程师","运维工程师","DevOps工程师"], heat:60, aiImpact:30, salaryTier:4, stability:60, tags:[] },
  { name:"信息安全", category:"工学", subCategory:"计算机类", code:"080904K", careers:["网络安全工程师","信息安全经理"], heat:70, aiImpact:25, salaryTier:4, stability:65, tags:["国控"] },
  { name:"物联网工程", category:"工学", subCategory:"计算机类", code:"080905", careers:["物联网工程师","嵌入式工程师","智能硬件工程师"], heat:58, aiImpact:25, salaryTier:4, stability:55, tags:[] },
  { name:"数据科学与大数据技术", category:"工学", subCategory:"计算机类", code:"080910T", careers:["数据工程师","数据分析师","AI算法工程师","BI工程师"], heat:88, aiImpact:35, salaryTier:5, stability:55, tags:["热门","新工科"] },
  { name:"网络空间安全", category:"工学", subCategory:"计算机类", code:"080911TK", careers:["网络安全工程师","信息安全经理"], heat:72, aiImpact:25, salaryTier:4, stability:60, tags:["国控"] },
  { name:"虚拟现实技术", category:"工学", subCategory:"计算机类", code:"080916T", careers:["游戏开发","计算机视觉工程师","AIGC设计师"], heat:55, aiImpact:30, salaryTier:4, stability:45, tags:["新工科"] },
  { name:"区块链工程", category:"工学", subCategory:"计算机类", code:"080917T", careers:["程序员","算法工程师"], heat:40, aiImpact:30, salaryTier:4, stability:35, tags:["新工科"] },
  { name:"土木工程", category:"工学", subCategory:"土木类", code:"081001", careers:["建筑工人","结构工程师","项目经理"], heat:30, aiImpact:25, salaryTier:3, stability:55, tags:["下降"] },
  { name:"建筑学", category:"工学", subCategory:"建筑类", code:"082801", careers:["结构工程师","项目经理"], heat:35, aiImpact:35, salaryTier:3, stability:50, tags:["下降"] },
  { name:"化学工程与工艺", category:"工学", subCategory:"化工与制药类", code:"081301", careers:["工艺工程师","质量工程师","环境工程师"], heat:38, aiImpact:25, salaryTier:3, stability:60, tags:[] },
  { name:"生物工程", category:"工学", subCategory:"生物工程类", code:"083001", careers:["生物信息分析师","临床研究协调员","制药工人"], heat:35, aiImpact:25, salaryTier:3, stability:50, tags:[] },
  { name:"食品科学与工程", category:"工学", subCategory:"食品科学与工程类", code:"082701", careers:["食品安全工程师","质量工程师","食品加工工人"], heat:35, aiImpact:20, salaryTier:2, stability:60, tags:[] },
  { name:"环境工程", category:"工学", subCategory:"环境科学与工程类", code:"082502", careers:["环境工程师","ESG分析师","碳管理经理"], heat:35, aiImpact:25, salaryTier:3, stability:55, tags:[] },
  { name:"航空航天工程", category:"工学", subCategory:"航空航天类", code:"082001", careers:["国有企业工程师","结构工程师","机械工程师"], heat:60, aiImpact:20, salaryTier:4, stability:70, tags:[] },
  { name:"低空技术与工程", category:"工学", subCategory:"航空航天类", code:"082011T", careers:["智能硬件工程师","自动化工程师"], heat:70, aiImpact:15, salaryTier:4, stability:50, tags:["新专业","热门"] },
  { name:"交通运输", category:"工学", subCategory:"交通运输类", code:"081801", careers:["铁路调度员","项目经理","供应链经理"], heat:42, aiImpact:30, salaryTier:3, stability:65, tags:[] },
  { name:"纺织工程", category:"工学", subCategory:"纺织类", code:"081601", careers:["纺织工","工艺工程师","质量工程师"], heat:15, aiImpact:30, salaryTier:2, stability:50, tags:["冷门"] },
  { name:"采矿工程", category:"工学", subCategory:"矿业类", code:"081501", careers:["矿工","国有企业工程师"], heat:12, aiImpact:25, salaryTier:3, stability:55, tags:["冷门"] },

  // ═══════════════════ 09 农学 ═══════════════════
  { name:"农学", category:"农学", subCategory:"植物生产类", code:"090101", careers:["农民","果农","公务员"], heat:18, aiImpact:25, salaryTier:2, stability:60, tags:["冷门"] },
  { name:"园艺", category:"农学", subCategory:"植物生产类", code:"090102", careers:["园林工","果农"], heat:15, aiImpact:20, salaryTier:2, stability:55, tags:["冷门"] },
  { name:"植物保护", category:"农学", subCategory:"植物生产类", code:"090103", careers:["公务员","大学讲师"], heat:15, aiImpact:20, salaryTier:2, stability:58, tags:["冷门"] },
  { name:"智慧农业", category:"农学", subCategory:"植物生产类", code:"090112T", careers:["数据分析师","物联网工程师","农民"], heat:45, aiImpact:20, salaryTier:3, stability:50, tags:["新专业","新农科"] },
  { name:"生物育种技术", category:"农学", subCategory:"植物生产类", code:"090113T", careers:["生物信息分析师","大学讲师"], heat:35, aiImpact:20, salaryTier:3, stability:50, tags:["新专业","新农科"] },
  { name:"动物科学", category:"农学", subCategory:"动物生产类", code:"090301", careers:["养殖工","公务员"], heat:15, aiImpact:15, salaryTier:2, stability:55, tags:["冷门"] },
  { name:"动物医学", category:"农学", subCategory:"动物医学类", code:"090401", careers:["宠物美容师","宠物训练师","公务员"], heat:42, aiImpact:15, salaryTier:3, stability:60, tags:[] },
  { name:"林学", category:"农学", subCategory:"林学类", code:"090501", careers:["公务员","园林工"], heat:12, aiImpact:15, salaryTier:2, stability:60, tags:["冷门"] },
  { name:"水产养殖学", category:"农学", subCategory:"水产类", code:"090601", careers:["渔民","养殖工","公务员"], heat:12, aiImpact:15, salaryTier:2, stability:55, tags:["冷门"] },

  // ═══════════════════ 10 医学 ═══════════════════
  { name:"基础医学", category:"医学", subCategory:"基础医学类", code:"100101K", careers:["临床医生","大学讲师"], heat:45, aiImpact:20, salaryTier:3, stability:70, tags:["国控"] },
  { name:"临床医学", category:"医学", subCategory:"临床医学类", code:"100201K", careers:["临床医生","医生"], heat:90, aiImpact:20, salaryTier:4, stability:90, tags:["热门","国控"] },
  { name:"口腔医学", category:"医学", subCategory:"口腔医学类", code:"100301K", careers:["临床医生","医生"], heat:88, aiImpact:15, salaryTier:5, stability:85, tags:["热门","国控"] },
  { name:"预防医学", category:"医学", subCategory:"公共卫生与预防医学类", code:"100401K", careers:["公共卫生专员","公务员","医生"], heat:50, aiImpact:20, salaryTier:3, stability:80, tags:["国控"] },
  { name:"中医学", category:"医学", subCategory:"中医学类", code:"100501K", careers:["医生","临床医生","心理咨询师"], heat:55, aiImpact:15, salaryTier:3, stability:75, tags:["国控"] },
  { name:"针灸推拿学", category:"医学", subCategory:"中医学类", code:"100502K", careers:["按摩师","康复治疗师","医生"], heat:40, aiImpact:8, salaryTier:3, stability:70, tags:["国控"] },
  { name:"药学", category:"医学", subCategory:"药学类", code:"100701", careers:["药剂师","药品注册专员","临床研究协调员"], heat:60, aiImpact:30, salaryTier:3, stability:65, tags:[] },
  { name:"中药学", category:"医学", subCategory:"中药学类", code:"100801", careers:["药剂师","公务员"], heat:35, aiImpact:20, salaryTier:3, stability:65, tags:[] },
  { name:"医学检验技术", category:"医学", subCategory:"医学技术类", code:"101001", careers:["医生","公立医院护士"], heat:55, aiImpact:35, salaryTier:3, stability:70, tags:[] },
  { name:"医学影像技术", category:"医学", subCategory:"医学技术类", code:"101003", careers:["医生","临床医生"], heat:55, aiImpact:40, salaryTier:3, stability:70, tags:[] },
  { name:"康复治疗学", category:"医学", subCategory:"医学技术类", code:"101005", careers:["康复治疗师","医生"], heat:45, aiImpact:15, salaryTier:3, stability:65, tags:[] },
  { name:"护理学", category:"医学", subCategory:"护理学类", code:"101101K", careers:["公立医院护士","护理人员","护工"], heat:60, aiImpact:15, salaryTier:2, stability:85, tags:["国控"] },
  { name:"健康科学与技术", category:"医学", subCategory:"医学技术类", code:"101013T", careers:["营养师","康复治疗师","健身教练"], heat:45, aiImpact:20, salaryTier:3, stability:55, tags:["新专业","新医科"] },

  // ═══════════════════ 11 管理学 ═══════════════════
  { name:"管理科学", category:"管理学", subCategory:"管理科学与工程类", code:"120101", careers:["项目经理","企业咨询顾问","商业分析师"], heat:45, aiImpact:40, salaryTier:3, stability:55, tags:[] },
  { name:"信息管理与信息系统", category:"管理学", subCategory:"管理科学与工程类", code:"120102", careers:["数据分析师","产品经理","IT支持工程师"], heat:55, aiImpact:45, salaryTier:3, stability:55, tags:[] },
  { name:"工程管理", category:"管理学", subCategory:"管理科学与工程类", code:"120103", careers:["项目经理","PMO","供应链经理"], heat:48, aiImpact:35, salaryTier:3, stability:60, tags:[] },
  { name:"大数据管理与应用", category:"管理学", subCategory:"管理科学与工程类", code:"120108T", careers:["数据分析师","数据工程师","商业分析师"], heat:78, aiImpact:35, salaryTier:4, stability:55, tags:["热门","新专业"] },
  { name:"工商管理", category:"管理学", subCategory:"工商管理类", code:"120201K", careers:["项目经理","市场营销","人力资源","销售经理"], heat:65, aiImpact:40, salaryTier:3, stability:55, tags:["国控"] },
  { name:"市场营销", category:"管理学", subCategory:"工商管理类", code:"120202", careers:["市场营销","品牌经理","销售经理","电商运营"], heat:60, aiImpact:45, salaryTier:3, stability:50, tags:[] },
  { name:"会计学", category:"管理学", subCategory:"工商管理类", code:"120203K", careers:["审计","财务分析师","公务员"], heat:70, aiImpact:65, salaryTier:3, stability:65, tags:["国控"] },
  { name:"财务管理", category:"管理学", subCategory:"工商管理类", code:"120204", careers:["财务分析师","审计","银行客户经理"], heat:68, aiImpact:60, salaryTier:3, stability:60, tags:[] },
  { name:"人力资源管理", category:"管理学", subCategory:"工商管理类", code:"120206", careers:["人力资源","招聘经理","组织发展"], heat:55, aiImpact:45, salaryTier:3, stability:55, tags:[] },
  { name:"审计学", category:"管理学", subCategory:"工商管理类", code:"120207", careers:["审计","审计局工作人员","财务分析师"], heat:52, aiImpact:55, salaryTier:3, stability:65, tags:[] },
  { name:"公共事业管理", category:"管理学", subCategory:"公共管理类", code:"120401", careers:["公务员","事业单位管理","街道办工作人员"], heat:30, aiImpact:30, salaryTier:2, stability:70, tags:[] },
  { name:"行政管理", category:"管理学", subCategory:"公共管理类", code:"120402", careers:["公务员","高校行政","事业单位管理"], heat:50, aiImpact:35, salaryTier:2, stability:75, tags:[] },
  { name:"物流管理", category:"管理学", subCategory:"物流管理与工程类", code:"120601", careers:["物流经理","供应链经理","仓库管理员"], heat:42, aiImpact:40, salaryTier:3, stability:55, tags:[] },
  { name:"电子商务", category:"管理学", subCategory:"电子商务类", code:"120801", careers:["电商运营","直播电商运营","跨境电商运营","产品经理"], heat:62, aiImpact:40, salaryTier:3, stability:45, tags:[] },
  { name:"旅游管理", category:"管理学", subCategory:"旅游管理类", code:"120901K", careers:["酒店经理","旅行社产品经理","导游"], heat:25, aiImpact:35, salaryTier:2, stability:40, tags:["国控","下降"] },

  // ═══════════════════ 12 艺术学 ═══════════════════
  { name:"艺术学理论", category:"艺术学", subCategory:"艺术学理论类", code:"130101", careers:["大学讲师","自由撰稿人","策划"], heat:15, aiImpact:30, salaryTier:2, stability:45, tags:["冷门"] },
  { name:"音乐表演", category:"艺术学", subCategory:"音乐与舞蹈学类", code:"130201", careers:["音乐制作人","配音演员","课程讲师"], heat:40, aiImpact:25, salaryTier:2, stability:35, tags:[] },
  { name:"音乐学", category:"艺术学", subCategory:"音乐与舞蹈学类", code:"130202", careers:["教师","音乐制作人","课程讲师"], heat:38, aiImpact:25, salaryTier:2, stability:45, tags:[] },
  { name:"舞蹈学", category:"艺术学", subCategory:"音乐与舞蹈学类", code:"130205", careers:["教师","私人教练","课程讲师"], heat:30, aiImpact:10, salaryTier:2, stability:35, tags:[] },
  { name:"表演", category:"艺术学", subCategory:"戏剧与影视学类", code:"130301", careers:["主播","配音演员","模特经纪"], heat:50, aiImpact:30, salaryTier:2, stability:25, tags:[] },
  { name:"戏剧影视文学", category:"艺术学", subCategory:"戏剧与影视学类", code:"130304", careers:["剪辑师","内容运营","自由撰稿人"], heat:35, aiImpact:45, salaryTier:2, stability:35, tags:[] },
  { name:"广播电视编导", category:"艺术学", subCategory:"戏剧与影视学类", code:"130305", careers:["剪辑师","新媒体运营","AIGC视频导演"], heat:40, aiImpact:50, salaryTier:3, stability:35, tags:[] },
  { name:"动画", category:"艺术学", subCategory:"戏剧与影视学类", code:"130310", careers:["动画师","游戏美术","AIGC设计师"], heat:50, aiImpact:55, salaryTier:3, stability:40, tags:[] },
  { name:"美术学", category:"艺术学", subCategory:"美术学类", code:"130401", careers:["插画师","教师","AIGC设计师"], heat:35, aiImpact:50, salaryTier:2, stability:40, tags:[] },
  { name:"绘画", category:"艺术学", subCategory:"美术学类", code:"130402", careers:["插画师","平面设计师","AIGC设计师"], heat:30, aiImpact:55, salaryTier:2, stability:30, tags:[] },
  { name:"视觉传达设计", category:"艺术学", subCategory:"设计学类", code:"130502", careers:["UI设计师","视觉设计师","平面设计师","AIGC设计师"], heat:60, aiImpact:60, salaryTier:3, stability:40, tags:[] },
  { name:"环境设计", category:"艺术学", subCategory:"设计学类", code:"130503", careers:["工业设计师","UI设计师"], heat:42, aiImpact:45, salaryTier:3, stability:40, tags:[] },
  { name:"产品设计", category:"艺术学", subCategory:"设计学类", code:"130504", careers:["工业设计师","UI设计师","产品经理"], heat:48, aiImpact:45, salaryTier:3, stability:42, tags:[] },
  { name:"数字媒体艺术", category:"艺术学", subCategory:"设计学类", code:"130508", careers:["AIGC设计师","剪辑师","动画师","游戏美术"], heat:65, aiImpact:50, salaryTier:3, stability:40, tags:["热门"] },
  { name:"数字戏剧", category:"艺术学", subCategory:"戏剧与影视学类", code:"130313T", careers:["AIGC视频导演","虚拟人运营","动画师"], heat:40, aiImpact:35, salaryTier:3, stability:35, tags:["新专业"] },
];

// ═══════════════════ 辅助函数 ═══════════════════

export const MAJOR_MAP = MAJOR_DB.reduce((acc, m) => { acc[m.name] = m; return acc; }, {});

export const MAJOR_CATEGORY_LIST = [...new Set(MAJOR_DB.map(m => m.category))];

export const MAJOR_SUBCATEGORY_LIST = [...new Set(MAJOR_DB.map(m => m.subCategory))];

/**
 * 根据门类筛选专业
 */
export function filterMajors({ category, search, tags } = {}) {
  return MAJOR_DB.filter(m => {
    if (category && category !== "全部" && m.category !== category) return false;
    if (search && !m.name.includes(search) && !m.subCategory.includes(search)) return false;
    if (tags && tags.length > 0 && !tags.some(t => m.tags.includes(t))) return false;
    return true;
  });
}

/**
 * 计算专业与职业的匹配度
 * 基于 careers 字段和 CAREER_DB 的交集
 */
export function calcMajorCareerMatch(majorName, careerName) {
  const major = MAJOR_MAP[majorName];
  if (!major) return 0;
  if (major.careers.includes(careerName)) return 95;
  // 模糊匹配
  const hit = major.careers.some(c =>
    careerName.includes(c) || c.includes(careerName)
  );
  return hit ? 75 : 20;
}

/**
 * 获取热门/冷门/新专业排行
 */
export function getMajorRankings(type = "hot", count = 10) {
  const sorted = [...MAJOR_DB];
  switch (type) {
    case "hot": sorted.sort((a, b) => b.heat - a.heat); break;
    case "cold": sorted.sort((a, b) => a.heat - b.heat); break;
    case "aiHigh": sorted.sort((a, b) => b.aiImpact - a.aiImpact); break;
    case "aiLow": sorted.sort((a, b) => a.aiImpact - b.aiImpact); break;
    case "salary": sorted.sort((a, b) => b.salaryTier - a.salaryTier); break;
    case "stable": sorted.sort((a, b) => b.stability - a.stability); break;
    default: break;
  }
  return sorted.slice(0, count);
}
