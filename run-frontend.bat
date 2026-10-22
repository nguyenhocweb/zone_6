@echo off
title Zone 6 Frontend (Next.js)
cd /d "%~dp0fe"
echo ===================================================
echo   Zone 6 - Frontend Next.js (Port 3001)
echo   URL: http://localhost:3001
echo ===================================================
echo.
npm run dev
if %ERRORLEVEL% neq 0 (
    echo.
    echo [LOI] Frontend gap su co khi khoi dong!
    pause
)
