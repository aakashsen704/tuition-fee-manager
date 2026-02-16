@echo off
echo ========================================
echo Tuition Fee Manager Setup
echo ========================================
echo.

echo Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo To start the application:
echo 1. Open TWO command prompts
echo 2. In first prompt, run: npm start
echo 3. In second prompt, run: cd client ^&^& npm start
echo 4. Browser will open automatically at http://localhost:3000
echo.
pause
