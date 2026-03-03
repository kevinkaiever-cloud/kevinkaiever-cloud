import { db } from "../data/db.js";
import { CAREER_DB } from "../../src/data/careers.js";

const CAREER_KEYWORDS = [
  { keyword: /前端|前端开发|H5|Web前端/i, career: "前端开发工程师" },
  { keyword: /后端|后台开发|后端开发/i, career: "后端开发工程师" },
  { keyword: /全栈/i, career: "全栈开发工程师" },
  { keyword: /移动端|移动开发|安卓|Android|iOS|客户端|App开发/i, career: "移动端开发工程师" },
  { keyword: /测试|QA|质量测试|测试工程/i, career: "测试工程师" },
  { keyword: /运维|SRE|站点可靠性/i, career: "运维工程师" },
  { keyword: /网络安全|信息安全|安全工程师/i, career: "网络安全工程师" },
  { keyword: /网络工程/i, career: "运维工程师" },
  { keyword: /数据库|DBA/i, career: "数据库管理员" },
  { keyword: /数据分析|数据分析师/i, career: "数据分析师" },
  { keyword: /商业分析/i, career: "商业分析师" },
  { keyword: /数据工程/i, career: "数据工程师" },
  { keyword: /机器学习|深度学习/i, career: "机器学习工程师" },
  { keyword: /算法/i, career: "算法工程师" },
  { keyword: /自然语言|NLP/i, career: "自然语言处理工程师" },
  { keyword: /计算机视觉|视觉算法|图像算法|CV/i, career: "计算机视觉工程师" },
  { keyword: /产品经理|产品负责人|产品岗/i, career: "产品经理" },
  { keyword: /项目经理|项目管理|项目管理工程师/i, career: "项目经理" },
  { keyword: /PMO/i, career: "PMO" },
  { keyword: /UI|UX|界面设计/i, career: "UI设计师" },
  { keyword: /视觉设计|视觉/i, career: "视觉设计师" },
  { keyword: /交互设计|交互/i, career: "交互设计师" },
  { keyword: /平面设计/i, career: "平面设计师" },
  { keyword: /用户研究/i, career: "用户研究员" },
  { keyword: /新媒体/i, career: "新媒体运营" },
  { keyword: /内容运营|内容编辑|内容策划/i, career: "内容运营" },
  { keyword: /社区运营|社群运营/i, career: "社区运营" },
  { keyword: /电商运营/i, career: "电商运营" },
  { keyword: /产品运营|增长运营|用户增长/i, career: "产品运营" },
  { keyword: /市场营销|市场|营销/i, career: "市场营销" },
  { keyword: /品牌/i, career: "品牌经理" },
  { keyword: /销售|商务拓展|BD/i, career: "销售经理" },
  { keyword: /客服|客户支持|售后/i, career: "客服主管" },
  { keyword: /招聘/i, career: "招聘经理" },
  { keyword: /人事|人力资源|HR|行政/i, career: "人力资源" },
  { keyword: /法务|律师|合规/i, career: "法务" },
  { keyword: /审计/i, career: "审计" },
  { keyword: /财务|会计|出纳/i, career: "财务分析师" },
  { keyword: /采购|招投标|供应商/i, career: "采购经理" },
  { keyword: /供应链/i, career: "供应链经理" },
  { keyword: /物流|仓储|调度|运输/i, career: "物流经理" },
  { keyword: /仓库管理员|库管|库房管理员/i, career: "仓库管理员" },
  { keyword: /质量工程|质检|检验|QC/i, career: "质量工程师" },
  { keyword: /工艺/i, career: "工艺工程师" },
  { keyword: /机械|机电|结构设计/i, career: "机械工程师" },
  { keyword: /电气/i, career: "电气工程师" },
  { keyword: /嵌入式/i, career: "嵌入式工程师" },
  { keyword: /硬件|FPGA/i, career: "智能硬件工程师" },
  { keyword: /环保|环境/i, career: "环境工程师" },
  { keyword: /物业/i, career: "物业经理" },
  { keyword: /旅游计调|旅游产品/i, career: "旅行社产品经理" },
  { keyword: /生产计划|PMC/i, career: "生产计划" },
  { keyword: /厨师/i, career: "厨师" },
  { keyword: /司机/i, career: "司机" },
  { keyword: /保安/i, career: "保安" },
  { keyword: /保洁/i, career: "保洁" },
  { keyword: /护士|护理/i, career: "护理人员" },
  { keyword: /医生|医师|临床/i, career: "临床医生" },
  { keyword: /教师|老师|讲师/i, career: "教师" },
  { keyword: /software engineer|software developer|developer|backend|front[- ]?end|full[- ]?stack/i, career: "程序员" },
  { keyword: /frontend engineer/i, career: "前端开发工程师" },
  { keyword: /backend engineer/i, career: "后端开发工程师" },
  { keyword: /full stack/i, career: "全栈开发工程师" },
  { keyword: /mobile developer|ios|android/i, career: "移动端开发工程师" },
  { keyword: /engineer|engineering/i, career: "软件工程师" },
  { keyword: /data analyst|data analysis|analytics/i, career: "数据分析师" },
  { keyword: /data engineer|etl/i, career: "数据工程师" },
  { keyword: /data scientist|scientist/i, career: "算法工程师" },
  { keyword: /machine learning|ml engineer/i, career: "机器学习工程师" },
  { keyword: /ai engineer|artificial intelligence/i, career: "AI工程师" },
  { keyword: /prompt engineer|prompting/i, career: "AI提示词工程师" },
  { keyword: /product manager|product owner/i, career: "产品经理" },
  { keyword: /product analyst|business analyst/i, career: "商业分析师" },
  { keyword: /ui designer|ux designer|product designer/i, career: "UI设计师" },
  { keyword: /visual designer|graphic designer/i, career: "视觉设计师" },
  { keyword: /interaction designer|ux researcher/i, career: "用户研究员" },
  { keyword: /devops|site reliability|sre/i, career: "DevOps工程师" },
  { keyword: /qa engineer|test engineer/i, career: "测试工程师" },
  { keyword: /automation engineer/i, career: "自动化工程师" },
  { keyword: /security engineer|cybersecurity/i, career: "网络安全工程师" },
  { keyword: /cloud architect|cloud engineer/i, career: "云计算架构师" },
  { keyword: /network engineer/i, career: "网络工程师" },
  { keyword: /database administrator|dba/i, career: "数据库管理员" },
  { keyword: /embedded/i, career: "嵌入式工程师" },
  { keyword: /architect/i, career: "解决方案架构师" },
  { keyword: /blockchain/i, career: "区块链工程师" },
  { keyword: /game developer|game programmer/i, career: "游戏开发" },
  { keyword: /platform engineer|infrastructure/i, career: "运维工程师" },
  { keyword: /data visualization/i, career: "数据可视化工程师" },
  { keyword: /bi|business intelligence/i, career: "BI工程师" },
  { keyword: /mlops/i, career: "MLOps工程师" },
  { keyword: /nlp/i, career: "自然语言处理工程师" },
  { keyword: /computer vision/i, career: "计算机视觉工程师" },
  { keyword: /robotics|automation/i, career: "机器人调试工程师" },
  { keyword: /iot|internet of things/i, career: "物联网工程师" },
  { keyword: /hardware engineer/i, career: "智能硬件工程师" },
  { keyword: /solution consultant|pre[- ]?sales/i, career: "售前工程师" },
  { keyword: /customer success|account manager/i, career: "客户成功经理" },
  { keyword: /customer support|customer service|support/i, career: "客服主管" },
  { keyword: /account executive/i, career: "销售经理" },
  { keyword: /sales development|sdr/i, career: "销售经理" },
  { keyword: /marketing|growth/i, career: "市场营销" },
  { keyword: /brand manager|pr/i, career: "品牌经理" },
  { keyword: /seo|sem|performance marketing/i, career: "市场营销" },
  { keyword: /content|editor|copywriter/i, career: "内容运营" },
  { keyword: /community manager/i, career: "社区运营" },
  { keyword: /social media/i, career: "新媒体运营" },
  { keyword: /operations manager|ops/i, career: "运营经理" },
  { keyword: /product operations|growth ops/i, career: "产品运营" },
  { keyword: /project manager|pmo/i, career: "项目经理" },
  { keyword: /program manager/i, career: "项目经理" },
  { keyword: /scrum master/i, career: "项目经理" },
  { keyword: /finance manager|financial analyst|finance/i, career: "财务分析师" },
  { keyword: /accountant|accounting/i, career: "审计" },
  { keyword: /risk|risk control/i, career: "风控分析师" },
  { keyword: /compliance|legal/i, career: "法务" },
  { keyword: /procurement/i, career: "采购经理" },
  { keyword: /supply chain|logistics/i, career: "供应链经理" },
  { keyword: /hr|recruiter|talent/i, career: "人力资源" },
  { keyword: /training|l&d/i, career: "组织发展" },
  { keyword: /quality engineer|qa/i, career: "质量工程师" },
  { keyword: /process engineer|manufacturing/i, career: "工艺工程师" },
  { keyword: /mechanical engineer/i, career: "机械工程师" },
  { keyword: /electrical engineer/i, career: "电气工程师" },
  { keyword: /energy|battery|solar/i, career: "新能源电池工程师" },
  { keyword: /clinical|biomedical/i, career: "临床医生" },
  { keyword: /nurse|nursing/i, career: "护理人员" },
  { keyword: /pharmacist/i, career: "药剂师" },
  { keyword: /teacher|education/i, career: "教师" }
];

