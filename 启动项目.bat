@echo off
chcp 65001 >nul
echo ========================================
echo   职业 K 线 - Career K-Line 项目启动
echo ========================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo.
    echo 安装方法：
    echo 1. 访问 https://nodejs.org 下载 LTS 版本
    echo 2. 或使用 winget: winget install OpenJS.NodeJS.LTS
    echo.
    pause
    exit /b 1
)

echo [1/2] 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)

echo.
echo [2/2] 启动开发服务器...
echo 启动后请在浏览器打开: http://localhost:5173/
echo 按 Ctrl+C 可停止服务器
echo.
call npm run dev

pause
