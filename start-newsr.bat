@echo off
setlocal
cd /d "%~dp0"

start "Newsr Backend" cmd /k ""%~dp0start-backend.bat""
start "Newsr Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
