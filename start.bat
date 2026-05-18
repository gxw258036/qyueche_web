@echo off
chcp 65001 >nul

set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%"
set "SERVER_DIR=%PROJECT_DIR%server"

mkdir "%SERVER_DIR%\data" 2>nul

echo ==============================================
echo    小学英语单词默写工具 - 一键启动脚本
echo ==============================================
echo.

echo [1/2] 正在构建前端...
cd /d "%PROJECT_DIR%"

if exist "package.json" (
  npm run build
  
  if %errorlevel% equ 0 (
    echo ✓ 前端构建成功
    echo.
    echo [2/2] 正在启动后端服务器...
    cd /d "%SERVER_DIR%"
    
    if exist "package.json" (
      if not exist "node_modules" (
        echo 安装依赖...
        npm install
      )
      npm run dev
    ) else (
      echo ✗ 未找到服务器目录: %SERVER_DIR%
      pause
      exit /b 1
    )
  ) else (
    echo ✗ 前端构建失败
    pause
    exit /b 1
  )
) else (
  echo ✗ 未找到项目目录: %PROJECT_DIR%
  pause
  exit /b 1
)
