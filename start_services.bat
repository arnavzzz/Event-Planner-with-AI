@echo off
title Event Planner AI - Startup
echo ============================================================
echo    Starting Event Planner AI Backend ^& React Frontend
echo ============================================================

set "ROOT=%~dp0"

echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000...
start "FastAPI Backend (Port 8000)" /D "%ROOT%" "%ROOT%backend\.venv\Scripts\uvicorn.exe" backend.main:app --host 127.0.0.1 --port 8000 --reload

echo [2/2] Launching Vite Frontend on http://localhost:5173...
start "Vite React Frontend (Port 5173)" /D "%ROOT%frontend" cmd /k npm.cmd run dev

echo ============================================================
echo Both services launched successfully in separate windows!
echo  - FastAPI Swagger UI: http://127.0.0.1:8000/docs
echo  - Vite Web App:       http://localhost:5173
echo ============================================================
pause
