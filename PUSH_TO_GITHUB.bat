@echo off
title Push Ganesha Runner to GitHub
cd /d "%~dp0"

echo ================================================================
echo   Connect 3D Ganesha & Shiva Runner to your GitHub Repository
echo ================================================================
echo.

where git >nul 2>nul
if errorlevel 1 (
    echo [!] Git command not found in current PATH.
    echo Checking standard Git locations...
    if exist "C:\Program Files\Git\cmd\git.exe" (
        set "PATH=C:\Program Files\Git\cmd;%PATH%"
    ) else if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"
    ) else (
        echo.
        echo [ERROR] Git is not installed or not found.
        echo Please install Git from https://git-scm.com/ or use GitHub Desktop.
        echo.
        pause
        exit /b 1
    )
)

echo Git is ready!
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g., https://github.com/your-username/ganesh-runner.git): "

if "%REPO_URL%"=="" (
    echo [ERROR] No URL provided. Aborted.
    pause
    exit /b 1
)

echo.
echo 1. Initializing Git repository...
git init

echo 2. Staging project files...
git add .

echo 3. Creating initial commit...
git commit -m "Initial commit: 3D Lord Ganesha & Lord Shiva Endless Runner"

echo 4. Setting default branch to main...
git branch -M main

echo 5. Linking remote repository...
git remote remove origin >nul 2>nul
git remote add origin %REPO_URL%

echo 6. Pushing to GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo [!] If authentication is required, complete login in the Git pop-up window.
) else (
    echo.
    echo ================================================================
    echo   SUCCESS! Your game is now connected and pushed to GitHub!
    echo ================================================================
)

pause
