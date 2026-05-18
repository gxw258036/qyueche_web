#!/bin/bash

mkdir -p server/data

echo "正在构建前端..."
cd /workspace
npm run build

if [ $? -eq 0 ]; then
  echo "✓ 前端构建成功"
  echo ""
  echo "正在启动后端服务器..."
  cd /workspace/server
  npm run dev
else
  echo "✗ 前端构建失败"
  exit 1
fi
