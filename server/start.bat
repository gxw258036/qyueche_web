@echo off
chcp 65001 >nul

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

mkdir data 2>nul

echo ==============================================
echo    小学英语单词默写工具 - 服务器启动脚本
echo ==============================================
echo.

if not exist "node_modules" (
  echo 安装依赖...
  npm install
)

echo 启动服务器...
npm run dev
