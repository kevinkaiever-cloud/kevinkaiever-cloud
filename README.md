# 职业K线 — 用K线看懂你的职业未来

<div align="center">

**289个职业 × 20年薪资趋势 × AI替代风险 × 高考专业匹配**

像炒股一样分析职业走势，为求职、转行、高考选专业提供数据支撑。

[功能特性](#功能特性) · [快速开始](#快速开始) · [服务器部署](deploy/DEPLOY.md) · [项目结构](#项目结构)

</div>

---

## 功能特性

| 模块 | 描述 |
|------|------|
| 📈 **职业K线** | 289个职业的20年薪资趋势K线图，涨跌一目了然 |
| 📊 **职业对比** | 多职业横向对比，薪资、需求、AI风险、稳定性 |
| 🏢 **公司用工** | 头部企业招聘趋势与阶段划分 |
| 🎓 **高考专区** | 专业价值指数K线、对口职业匹配、综合建议 |
| 🤖 **AI分析** | 职业前景、转行建议、AI冲击评估 |

### 技术栈

- **前端**: React 19 + Vite 7 + ECharts + Zustand
- **后端**: Express 5 + better-sqlite3
- **数据**: 智联招聘 + 掌上高考 + 自研趋势引擎

---

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/kevinkaiever-cloud/kevinkaiever-cloud.git
cd kevinkaiever-cloud

# 安装依赖
npm install

# 开发模式（仅前端）
npm run dev

# 生产构建 + 本地预览（含服务端 API）
npm run build
npm run start
```

### 环境变量

复制 `.env.example` 为 `.env` 并按需配置：

```env
PORT=4173
# 支付相关（可选）
PAYMENT_PROVIDER=mock
XUNHU_APPID=
XUNHU_APPSECRET=
```

---

## 项目结构

```
├── src/
│   ├── components/     # 页面组件
│   │   ├── Career/     # 职业K线
│   │   ├── Compare/    # 职业对比
│   │   ├── Company/    # 公司用工
│   │   ├── Gaokao/     # 高考专区
│   │   └── ...
│   ├── data/           # 静态数据（职业、专业、公司）
│   ├── engine/         # 趋势计算引擎
│   └── utils/          # 工具函数
├── server/             # Express 服务端
│   ├── server.js       # 主服务
│   └── ingest/         # 数据采集
├── public/
│   └── gaokao/         # 高考专业K线数据
└── zhaopin-scraper/    # 智联招聘爬虫（可选）
```

---

## 数据说明

- **职业数据**: 覆盖 289 个职业，含薪资、需求、AI风险等维度
- **高考专业**: 教育部2025版专业目录，含专业→职业匹配、价值指数K线
- **公司用工**: 头部企业招聘趋势，支持多阶段划分
- **K线预测**: 2018-2035 年专业价值走势，含未来趋势预测

---

## 脚本说明

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式 |
| `npm run build` | 生产构建 |
| `npm run preview` | 预览构建结果 |
| `npm run start` | 启动 Express 服务 |
| `npm run build:cache` | 生成趋势缓存 |
| `npm run ingest` | 运行数据采集 |
| `npm run ingest:zhaopin` | 智联招聘数据采集 |

---

## 服务器部署

详见 [deploy/DEPLOY.md](deploy/DEPLOY.md)，支持：

- **PM2**：`bash deploy/deploy.sh` 一键部署
- **Nginx**：反向代理 + HTTPS
- **Docker**：`docker build -t career-kline .`

---

## License

MIT

---

<div align="center">

[kevinkaiever-cloud](https://github.com/kevinkaiever-cloud)

</div>
