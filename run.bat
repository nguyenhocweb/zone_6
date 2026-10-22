@echo off
title Zone 6 Signature - Startup
set "ROOT=%~dp0"
cd /d "%ROOT%"

echo ======================================================================
echo          HE THONG QUAN LY VA XEP LICH ZONE SIX (214 LNH)
echo          100% NODE.JS FULLSTACK BACKEND & NEXT.JS FRONTEND
echo ======================================================================
echo.

echo [1/2] Kiem tra Backend (be) node_modules...
if not exist "%ROOT%be\node_modules" (
    echo [CANH BAO] Chua co node_modules trong be! Dang chay npm install...
    cd /d "%ROOT%be"
    call npm install
    cd /d "%ROOT%"
)

echo [2/2] Kiem tra Frontend (fe) node_modules...
if not exist "%ROOT%fe\node_modules" (
    echo [CANH BAO] Chua co node_modules trong fe! Dang chay npm install...
    cd /d "%ROOT%fe"
    call npm install
    cd /d "%ROOT%"
)

echo.
echo Dang khoi dong Backend va Frontend trong 2 cua so rieng biet...
echo.

start "Zone 6 - Backend (Node.js)" cmd /k "%ROOT%run-backend.bat"
ping 127.0.0.1 -n 3 >nul

start "Zone 6 - Frontend (Next.js)" cmd /k "%ROOT%run-frontend.bat"

echo ======================================================================
echo  CAC DICH VU DANG CHAY:
echo  - Frontend (Giao dien):   http://localhost:3001
echo  - Backend API:            http://localhost:8000
echo  - Zalo / Scheduling API:  http://localhost:8000/api
echo ======================================================================
echo.
echo Dang tu dong mo trinh duyet den http://localhost:3001 trong 3 giay...
ping 127.0.0.1 -n 4 >nul
start http://localhost:3001

echo.
echo [GOI Y] De dung he thong, chi can dong 2 cua so Backend va Frontend.
echo Nhan phim bat ky de thoat cua so nay.
pause >nul