function normalizeTitle(title) {
  return String(title || "").replace(/[\s·•/\\()（）[\]【】_\-–—]+/g, "");
}

function extractCareer(title) {
  if (!title) return "";
  const raw = String(title);
  const normalized = normalizeTitle(raw);
  const hit = CAREER_DB.find(
    (item) => raw.includes(item.career_name) || normalized.includes(item.career_name)
  );
  return hit ? hit.career_name : "";
}

function extractCareerByKeyword(title) {
  if (!title) return "";
  const raw = String(title);
  const normalized = normalizeTitle(raw);
  const match = CAREER_KEYWORDS.find((rule) => rule.keyword.test(raw) || rule.keyword.test(normalized));
  return match ? match.career : "";
}

function dailyAggregate(date) {
  const rows = db.prepare(`
    select title, salary_text from job_postings
    where date(created_at) = ?
  `).all(date);

  const counts = new Map();
  const salaryBuckets = new Map();
  rows.forEach((row) => {
    let career = extractCareer(row.title);
    if (!career) career = extractCareerByKeyword(row.title);
    if (!career) return;
    counts.set(career, (counts.get(career) || 0) + 1);
    const salary = Number.parseFloat(row.salary_text);
    if (!Number.isNaN(salary)) {
      const list = salaryBuckets.get(career) || [];
      list.push(salary);
      salaryBuckets.set(career, list);
    }
  });

  if (counts.size === 0) return;
  const max = Math.max(...counts.values());

  const insert = db.prepare(`
    insert or replace into career_daily (date, career_name, hiring_index, salary_median, samples)
    values (@date, @career_name, @hiring_index, @salary_median, @samples)
  `);

  const trx = db.transaction((entries) => {
    db.prepare("delete from career_daily where date = ?").run(date);
    entries.forEach((entry) => insert.run(entry));
  });

  const payload = Array.from(counts.entries()).map(([careerName, count]) => {
    const salaries = (salaryBuckets.get(careerName) || []).sort((a, b) => a - b);
    const mid = salaries.length > 0 ? salaries[Math.floor(salaries.length / 2)] : null;
    return {
      date,
      career_name: careerName,
      hiring_index: +((count / max) * 100).toFixed(1),
      salary_median: mid ? +mid.toFixed(2) : null,
      samples: count
    };
  });

  const existing = new Set(payload.map((item) => item.career_name));
  CAREER_DB.forEach((career) => {
    if (!existing.has(career.career_name)) {
      payload.push({
        date,
        career_name: career.career_name,
        hiring_index: 0,
        salary_median: null,
        samples: 0
      });
    }
  });

  trx(payload);
}

export { dailyAggregate };
