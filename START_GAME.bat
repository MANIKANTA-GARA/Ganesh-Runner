@echo off
title 3D Ganesha & Shiva Runner Server
cd /d "%~dp0"
set "PATH=C:\Users\asus\.gemini\antigravity\scratch\nodejs;%PATH%"

echo ========================================================
echo   3D Lord Ganesha & Lord Shiva Endless Runner
echo ========================================================
echo.
echo Starting local web server...
echo.

start "" http://localhost:3000

call npm run dev
if errorlevel 1 (
    echo.
    echo Server stopped or encountered an error.
    pause
)
