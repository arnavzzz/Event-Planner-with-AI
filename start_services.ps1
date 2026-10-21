# =============================================================================
# Event Planner - Full Stack Startup Script (FastAPI + Vite React)
# =============================================================================

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   Starting Event Planner AI Backend & React Frontend      " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$ROOT_DIR = $PSScriptRoot

# 1. Start FastAPI Backend (port 8000)
Write-Host "[1/2] Launching FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
$BackendCommand = "& '.\backend\.venv\Scripts\uvicorn.exe' backend.main:app --host 127.0.0.1 --port 8000 --reload"
$BackendProcess = Start-Process -FilePath "powershell.exe" -WorkingDirectory $ROOT_DIR -ArgumentList @("-NoExit", "-Command", $BackendCommand) -PassThru

# 2. Start Vite Frontend (port 5173)
Write-Host "[2/2] Launching Vite Frontend on http://localhost:5173..." -ForegroundColor Green
$FrontendCommand = "npm.cmd run dev"
$FrontendProcess = Start-Process -FilePath "powershell.exe" -WorkingDirectory (Join-Path $ROOT_DIR "frontend") -ArgumentList @("-NoExit", "-Command", $FrontendCommand) -PassThru

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Both services launched successfully in separate windows!" -ForegroundColor Green
Write-Host " - FastAPI API Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host " - React Application: http://localhost:5173" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
