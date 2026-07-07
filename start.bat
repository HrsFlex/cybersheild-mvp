@echo off
setlocal enabledelayedexpansion
title TriNetra Launcher

set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"
set "BACKEND=%ROOT%\TriNetra\backend"
set "FRONTEND=%ROOT%\TriNetra\frontend"

echo ==================================
echo   TriNetra - Starting Application
echo ==================================
echo.

if not exist "%BACKEND%" (
    echo [ERROR] Backend folder not found at "%BACKEND%"
    pause
    exit /b 1
)
if not exist "%FRONTEND%" (
    echo [ERROR] Frontend folder not found at "%FRONTEND%"
    pause
    exit /b 1
)

where python >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Python was not found on PATH. Install Python 3.10+ from https://www.python.org/downloads/
    echo         and make sure to check "Add python.exe to PATH" during setup.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js/npm was not found on PATH. Install it from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Setting up backend virtual environment...
if not exist "%BACKEND%\venv\Scripts\python.exe" (
    python -m venv "%BACKEND%\venv"
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
)

echo [2/5] Installing backend dependencies (this can take a minute the first time)...
call "%BACKEND%\venv\Scripts\pip.exe" install -q -r "%ROOT%\TriNetra\requirements.txt"
if errorlevel 1 (
    echo [WARN] Full requirements failed, trying requirements-minimal.txt...
    call "%BACKEND%\venv\Scripts\pip.exe" install -q -r "%ROOT%\TriNetra\requirements-minimal.txt"
)

if not exist "%BACKEND%\.env" (
    echo [3/5] No .env file found for the backend.
    echo         TriNetra can use OpenAI or OpenRouter for AI-enhanced insights.
    echo         OpenAI:     https://platform.openai.com/api-keys
    echo         OpenRouter: https://openrouter.ai/keys
    set "LLM_PROVIDER_INPUT="
    set /p LLM_PROVIDER_INPUT="        Which provider? [openai/openrouter] (default: openai): "
    if "!LLM_PROVIDER_INPUT!"=="" set "LLM_PROVIDER_INPUT=openai"
    set "LLM_KEY_INPUT="
    set /p LLM_KEY_INPUT="        Paste your API key now (or press Enter to skip / use demo mode): "

    echo LLM_PROVIDER=!LLM_PROVIDER_INPUT!> "%BACKEND%\.env"
    if /i "!LLM_PROVIDER_INPUT!"=="openrouter" (
        echo OPENROUTER_API_KEY=!LLM_KEY_INPUT!>> "%BACKEND%\.env"
    ) else (
        echo OPENAI_API_KEY=!LLM_KEY_INPUT!>> "%BACKEND%\.env"
    )

    if "!LLM_KEY_INPUT!"=="" (
        echo         Skipped - the app will use built-in mock AI responses.
        echo         You can add a key later by editing "%BACKEND%\.env"
    ) else (
        echo         Saved to "%BACKEND%\.env"
    )
) else (
    echo [3/5] Backend .env already configured, skipping.
)

echo [4/5] Installing frontend dependencies (this can take a minute the first time)...
pushd "%FRONTEND%"
if not exist "node_modules" (
    call npm install
) else (
    call npm install --no-audit --no-fund >nul
)
popd

echo [5/5] Launching backend and frontend servers...
start "TriNetra Backend" cmd /k "cd /d "%BACKEND%" && call venv\Scripts\activate.bat && python app.py"
start "TriNetra Frontend" cmd /k "cd /d "%FRONTEND%" && npm run dev"

echo.
echo Waiting for the backend to come up (this avoids opening the browser too early)...
set "BACKEND_READY=0"
for /l %%i in (1,1,45) do (
    curl -s -o nul -m 1 http://localhost:5001/api/health
    if not errorlevel 1 (
        set "BACKEND_READY=1"
        goto backend_ready
    )
    timeout /t 1 /nobreak >nul
)
:backend_ready
if "!BACKEND_READY!"=="1" (
    echo Backend is up.
) else (
    echo [WARN] Backend did not respond within 45 seconds.
    echo         Check the "TriNetra Backend" window for errors before using the app.
)

REM Give the frontend dev server a moment too before opening the browser
timeout /t 2 /nobreak >nul
start "" "http://localhost:5175/login.html"

echo.
echo ==================================
echo   TriNetra is starting up!
echo ==================================
echo   Frontend: http://localhost:5175/login.html
echo   Backend:  http://localhost:5001/api/health
echo.
echo   Two new windows were opened for the backend and frontend servers.
echo   Close those windows (or press Ctrl+C in them) to stop TriNetra.
echo ==================================
echo.
pause
