@echo off
title GamerProfile
cd /d "%~dp0"

echo Iniciando GamerProfile...
echo (No cierres esta ventana mientras uses la app)
echo.

start "" cmd /c "timeout /t 4 /nobreak >nul & start "" http://localhost:5173"

call npm run dev

pause
