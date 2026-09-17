@echo off
title 3D Ganesha Runner - Public Internet Link
cd /d "%~dp0"

echo ================================================================
echo   3D Lord Ganesha & Lord Shiva Runner - Public Internet Link
echo ================================================================
echo.
echo Connecting to secure tunnel...
echo A public HTTPS link will appear below in a few seconds.
echo You can open that link on ANY mobile phone or share it with anyone!
echo.
echo ================================================================
echo.

ssh -p 443 -R0:localhost:3000 -o StrictHostKeyChecking=no a.pinggy.io

if errorlevel 1 (
    echo.
    echo Trying fallback public tunnel...
    set "PATH=C:\Users\asus\.gemini\antigravity\scratch\nodejs;%PATH%"
    call npx --yes localtunnel --port 3000
)

pause
