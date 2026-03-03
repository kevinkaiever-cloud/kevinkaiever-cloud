const COMPANY_LIST = [
  // 互联网
  { company: "腾讯", type: "internet", baseHiring: 62, growthBias: 0 },
  { company: "阿里巴巴", type: "internet", baseHiring: 58, growthBias: -0.1 },
  { company: "字节跳动", type: "internet", baseHiring: 55, growthBias: 0.3 },
  { company: "美团", type: "internet", baseHiring: 52, growthBias: 0.2 },
  { company: "京东", type: "internet", baseHiring: 54, growthBias: -0.05 },
  { company: "百度", type: "internet", baseHiring: 50, growthBias: -0.15 },
  { company: "网易", type: "internet", baseHiring: 48, growthBias: 0.05 },
  { company: "拼多多", type: "internet", baseHiring: 46, growthBias: 0.4 },
  { company: "小米", type: "internet", baseHiring: 52, growthBias: 0.1 },
  { company: "滴滴", type: "internet", baseHiring: 44, growthBias: -0.2 },
  { company: "华为", type: "tech", baseHiring: 68, growthBias: 0.15 },
  // 科技/制造
  { company: "比亚迪", type: "manufacture", baseHiring: 58, growthBias: 0.35 },
  { company: "宁德时代", type: "manufacture", baseHiring: 55, growthBias: 0.4 },
  { company: "联想", type: "tech", baseHiring: 48, growthBias: -0.05 },
  // 国企/央企
  { company: "国家电网", type: "state", baseHiring: 54, growthBias: 0 },
  { company: "中国移动", type: "state", baseHiring: 52, growthBias: 0.05 },
  { company: "中国石油", type: "state", baseHiring: 50, growthBias: -0.05 },
  { company: "中国建筑", type: "state", baseHiring: 48, growthBias: -0.1 },
  { company: "中国航天", type: "state", baseHiring: 46, growthBias: 0.1 },
  // 银行/金融
  { company: "中国银行", type: "bank", baseHiring: 56, growthBias: 0 },
  { company: "工商银行", type: "bank", baseHiring: 54, growthBias: -0.05 },
  { company: "建设银行", type: "bank", baseHiring: 52, growthBias: -0.05 },
  { company: "招商银行", type: "bank", baseHiring: 55, growthBias: 0.05 },
  // 外资/跨国
  { company: "Google", type: "global", baseHiring: 60, growthBias: 0.1 },
  { company: "Microsoft", type: "global", baseHiring: 58, growthBias: 0.15 },
  { company: "Amazon", type: "global", baseHiring: 56, growthBias: -0.05 },
  { company: "Apple", type: "global", baseHiring: 52, growthBias: 0.05 },
  { company: "Meta", type: "global", baseHiring: 50, growthBias: -0.1 },
  { company: "Tesla", type: "global", baseHiring: 48, growthBias: 0.25 },
];

export { COMPANY_LIST };
