@echo off
chcp 65001 >nul
mkdir data 2>nul

echo 正在启动服务器...

if not exist "node_modules" (
  echo 安装依赖...
  call npm install
)

call npm run dev
