@echo off
title KSeF Manager - Zatrzymywanie
cd /d %~dp0

echo.
echo [*] Zatrzymuje KSeF Manager...
docker compose down

echo.
echo [*] Aplikacja zatrzymana.
echo.
pause
