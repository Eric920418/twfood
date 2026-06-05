#!/bin/bash
# TAI FOOD 一鍵啟動器（雙擊即可）
# 起一個本機小伺服器並用瀏覽器打開，避開 file:// 的各種限制。
# 關閉這個終端機視窗就會停止網站。

cd "$(dirname "$0")" || exit 1

# 找一個沒被占用的連接埠（從 8000 開始往上找）
PORT=8000
while lsof -i ":$PORT" >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

URL="http://localhost:$PORT"

echo "==============================================="
echo "  TAI FOOD 已啟動 → $URL"
echo "  （已在瀏覽器打開；若沒自動開，手動貼上以上網址）"
echo "  關閉這個視窗就會停止網站。"
echo "==============================================="

# 背景啟動伺服器
python3 -m http.server "$PORT" >/dev/null 2>&1 &
SERVER_PID=$!

# 等伺服器起來再開瀏覽器
sleep 1
open "$URL"

# 視窗開著＝伺服器持續運行；關閉視窗 / Ctrl+C 就停止
trap "kill $SERVER_PID 2>/dev/null" EXIT
wait $SERVER_PID
