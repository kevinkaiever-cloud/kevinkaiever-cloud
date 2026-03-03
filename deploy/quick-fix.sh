#!/bin/bash
# 鏈嶅姟鍣ㄤ笂蹇€熶慨澶嶏細鎷夊彇鏈€鏂颁唬鐮佸苟閮ㄧ讲
set -e
for d in "${HOME}/kevinkaiever-cloud" "/root/kevinkaiever-cloud" /home/*/kevinkaiever-cloud; do
  [ -d "$d" ] && cd "$d" && break
done
[ ! -f "deploy/deploy.sh" ] && { echo "鏈壘鍒伴」鐩洰褰?; exit 1; }
echo ">>> 鎷夊彇鏈€鏂颁唬鐮?.."
git pull origin main
echo ">>> 鎵ц閮ㄧ讲..."
chmod +x deploy/deploy.sh
bash deploy/deploy.sh
echo ">>> 瀹屾垚"
