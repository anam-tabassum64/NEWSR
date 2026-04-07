@echo off
setlocal
cd /d "%~dp0backend"

echo Starting Newsr backend on http://localhost:5000
echo.

where py >nul 2>nul
if %errorlevel%==0 (
  py -3 app.py
) else (
  python app.py
)

echo.
echo Backend stopped or failed to start.
echo Check the error shown above, then press any key to close this window.
pause >nul
