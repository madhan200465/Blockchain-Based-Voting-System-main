@echo off
setlocal enabledelayedexpansion
title Voting System - One Click Startup
echo ============================================================
echo 🏛️  SECURE LEDGER BLOCKCHAIN VOTING SYSTEM
echo ============================================================
echo.

:: Check for node_modules
if not exist "backend\node_modules" (
    echo [!] Missing backend dependencies. Running npm install...
    cd backend && call npm install && cd ..
)
if not exist "frontend\node_modules" (
    echo [!] Missing frontend dependencies. Running npm install...
    cd frontend && call npm install && cd ..
)

:: Automatically Check and Kill Port Conflicts
echo [0/3] 🔍 Cleaning up ports (7545, 8000, 3000) to avoid conflicts...
for %%p in (7545 8000 3000) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING') do (
        echo [!] Killing process %%a on port %%p...
        taskkill /F /PID %%a /T > nul 2>&1
    )
)
timeout /t 2 /nobreak > nul

echo [1/3] 🔵 Starting local Blockchain (Ganache)...
start "VotingSystem-Blockchain" cmd /c "npx ganache-cli -p 7545 --host 0.0.0.0"
echo Waiting for blockchain to initialize (12 seconds)...
timeout /t 12 /nobreak > nul

echo [2/3] 🟢 Starting Blockchain Migrations...
cd backend
:: Run migration first, then start dev server
echo Running Truffle Migration...
call npx truffle migrate --reset --network development
echo.
echo 🚀 Migration Complete! Starting Backend Server...
start "VotingSystem-Backend" cmd /k "npm run dev"
cd ..
echo Waiting for backend and migrations to complete (15 seconds)...
timeout /t 15 /nobreak > nul

echo [3/3] 🟡 Starting Frontend Dashboard...
cd frontend
start "VotingSystem-Frontend" cmd /c "npm start"
cd ..

echo.
echo ============================================================
echo ✨ SUCCESS: All services are launching!
echo ============================================================
echo.
echo 🔐 REGISTERED ACCOUNTS:
echo 👔 ADMIN (Commission):  admin@test.com
echo 👤 VOTER (Registered):  john1@gmail.com
echo 🔑 PASSWORD (ALL):      test1234
echo.
echo Keep the other terminal windows open while using the app.
echo Press any key to close this launcher window.
pause > nul
