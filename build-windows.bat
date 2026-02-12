@echo off
REM SERVE Windows Build Script
REM Builds the Windows desktop app using Tauri v2

echo ========================================
echo SERVE - Windows Desktop Build
echo ========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install from https://nodejs.org/
    exit /b 1
)
echo [OK] Node.js found

REM Check if Rust is installed
rustc --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Rust is not installed.
    echo Install from https://rustup.rs/
    exit /b 1
)
echo [OK] Rust found

REM Install npm dependencies
echo [INFO] Installing npm dependencies...
call npm ci

REM Build with Tauri (this automatically runs beforeBuildCommand which builds Next.js)
echo [INFO] Building Windows app with Tauri...
call npm run build:tauri

if errorlevel 1 (
    echo [ERROR] Build failed!
    exit /b 1
)

echo ========================================
echo Build complete!
echo ========================================
echo.
echo Output files should be in:
echo   src-tauri\target\release\bundle\nsis\
echo   src-tauri\target\release\bundle\msi\
echo.
echo ========================================
