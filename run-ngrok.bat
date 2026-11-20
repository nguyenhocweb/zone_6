@echo off
title Zone 6 Ngrok Tunnel (Port 8000)
cd /d "%~dp0"
echo ===================================================
echo   Zone 6 - Dedicated Ngrok Tunnel
echo   Domain: https://mystify-collie-acquire.ngrok-free.dev
echo   Local Web Inspection: http://127.0.0.1:4041
echo   Backend Port: 8000
echo ===================================================
echo.
ngrok http 8000 --url=mystify-collie-acquire.ngrok-free.dev --config="%~dp0ngrok_zone6.yml"
pause
