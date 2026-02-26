@echo off
cd /d %~dp0

set BACKUP_DIR=%~dp0backups
set DATE_STR=%date:~6,4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%
set DATE_STR=%DATE_STR: =0%
set FILENAME=ksef_backup_%DATE_STR%.sql

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo [*] Tworzenie backupu bazy danych...
docker compose exec -T db pg_dump -U ksef_user ksef_db > "%BACKUP_DIR%\%FILENAME%"

if errorlevel 1 (
    echo [!] Blad tworzenia backupu!
) else (
    echo [*] Backup zapisany: backups\%FILENAME%
)

REM Usun backupy starsze niz 30 dni
forfiles /p "%BACKUP_DIR%" /s /m *.sql /d -30 /c "cmd /c del @path" >nul 2>&1

echo.
pause
