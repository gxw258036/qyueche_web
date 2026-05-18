#!/bin/bash

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
cd "$SCRIPT_DIR"

mkdir -p data

echo "=============================================="
echo "    小学英语单词默写工具 - 服务器启动脚本"
echo "=============================================="
echo ""

if [ ! -d "node_modules" ]; then
  echo "安装依赖..."
  npm install
fi

echo "启动服务器..."
npm run dev
