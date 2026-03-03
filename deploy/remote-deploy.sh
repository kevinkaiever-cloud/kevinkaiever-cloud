#!/bin/bash
# 鍦ㄨ繙绋嬫湇鍔″櫒涓婃墽琛岀殑涓€閿儴缃?set -e
DEPLOY_DIR="${HOME:-/root}/kevinkaiever-cloud"

echo "=== 妫€鏌?Node.js ==="
if ! command -v node &> /dev/null; then
  echo "璇峰厛瀹夎 Node.js 18+: apt install nodejs 鎴栦粠 https://nodejs.org 瀹夎"
  exit 1
fi
echo "Node: $(node -v)"

echo "=== 鍏嬮殕/鏇存柊椤圭洰 ==="
mkdir -p $(dirname $DEPLOY_DIR)
if [ -d "$DEPLOY_DIR" ]; then
  cd "$DEPLOY_DIR"
  git fetch origin main 2>/dev/null || true
  git checkout main 2>/dev/null || true
  git pull origin main 2>/dev/null || true
else
  git clone https://github.com/kevinkaiever-cloud/kevinkaiever-cloud.git "$DEPLOY_DIR"
  cd "$DEPLOY_DIR"
  git checkout main
fi

echo "=== 鎵ц閮ㄧ讲 ==="
chmod +x deploy/deploy.sh
bash deploy/deploy.sh

echo ""
echo "=== 閮ㄧ讲瀹屾垚 ==="
ip=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "YOUR_IP")
echo "璁块棶: http://${ip}:4173"
