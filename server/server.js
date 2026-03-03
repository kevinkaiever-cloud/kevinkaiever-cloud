import dotenv from "dotenv";
import express from "express";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { fileURLToPath } from "url";
import { db } from "./data/db.js";
import { CAREER_DB, CAREER_MAP } from "../src/data/careers.js";
import { MAJOR_DB } from "../src/data/majors.js";
import { generateCareerSeries, generateIndustrySeries } from "../src/engine/careerTrend.js";
import { generateCompanySeries } from "../src/engine/companyTrend.js";
import { formatSalaryK } from "../src/utils/format.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4173;
const distPath = path.resolve(__dirname, "../dist");
const paymentProvider = (process.env.PAYMENT_PROVIDER || "mock").toLowerCase();
const xunhuGateway = process.env.XUNHU_GATEWAY || "https://api.xunhupay.com/payment/do.html";
const xunhuAppId = process.env.XUNHU_APPID || "";
const xunhuAppSecret = process.env.XUNHU_APPSECRET || "";
const xunhuNotifyUrl = process.env.XUNHU_NOTIFY_URL || "";
const xunhuReturnUrl = process.env.XUNHU_RETURN_URL || "";
const xunhuPayType = process.env.XUNHU_PAY_TYPE || "alipay";
const adminToken = process.env.ADMIN_TOKEN || "";
const gaokaoDataDir = path.resolve(__dirname, "../zhaopin-scraper/gaokao/data");
let gaokaoMajorsCache = null;
let gaokaoKlineCache = null;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(distPath));

function generateToken() {
  return crypto.randomBytes(24).toString("hex");
}

function normalizePhone(raw) {
  return String(raw || "").replace(/\s+/g, "");
}

function normalizeWechatId(raw) {
  return String(raw || "").trim();
}

