@echo off
REM ---------------------------------------------------------------
REM  push.bat - Commit & push changes to GitHub (origin/main)
REM  Usage: double-click, or run:  push "commit message"
REM ---------------------------------------------------------------
set "MSG=%~1"
if "%MSG%"=="" set "MSG=Update %date% %time%"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0push.ps1" -Message "%MSG%"

if errorlevel 1 (
  echo.
  echo Push failed - see messages above.
  pause
  exit /b 1
)
pause