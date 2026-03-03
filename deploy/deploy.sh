#!/bin/bash
# 鏈嶅姟鍣ㄧ涓€閿儴缃茶剼鏈?# 鍦ㄩ」鐩牴鐩綍鎵ц: bash deploy/deploy.sh

set -e
cd "$(dirname "$0")/.."

echo "=== 鑱屼笟K绾?閮ㄧ讲鑴氭湰 ==="

# 1. 妫€鏌?Node
if ! command -v node &> /dev/null; then
  echo "璇峰厛瀹夎 Node.js 18+: https://nodejs.org/"
  exit 1
fi
echo "Node: $(node -v)"

# 2. 瀹夎渚濊禆锛堥渶 dev 鐢ㄤ簬鏋勫缓锛?echo ""
echo ">>> 瀹夎渚濊禆..."
npm ci 2>/dev/null || npm install

# 3. 鏋勫缓
echo ""
echo ">>> 鏋勫缓鍓嶇..."
npm run build

# 4. 鏋勫缓瓒嬪娍缂撳瓨
if [ -f "scripts/buildTrendingCache.js" ]; then
  echo ""
  echo ">>> 鐢熸垚瓒嬪娍缂撳瓨..."
  npm run build:cache 2>/dev/null || true
fi

# 5. 鍒涘缓 logs 鐩綍
mkdir -p logs

# 6. PM2 鍚姩
if command -v pm2 &> /dev/null; then
  echo ""
  echo ">>> 浣跨敤 PM2 鍚姩..."
  pm2 delete career-kline 2>/dev/null || true
  pm2 start deploy/ecosystem.config.cjs
  pm2 save
  echo ""
  echo "閮ㄧ讲瀹屾垚! PM2 鐘舵€?"
  pm2 status
else
  echo ""
  echo ">>> 鐩存帴鍚姩 (鏈畨瑁?PM2锛屽缓璁? npm i -g pm2)"
  echo "杩愯: PORT=4173 node server/server.js"
  echo "鎴? npm run start"
fi

echo ""
echo "=== 璁块棶 http://localhost:4173 鎴栭厤缃?Nginx 鍙嶅悜浠ｇ悊鍚庤闂?==="
