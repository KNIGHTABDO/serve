@echo off
REM SERVE Windows Build Setup Script
REM Run this to set up Rust and build the Windows app

echo ========================================
echo SERVE - Windows Desktop Build Setup
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
    echo [INFO] Rust not found. Installing...
    
    echo Downloading rustup...
    powershell -Command "& {Invoke-WebRequest -Uri https://static.rust-lang.org/rustup/dist/x86_64-pc-windows-msvc/rustup-init.exe -OutFile rustup-init.exe}"
    
    echo Installing Rust...
    rustup-init.exe -y --default-toolchain stable --target x86_64-pc-windows-msvc
    
    echo Cleaning up...
    del rustup-init.exe
    
    echo [OK] Rust installed
) else (
    echo [OK] Rust found
)

REM Install Tauri CLI
echo [INFO] Installing Tauri CLI...
cargo install tauri-cli --version "^2"

REM Install npm dependencies
echo [INFO] Installing npm dependencies...
npm ci

REM Build Next.js
echo [INFO] Building Next.js...
npm run build

REM Build Tauri
echo [INFO] Building Windows app...
cargo tauri build --bundles msi,zip

echo ========================================
echo Build complete!
echo ========================================
echo.
echo Output files:
echo   - src-tauri/target/release/bundle/msi/SERVE_1.0.0_x64.msi
echo   - src-tauri/target/release/bundle/zip/SERVE_1.0.0_x64.zip
echo.
echo Run 'cargo tauri dev' to test the app.
echo ========================================
