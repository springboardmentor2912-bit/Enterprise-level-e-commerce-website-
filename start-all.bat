@echo off
TITLE ShopStack Multi-Vendor E-Commerce Platform Launcher
echo =========================================================================
echo       ShopStack - Enterprise Multi-Vendor E-Commerce Platform
echo =========================================================================
echo.
echo [1/2] Starting Spring Boot Backend (Port: 8081)...
start "ShopStack Backend Server (Port 8081)" cmd /k "cd backend && mvn spring-boot:run"

echo [2/2] Starting React + Vite Frontend (Port: 3000)...
start "ShopStack Frontend Dev Server (Port 3000)" cmd /k "cd frontend && npm run dev"

echo.
echo =========================================================================
echo Both services are launching in dedicated console windows:
echo - Backend API:  http://localhost:8081
echo - Frontend App: http://localhost:3000
echo - API Health:   http://localhost:8081/api/health
echo =========================================================================
echo.
pause
