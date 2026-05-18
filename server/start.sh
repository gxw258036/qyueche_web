#!/bin/bash

mkdir -p data

echo "正在启动服务器..."

if [ ! -d "node_modules" ]; then
  echo "安装依赖..."
  npm install
fi

npm run dev
