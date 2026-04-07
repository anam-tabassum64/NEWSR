@echo off
setlocal
cd /d "%~dp0"

echo Launching NEWSR backend and frontend...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.

start "Newsr Backend" cmd /k ""%~dp0start-backend.bat""
start "Newsr Frontend" cmd /k "cd /d %~dp0frontend && npm.cmd run dev -- --host 127.0.0.1 --port 5173"

timeout /t 5 /nobreak >nul
start "" "http://localhost:5173"
