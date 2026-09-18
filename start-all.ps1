# ShopStack Platform PowerShell Launcher
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "      ShopStack - Enterprise Multi-Vendor E-Commerce Platform" -ForegroundColor Yellow
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host ""

$workspace = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Starting Spring Boot Backend (Port 8081)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$workspace\backend'; Write-Host 'Starting Spring Boot Backend on http://localhost:8081...'; mvn spring-boot:run"

Write-Host "[2/2] Starting React + Vite Frontend (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$workspace\frontend'; Write-Host 'Starting Vite Frontend on http://localhost:3000...'; npm run dev"

Write-Host ""
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "Services initialized:" -ForegroundColor White
Write-Host "  -> Backend API:     http://localhost:8081" -ForegroundColor Yellow
Write-Host "  -> Health Endpoint: http://localhost:8081/api/health" -ForegroundColor Yellow
Write-Host "  -> Frontend Portal: http://localhost:3000" -ForegroundColor Yellow
Write-Host "=========================================================================" -ForegroundColor Cyan
