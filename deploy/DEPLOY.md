# 服务器部署指南

## 方式一：Node + PM2（推荐）

### 1. 服务器要求

- Linux（Ubuntu / CentOS / Debian）
- Node.js 18+
- 开放端口 4173（或通过 Nginx 代理 80）

### 2. 上传代码

```bash
# 方式 A: Git 克隆
git clone https://github.com/kevinkaiever-cloud/kevinkaiever-cloud.git
cd kevinkaiever-cloud
git checkout main

# 方式 B: 本地打包上传
# 在本地执行 npm run build 后，将整个项目打成 zip 上传
```

### 3. 一键部署

```bash
cd kevinkaiever-cloud
chmod +x deploy/deploy.sh
bash deploy/deploy.sh
```

### 4. 环境变量（可选）

```bash
cp .env.example .env
# 编辑 .env，配置端口、支付等
vim .env
```

主要变量：
- `PORT=4173` — 服务端口
- `PAYMENT_PROVIDER=mock` — 支付（mock 无需配置）
- `ANTHROPIC_API_KEY` — AI 对话需配置

### 5. PM2 常用命令

```bash
pm2 status          # 查看状态
pm2 logs career-kline   # 查看日志
pm2 restart career-kline # 重启
pm2 stop career-kline   # 停止
```

### 6. 开机自启

```bash
pm2 startup
pm2 save
```

---

## 方式二：Nginx 反向代理

如需域名、HTTPS、或 80 端口访问：

### 1. 安装 Nginx

```bash
# Ubuntu
sudo apt update && sudo apt install nginx -y

# CentOS
sudo yum install nginx -y
```

### 2. 配置站点

```bash
# 复制配置
sudo cp deploy/nginx.conf /etc/nginx/sites-available/career-kline
# 或 CentOS: /etc/nginx/conf.d/career-kline.conf

# 修改 server_name 为你的域名
sudo vim /etc/nginx/sites-available/career-kline

# 启用站点 (Ubuntu)
sudo ln -s /etc/nginx/sites-available/career-kline /etc/nginx/sites-enabled/

# 测试并重载
sudo nginx -t && sudo systemctl reload nginx
```

### 3. 防火墙

```bash
# 开放 80 端口
sudo ufw allow 80
sudo ufw reload
```

---

## 方式三：Docker

```bash
# 构建镜像
docker build -t career-kline .

# 运行
docker run -d -p 4173:4173 --name career-kline career-kline

# 持久化数据库（使用 Docker volume）
docker run -d -p 4173:4173 -v career-kline-data:/app/server --name career-kline career-kline
```

---

## 常见问题

### better-sqlite3 安装失败

需安装构建工具：

```bash
# Ubuntu
sudo apt install build-essential python3 -y

# CentOS
sudo yum groupinstall "Development Tools" -y
sudo yum install python3 -y
```

### 端口被占用

修改 `.env` 中 `PORT=4173` 为其他端口，或修改 `deploy/ecosystem.config.cjs`。

### 数据持久化

- SQLite 数据库在 `server/career-kline.db`，部署时勿删除
- 高考 K 线数据在 `public/gaokao/` 和 `zhaopin-scraper/gaokao/data/`
