# 职业 K 线 · Career KLine

一个用于模拟“职业薪资与供需趋势”的可视化看板，支持职位/城市筛选、均线、对比与排行。

## 功能
- 多职业、多城市薪资趋势 K 线图
- MA 均线与光标悬停详情
- 需求指数与供需比指标
- 对比模式与涨幅排行

## 本地运行
```bash
npm install
npm run dev
```

浏览器打开：`http://localhost:5173/`

## 真实数据接入（RSS + 数据库）
本项目支持通过 RSS 源抓取真实岗位数据并落库（SQLite），用于后续趋势计算。

1) 配置 RSS 源  
在 `server/sources.js` 中填写允许抓取的 RSS URL（请确认站点协议与 robots 策略）。

2) 运行抓取  
```bash
npm run ingest
```

3) 启动服务（含 API）  
```bash
npm run build
npm run start
```
API 示例：  
- `GET /api/careers`  
- `GET /api/career/程序员`

## JSON/开放 API 接入
在 `server/sources.json` 中配置 JSON 数据源，可用于：
- 岗位数据（type: jobs）
- 公司日级数据（type: company）
- 行业日级数据（type: industry）

字段映射通过 `fields` 配置完成，支持嵌套路径。

### Adzuna / Jooble（免费 API）
将 `.env.example` 复制为 `.env` 并填写：
- `ADZUNA_APP_ID` / `ADZUNA_APP_KEY`
- `JOOBLE_API_KEY`

随后在 `server/sources.json` 将对应源的 `enabled` 设置为 `true`。

## 国内爬虫接入（BOSS直聘 / 拉勾 / 智联）
已提供 HTML 解析模板（默认关闭），请按站点结构与合规要求配置：
1) 在 `server/sources.json` 的 `html` 节点中填写选择器与 Cookie  
2) 将 `enabled` 改为 `true`
3) 运行抓取 `npm run ingest`

说明：这些站点反爬较强，通常需要登录 Cookie、请求间隔与重试控制。

## 反爬策略 / 频率控制 / 重试
抓取实现支持：
- 指定 `delayMs` 控制请求间隔
- `retry` 失败重试（指数退避 + 随机抖动）
- 建议配合站点协议与 robots 规则使用

## Windows 定时任务（每日自动抓取）
创建定时任务（每天 02:30 执行）：
```powershell
scripts\create-task.ps1
```
删除定时任务：
```powershell
scripts\remove-task.ps1
```
手动运行抓取：
```powershell
scripts\run-ingest.ps1
```

## 技术栈
- React
- Vite

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
