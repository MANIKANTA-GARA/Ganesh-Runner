@echo off
title Connect 3D Ganesha & Shiva Runner to GitHub
cd /d "%~dp0"

:: Ensure Node is in PATH
if exist "C:\Users\asus\.gemini\antigravity\scratch\nodejs" (
    set "PATH=C:\Users\asus\.gemini\antigravity\scratch\nodejs;%PATH%"
)

:: Ensure standard Git paths are checked
if exist "C:\Program Files\Git\cmd\git.exe" (
    set "PATH=C:\Program Files\Git\cmd;%PATH%"
)
if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" (
    set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"
)

cls
echo ===============================================================================
echo        CONNECT 3D BAL GANESHA & LORD SHIVA RUNNER TO GITHUB
echo ===============================================================================
echo.
echo Choose how you want to connect to your GitHub:
echo.
echo   [1] Direct Instant Push (Recommended - Automatic repo creation with token)
echo   [2] Standard Git CLI Push (git remote add origin ^& git push)
echo   [3] Exit
echo.
set /p METHOD="Select an option (1, 2, or 3): "

if "%METHOD%"=="1" goto node_push
if "%METHOD%"=="2" goto git_cli_push
if "%METHOD%"=="3" exit /b 0
goto node_push

:node_push
echo.
echo -------------------------------------------------------------------------------
echo  Method 1: Instant Push using GitHub Token
echo -------------------------------------------------------------------------------
echo.
echo Generating a token takes 30 seconds:
echo 1. Go to https://github.com/settings/tokens
echo 2. Click "Generate new token (classic)"
echo 3. Check the "repo" box and click "Generate token"
echo.
set /p USER_TOKEN="Paste your GitHub Personal Access Token: "

if "%USER_TOKEN%"=="" (
    echo [ERROR] Token cannot be empty.
    pause
    exit /b 1
)

set /p USER_REPO="Enter repository name [Press Enter for default: ganesh-runner]: "
if "%USER_REPO%"=="" set "USER_REPO=ganesh-runner"

echo.
echo Connecting and uploading project files to GitHub...
node push_to_github.js "%USER_TOKEN%" "%USER_REPO%"

pause
exit /b %errorlevel%

:git_cli_push
echo.
echo -------------------------------------------------------------------------------
echo  Method 2: Standard Git CLI Push
echo -------------------------------------------------------------------------------
where git >nul 2>nul
if errorlevel 1 (
    echo [!] Git CLI is not installed or not in PATH.
    echo Switching to Method 1 (Direct Push)...
    goto node_push
)

echo Git CLI is ready!
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g., https://github.com/username/ganesh-runner.git): "

if "%REPO_URL%"=="" (
    echo [ERROR] No URL provided. Aborted.
    pause
    exit /b 1
)

echo.
echo 1. Initializing Git repository...
if not exist ".git" (
    git init
)
git branch -M main

echo 2. Staging files...
git add .

echo 3. Creating commit...
git commit -m "feat: 3D Bal Ganesha and Lord Shiva Endless Runner" 2>nul
if errorlevel 1 (
    echo [OK] Files already up to date.
)

echo 4. Setting remote origin...
git remote remove origin >nul 2>nul
git remote add origin %REPO_URL%

echo 5. Pushing to GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo [!] Push failed or authentication required.
    echo     You can try: git push -f -u origin main
) else (
    echo.
    echo ===============================================================================
    echo   SUCCESS! Your game is now connected and pushed to GitHub!
    echo ===============================================================================
)

pause
