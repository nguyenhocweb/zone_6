@echo off
title Zone 6 - Zalo Backend Service (Port 5005)
set "ROOT=%~dp0"
cd /d "%ROOT%be"

echo ======================================================================
echo       KHOI DONG ZALO BACKEND SERVICE (PORT 5005)
echo ======================================================================
echo.

if not exist "%ROOT%be\node_modules" (
    echo [CANH BAO] Chua co node_modules trong be! Dang chay npm install...
    call npm install
)

echo Dang khoi dong Zalo Service...
npm run dev
