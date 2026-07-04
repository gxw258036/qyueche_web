#!/bin/bash

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
PROJECT_DIR="$SCRIPT_DIR"
SERVER_DIR="$PROJECT_DIR/server"

mkdir -p "$SERVER_DIR/data"

echo "=============================================="
echo "    小学英语单词默写工具 - 一键启动脚本"
echo "=============================================="
echo ""

# 限制 Node 内存，避免低内存服务器 OOM
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=512}"

# 启动前检测并清理占用 3000 端口的旧进程
PORT=3000
if command -v lsof >/dev/null 2>&1; then
  PID=$(lsof -ti:${PORT} 2>/dev/null)
  if [ -n "$PID" ]; then
    echo "⚠ 端口 ${PORT} 被以下进程占用，正在终止: ${PID}"
    kill -9 $PID 2>/dev/null
    sleep 1
  fi
fi

echo "[1/2] 正在构建前端..."
cd "$PROJECT_DIR"

if [ -f "package.json" ]; then
  npm run build

  if [ $? -eq 0 ]; then
    echo "✓ 前端构建成功"
    echo ""
    echo "[2/2] 正在启动后端服务器..."
    cd "$SERVER_DIR"

    if [ -f "package.json" ]; then
      if [ ! -d "node_modules" ]; then
        echo "安装依赖..."
        npm install
      fi
      npm run dev
    else
      echo "✗ 未找到服务器目录: $SERVER_DIR"
      exit 1
    fi
  else
    echo "✗ 前端构建失败"
    exit 1
  fi
else
  echo "✗ 未找到项目目录: $PROJECT_DIR"
  exit 1
fi