function getAuthToken(req) {
  const header = req.get("authorization") || "";
  if (header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  return req.get("x-auth-token") || "";
}

function requireAuth(req, res, next) {
  const token = getAuthToken(req);
  if (!token) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const user = db.prepare("select id, phone, wechat_id, auth_token from users where auth_token = ?").get(token);
  if (!user) {
    res.status(401).json({ error: "invalid_token" });
    return;
  }
  req.user = user;
  next();
}

function buildOrderId() {
  return `ORD_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
}

function buildXunhuSign(params, secret) {
  const pairs = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== "" && key !== "sign")
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  const base = `${pairs}&key=${secret}`;
  return crypto.createHash("md5").update(base).digest("hex");
}

function verifyXunhuSign(params, secret) {
  const sign = String(params.sign || "");
  if (!sign) return false;
  const calculated = buildXunhuSign(params, secret);
  return calculated.toLowerCase() === sign.toLowerCase();
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function buildSystemPrompt(careerName) {
  const career = CAREER_MAP[careerName];
  if (!career) return "";
  const series = generateCareerSeries(careerName);
  const latest = series[series.length - 1];
  const first = series[0];

  return `你是一位资深职业规划顾问，拥有20年的行业经验。请基于以下数据为用户提供专业、具体、可执行的建议。

当前分析职业：${careerName}
分类：${career.category}
2025年数据：
  - 薪资中位数：${formatSalaryK(latest?.salary_median)}/月
  - 招聘需求指数：${latest?.hiring_index}/100
  - AI替代风险：${career.ai_replace_risk}/100
  - 稳定性评分：${career.stability_score}/100
  - 成长性评分：${career.growth_score}/100
  - 行业景气度：${latest?.industry_index}/100

历史趋势（2005→2025）：
  - 招聘指数变化：${first?.hiring_index} → ${latest?.hiring_index}
  - 薪资变化：${formatSalaryK(first?.salary_median)} → ${formatSalaryK(latest?.salary_median)}

回答要求：
1. 直接回答问题，不要重复数据，把数据分析融入建议中
2. 给出具体的行动建议，包括时间节点
3. 如果涉及转行，说明需要的技能和学习路径
4. 语言简洁有力，不超过300字
5. 用中文回答`;
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === "\"") {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current);
  return result;
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((key, idx) => {
      row[key] = values[idx] ?? "";
    });
    return row;
  });
}

function loadGaokaoMajors() {
  if (gaokaoMajorsCache) return gaokaoMajorsCache;
  const indexPath = path.join(gaokaoDataDir, "major_index.csv");
  const majorsPath = path.join(gaokaoDataDir, "all_majors.json");
  if (!fs.existsSync(indexPath) || !fs.existsSync(majorsPath)) {
    return null;
  }
  const indexText = fs.readFileSync(indexPath, "utf-8");
  const indexRows = parseCsv(indexText).map((row) => ({
    name: row.name,
    level2_name: row.level2_name,
    level3_name: row.level3_name,
    limit_year: row.limit_year,
    fivesalaryavg: Number(row.fivesalaryavg || 0),
    salaryavg: Number(row.salaryavg || 0),
    view_total: Number(row.view_total || 0),
    view_month: Number(row.view_month || 0),
    boy_rate: Number(row.boy_rate || 0),
    girl_rate: Number(row.girl_rate || 0),
    job_count: Number(row.job_count || 0),
    market_salary_median: row.market_salary_median ? Number(row.market_salary_median) : null,
    salary_score: Number(row.salary_score || 0),
    demand_score: Number(row.demand_score || 0),
    popularity_score: Number(row.popularity_score || 0),
    value_ratio_score: Number(row.value_ratio_score || 0),
    composite_index: Number(row.composite_index || 0),
  }));
  const allMajors = JSON.parse(fs.readFileSync(majorsPath, "utf-8"));
  const allMajorsMap = new Map(allMajors.map((item) => [item.name, item]));
  const baseMap = new Map(MAJOR_DB.map((item) => [item.name, item]));

  const sortedByViews = indexRows
    .slice()
    .sort((a, b) => a.view_total - b.view_total);
  const heatMap = new Map();
  sortedByViews.forEach((row, idx) => {
    const pct = sortedByViews.length <= 1 ? 50 : (idx / (sortedByViews.length - 1)) * 100;
    heatMap.set(row.name, Math.round(pct));
  });

  gaokaoMajorsCache = indexRows.map((row) => {
    const base = baseMap.get(row.name);
    const detail = allMajorsMap.get(row.name);
    const heat = heatMap.get(row.name) ?? 50;
    const salaryTier = Math.max(1, Math.min(5, Math.ceil((row.salary_score || 0) / 20)));
    const tags = new Set(base?.tags || []);
    if (heat >= 80) tags.add("热门");
    if (heat <= 20) tags.add("冷门");
    return {
      name: row.name,
      category: row.level2_name || base?.category || "",
      subCategory: row.level3_name || base?.subCategory || "",
      code: detail?.spcode || base?.code || "",
      limitYear: row.limit_year || detail?.limit_year || "",
      careers: base?.careers || [],
      heat,
      aiImpact: base?.aiImpact ?? 50,
      salaryTier,
      stability: Math.round(row.composite_index || 0),
      tags: Array.from(tags),
      salaryScore: row.salary_score,
      demandScore: row.demand_score,
      popularityScore: row.popularity_score,
      valueRatioScore: row.value_ratio_score,
      compositeIndex: row.composite_index,
      fivesalaryavg: row.fivesalaryavg,
      viewTotal: row.view_total,
      jobCount: row.job_count,
      marketSalaryMedian: row.market_salary_median,
      boyRate: row.boy_rate,
      girlRate: row.girl_rate,
      source: "real",
    };
  });
  return gaokaoMajorsCache;
}

function loadGaokaoKline() {
  if (gaokaoKlineCache) return gaokaoKlineCache;
  const klinePath = path.join(gaokaoDataDir, "kline_data.json");
  if (!fs.existsSync(klinePath)) return null;
  gaokaoKlineCache = JSON.parse(fs.readFileSync(klinePath, "utf-8"));
  return gaokaoKlineCache;
}

function requireAdmin(req, res, next) {
  const env = (process.env.NODE_ENV || "development").toLowerCase();
  if (env !== "production") {
    next();
    return;
  }
  if (!adminToken) {
    res.status(500).json({ error: "admin_not_configured" });
    return;
  }
  const token = req.get("x-admin-token") || "";
  if (token !== adminToken) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}

app.get("/api/careers", (_req, res) => {
  res.json({ count: CAREER_DB.length, careers: CAREER_DB });
});

app.get("/api/career/:name", (req, res) => {
  const name = decodeURIComponent(req.params.name || "");
  const rows = db.prepare(`
    select date, hiring_index, salary_median, samples
    from career_daily
    where career_name = ?
    order by date asc
  `).all(name);

  if (rows.length > 0) {
    res.json({ source: "daily", series: rows });
    return;
  }
  const simulated = generateCareerSeries(name);
  res.json({ source: "simulated", series: simulated });
});

app.get("/api/company/:name", (req, res) => {
  const name = decodeURIComponent(req.params.name || "");
  const rows = db.prepare(`
    select date, hiring_index, tech_ratio, ai_job_ratio, source
    from company_daily
    where company = ?
    order by date asc
  `).all(name);
  if (rows.length > 0) {
    res.json({ source: "daily", series: rows });
    return;
  }
  const simulated = generateCompanySeries(name);
  res.json({ source: "simulated", series: simulated });
});

app.get("/api/industry/:name", (req, res) => {
  const name = decodeURIComponent(req.params.name || "");
  const rows = db.prepare(`
    select date, industry_index, source
    from industry_daily
    where industry = ?
    order by date asc
  `).all(name);
  if (rows.length > 0) {
    res.json({ source: "daily", series: rows });
    return;
  }
  const simulated = generateIndustrySeries(name || "科技互联网");
  res.json({ source: "simulated", series: simulated });
});

app.post("/api/ai/chat", requireAuth, async (req, res) => {
  const token = req.user.auth_token;
  const careerName = String(req.body?.careerName || "");
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  if (!careerName || messages.length === 0) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }
  const apiKey = process.env.ANTHROPIC_API_KEY || "";
  if (!apiKey) {
    res.status(500).json({ error: "missing_api_key" });
    return;
  }

  const date = todayISO();
  const isPro = Boolean(db.prepare(`
    select order_id from orders
    where user_id = ? and product = ? and status = 'paid'
    order by paid_at desc
    limit 1
  `).get(req.user.id, "single_report"));
  const dailyLimit = isPro ? Infinity : 3;
  const row = db.prepare("select count from ai_usage where date = ? and auth_token = ?").get(date, token);
  const used = row?.count || 0;
  if (!isPro && used >= dailyLimit) {
    res.json({ error: "rate_limited", remaining: 0 });
    return;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: buildSystemPrompt(careerName),
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      res.status(500).json({ error: "upstream_error" });
      return;
    }

    db.prepare(`
      insert into ai_usage(date, auth_token, count)
      values (?, ?, 1)
      on conflict(date, auth_token) do update set count = count + 1
    `).run(date, token);

    res.json({
      content: data.content,
      remaining: isPro ? null : Math.max(0, dailyLimit - used - 1),
    });
  } catch {
    res.status(500).json({ error: "network_error" });
  }
});

app.get("/api/gaokao/majors", (_req, res) => {
  const majors = loadGaokaoMajors();
  if (!majors) {
    res.status(404).json({ error: "gaokao_data_missing" });
    return;
  }
  res.json({ count: majors.length, majors });
});

app.get("/api/gaokao/kline/:name", (req, res) => {
  const name = decodeURIComponent(req.params.name || "");
  const data = loadGaokaoKline();
  if (!data) {
    res.status(404).json({ error: "gaokao_data_missing" });
    return;
  }
  const series = data[name] || [];
  res.json({ name, series });
});

app.post("/api/auth/phone", (req, res) => {
  const phone = normalizePhone(req.body?.phone);
  if (!/^\d{6,20}$/.test(phone)) {
    res.status(400).json({ error: "invalid_phone" });
    return;
  }
  let user = db.prepare("select id, phone, wechat_id, auth_token from users where phone = ?").get(phone);
  if (!user) {
    const token = generateToken();
    const info = db.prepare("insert into users (phone, auth_token) values (?, ?)").run(phone, token);
    user = db.prepare("select id, phone, wechat_id, auth_token from users where id = ?").get(info.lastInsertRowid);
  }
  res.json({ user: { id: user.id, phone: user.phone, wechatId: user.wechat_id }, token: user.auth_token });
});

app.post("/api/auth/wechat", (req, res) => {
  const wechatId = normalizeWechatId(req.body?.wechatId);
  if (!wechatId || wechatId.length < 3) {
    res.status(400).json({ error: "invalid_wechat" });
    return;
  }
  let user = db.prepare("select id, phone, wechat_id, auth_token from users where wechat_id = ?").get(wechatId);
  if (!user) {
    const token = generateToken();
    const info = db.prepare("insert into users (wechat_id, auth_token) values (?, ?)").run(wechatId, token);
    user = db.prepare("select id, phone, wechat_id, auth_token from users where id = ?").get(info.lastInsertRowid);
  }
  res.json({ user: { id: user.id, phone: user.phone, wechatId: user.wechat_id }, token: user.auth_token });
});

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ user: { id: req.user.id, phone: req.user.phone, wechatId: req.user.wechat_id } });
});

app.get("/api/entitlements", requireAuth, (req, res) => {
  const careerName = String(req.query?.career || "");
  const row = db.prepare(`
    select order_id from orders
    where user_id = ? and product = ? and status = 'paid'
    order by paid_at desc
    limit 1
  `).get(req.user.id, "single_report");
  res.json({
    singleReport: Boolean(row),
    careerName,
  });
});

app.post("/api/payments/create", requireAuth, async (req, res) => {
  const product = String(req.body?.product || "");
  const careerName = String(req.body?.careerName || "");
  if (product !== "single_report") {
    res.status(400).json({ error: "unsupported_product" });
    return;
  }
  const orderId = buildOrderId();
  const amount = 990;
  db.prepare(`
    insert into orders (order_id, user_id, product, amount, currency, status, career_name, provider)
    values (?, ?, ?, ?, 'CNY', 'pending', ?, ?)
  `).run(orderId, req.user.id, product, amount, careerName, paymentProvider);

  let paymentUrl = "";
  let externalId = "";
  if (paymentProvider === "mock") {
    paymentUrl = `/pay/mock/${orderId}`;
  } else if (paymentProvider === "xunhu") {
    if (!xunhuAppId || !xunhuAppSecret || !xunhuNotifyUrl) {
      res.status(500).json({ error: "xunhu_not_configured" });
      return;
    }
    const params = {
      appid: xunhuAppId,
      out_trade_no: orderId,
      name: "职业K线单次报告",
      money: (amount / 100).toFixed(2),
      type: xunhuPayType,
      notify_url: xunhuNotifyUrl,
      return_url: xunhuReturnUrl || undefined,
    };
    const sign = buildXunhuSign(params, xunhuAppSecret);
    const body = new URLSearchParams({ ...params, sign }).toString();
    try {
      const response = await fetch(xunhuGateway, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const text = await response.text();
      let payload = null;
      try {
        payload = JSON.parse(text);
      } catch {
        payload = null;
      }
      if (payload?.code !== 1) {
        res.status(502).json({ error: "xunhu_create_failed", detail: payload || text });
        return;
      }
      paymentUrl = payload?.payurl || payload?.url || payload?.qrcode || "";
      externalId = payload?.trade_no || payload?.order_id || payload?.out_trade_no || "";
    } catch (err) {
      res.status(502).json({ error: "xunhu_network_error" });
      return;
    }
  } else {
    paymentUrl = `/pay/unsupported/${orderId}`;
  }

  if (externalId) {
    db.prepare("update orders set external_id = ? where order_id = ?").run(externalId, orderId);
  }

  res.json({
    orderId,
    amount,
    currency: "CNY",
    provider: paymentProvider,
    paymentUrl,
  });
});

app.get("/api/orders/:orderId", requireAuth, (req, res) => {
  const orderId = String(req.params.orderId || "");
  const order = db.prepare(`
    select order_id, product, amount, currency, status, career_name, provider, paid_at, created_at
    from orders where order_id = ? and user_id = ?
  `).get(orderId, req.user.id);
  if (!order) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json({ order });
});

app.post("/api/payments/mock/confirm", (req, res) => {
  const orderId = String(req.body?.orderId || "");
  if (!orderId) {
    res.status(400).json({ error: "order_required" });
    return;
  }
  const order = db.prepare("select order_id from orders where order_id = ?").get(orderId);
  if (!order) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  db.prepare("update orders set status = 'paid', paid_at = datetime('now') where order_id = ?").run(orderId);
  res.json({ status: "paid", orderId });
});

app.get("/pay/mock/:orderId", (req, res) => {
  const orderId = String(req.params.orderId || "");
  const order = db.prepare("select order_id, amount, currency, status from orders where order_id = ?").get(orderId);
  if (!order) {
    res.status(404).send("订单不存在");
    return;
  }
  res.send(`<!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Career K-Line 支付</title>
        <style>
          body { font-family: sans-serif; background: #0c1225; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
          .card { background: #111a33; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 24px; width: 360px; text-align: center; }
          .amount { font-size: 28px; font-weight: 800; margin: 10px 0; }
          .btn { width: 100%; padding: 10px 12px; border-radius: 8px; border: none; background: linear-gradient(135deg, #60a5fa, #818cf8); color: #fff; font-weight: 600; cursor: pointer; }
          .muted { color: #7282a0; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div>模拟支付</div>
          <div class="amount">¥${(order.amount / 100).toFixed(2)}</div>
          <div class="muted">订单号：${order.order_id}</div>
          <div class="muted" style="margin: 8px 0 16px;">状态：${order.status}</div>
          <button class="btn" onclick="confirmPay()">我已完成支付</button>
          <p class="muted" style="margin-top: 12px;">这是开发环境的模拟支付页</p>
        </div>
        <script>
          async function confirmPay() {
            await fetch('/api/payments/mock/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: '${order.order_id}' })
            });
            alert('支付成功，可返回应用刷新解锁状态');
          }
        </script>
      </body>
    </html>`);
});

app.post("/api/payments/xunhu/notify", (req, res) => {
  if (!verifyXunhuSign(req.body || {}, xunhuAppSecret)) {
    res.status(400).send("sign_error");
    return;
  }
  const orderId = String(req.body?.out_trade_no || req.body?.order_id || req.body?.trade_order_id || "");
  if (!orderId) {
    res.status(400).send("order_missing");
    return;
  }
  const status = String(req.body?.status || req.body?.trade_status || "success");
  if (status !== "success" && status !== "paid") {
    res.send("ignored");
    return;
  }
  const existing = db.prepare("select status from orders where order_id = ?").get(orderId);
  if (!existing) {
    res.status(404).send("not_found");
    return;
  }
  if (existing.status !== "paid") {
    db.prepare("update orders set status = 'paid', paid_at = datetime('now') where order_id = ?").run(orderId);
  }
  res.send("success");
});

app.get("/api/admin/orders", requireAdmin, (req, res) => {
  const limit = Math.min(Number(req.query?.limit || 50), 200);
  const offset = Math.max(Number(req.query?.offset || 0), 0);
  const rows = db.prepare(`
    select o.order_id, o.product, o.amount, o.currency, o.status, o.career_name, o.provider,
           o.created_at, o.paid_at, o.external_id, u.phone, u.wechat_id
    from orders o
    left join users u on u.id = o.user_id
    order by o.created_at desc
    limit ? offset ?
  `).all(limit, offset);
  res.json({ orders: rows, limit, offset });
});

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Career K-Line running at http://localhost:${port}`);
});
