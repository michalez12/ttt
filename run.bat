@echo off
title KSeF Manager
cd /d %~dp0

echo.
echo  ================================
echo    KSeF Bank Manager
echo  ================================
echo.

REM Sprawdz czy Docker jest uruchomiony
docker info >nul 2>&1
if errorlevel 1 (
    echo [!] Docker nie jest uruchomiony!
    echo     Uruchom Docker Desktop i sprobuj ponownie.
    echo.
    pause
    exit /b 1
)

echo [*] Sprawdzam status kontenerow...
docker compose ps --quiet >nul 2>&1

REM Sprawdz czy kontenery juz dzialaja
for /f %%i in ('docker compose ps -q 2^>nul') do set RUNNING=%%i
if defined RUNNING (
    echo [*] Aplikacja juz dziala.
) else (
    echo [*] Uruchamiam kontenery...
    docker compose up -d
    if errorlevel 1 (
        echo [!] Blad uruchamiania kontenerow!
        pause
        exit /b 1
    )
    echo [*] Czekam na uruchomienie backendu...
    timeout /t 5 /nobreak >nul
)

echo.
echo [*] Otwieram aplikacje w przegladarce...
start http://localhost:5173

echo.
echo  ================================
echo    Aplikacja dostepna pod:
echo    http://localhost:5173
echo  ================================
echo.
echo  Aby zatrzymac aplikacje uzyj:
echo  stop.bat lub docker compose down
echo.
