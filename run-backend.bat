@echo off
title Zone 6 Backend (Node.js)
cd /d "%~dp0be"
echo ===================================================
echo   Zone 6 - Backend Node.js (Port 8000)
echo   API Base: http://127.0.0.1:8000/api
echo ===================================================
echo.

if not exist "%~dp0be\node_modules" (
    echo [CANH BAO] Chua co node_modules trong be! Dang chay npm install...
    call npm install
)

npm run dev
if %ERRORLEVEL% neq 0 (
    echo.
    echo [LOI] Backend gap su co khi khoi dong!
    pause
)
