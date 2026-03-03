// ─── Category & Classification ───────────────────────────────────
export const CATEGORY_TAGS = [
  { key: "全部", label: "全部", icon: "🧭" },
  { key: "传统", label: "传统", icon: "🧱" },
  { key: "现代", label: "现代", icon: "⚙️" },
  { key: "体制内", label: "体制内", icon: "🏛️" },
  { key: "AI", label: "AI", icon: "🤖" },
  { key: "自由职业", label: "自由职业", icon: "🧑‍💼" },
];

export const SUBCATEGORY_MAP = {
  传统: [
    { key: "餐饮", patterns: /厨师|面点|烘焙|服务员|客房/ },
    { key: "建筑工地", patterns: /建筑|瓦工|钢筋|抹灰|电焊|木工|油漆|测量/ },
    { key: "运输物流", patterns: /司机|货车|快递|仓库|装卸|搬运|物流/ },
    { key: "维修服务", patterns: /维修|汽修|水管|电工|家电|手机|钟表/ },
    { key: "农林渔牧", patterns: /农|渔|养殖|果农/ },
    { key: "生活服务", patterns: /保洁|保安|保姆|月嫂|美容|美甲|按摩/ },
  ],
  现代: [
    { key: "研发工程", patterns: /开发|工程师|架构|运维|DevOps|嵌入式|物联网|算法/ },
    { key: "数据智能", patterns: /数据|BI|分析|算法|机器学习|AI/ },
    { key: "产品设计", patterns: /产品经理|UI|设计|交互|用户研究/ },
    { key: "运营增长", patterns: /运营|增长|内容|社区|新媒体/ },
    { key: "市场销售", patterns: /市场|品牌|公关|销售|客户成功/ },
    { key: "职能支持", patterns: /人力|法务|财务|审计|合规|采购|供应链/ },
  ],
  体制内: [
    { key: "教育医疗", patterns: /教师|医生|护士|药师|卫生/ },
    { key: "政府机关", patterns: /公务员|税务|海关|法院|检察|警察|消防/ },
    { key: "国企央企", patterns: /国企|电力|铁路|邮政|地铁/ },
    { key: "公共服务", patterns: /社区|事业单位|统计|市场监管/ },
  ],
  AI: [
    { key: "算法研发", patterns: /算法|多模态|联邦|MLOps|模型/ },
    { key: "产品应用", patterns: /AI产品|知识库|智能体|RPA|自动化/ },
    { key: "内容创作", patterns: /内容|AIGC|虚拟人|数字人/ },
    { key: "治理安全", patterns: /安全|伦理|治理|质检/ },
  ],
  自由职业: [
    { key: "内容创作", patterns: /撰稿|插画|摄影|剪辑|配音|音乐/ },
    { key: "咨询服务", patterns: /咨询|顾问|课程|培训/ },
    { key: "电商零售", patterns: /网店|带货|二手|微商/ },
    { key: "本地生活", patterns: /家政|美容|宠物|维修/ },
  ],
};

export const TIME_RANGES = [
  { label: "3M", months: 3, granularity: "day" },
  { label: "6M", months: 6, granularity: "day" },
  { label: "1Y", months: 12, granularity: "month" },
  { label: "3Y", months: 36, granularity: "quarter" },
  { label: "5Y", months: 60, granularity: "half" },
  { label: "10Y", months: 120, granularity: "year" },
  { label: "ALL", months: 9999, granularity: "year" },
];

export const VIEW_TABS = [
  { key: "career", label: "职业K线", icon: "📈" },
  { key: "compare", label: "职业对比", icon: "⚖️" },
  { key: "company", label: "公司用工", icon: "🏢" },
  { key: "gaokao", label: "高考专题", icon: "🎓" },
];

export function resolveSubcategory(item) {
  const groups = SUBCATEGORY_MAP[item.category] || [];
  const hit = groups.find((group) => group.patterns.test(item.career_name));
  return hit ? hit.key : "其他";
}
