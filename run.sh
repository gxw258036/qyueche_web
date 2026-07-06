#!/bin/bash
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
cd "$SCRIPT_DIR"

echo "=============================================="
echo "    小学英语单词默写工具 - 后台启动脚本"
echo "=============================================="
echo ""
echo "日志输出: $SCRIPT_DIR/app.log"
echo "查看日志: tail -f app.log"
echo ""

nohup ./start.sh > app.log 2>&1 &
PID=$!
echo "进程 PID: $PID"
echo "停止服务: kill $PID"
echo ""
echo "启动中，请稍后查看日志..."