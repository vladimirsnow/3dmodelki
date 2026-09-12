@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo Installing dependencies...
call npm install
if errorlevel 1 (
  echo Dependency installation failed.
  pause
  exit /b 1
)

echo Syncing data from production...
call npm run sync:prod
if errorlevel 1 (
  echo Failed to sync data from artavenue.studio.
  pause
  exit /b 1
)

echo Starting project...
call npm run dev
pause
