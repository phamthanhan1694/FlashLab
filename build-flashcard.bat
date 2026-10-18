@echo off
setlocal DisableDelayedExpansion
:: Always build the repository next to this file, regardless of the current terminal directory.
set "PROJECT_DIR=%~dp0"
if /I "%PROJECT_DIR:~0,16%"=="\\wsl.localhost\" goto WINDOWS_ONLY
if /I "%PROJECT_DIR:~0,7%"=="\\wsl$\" goto WINDOWS_ONLY
pushd "%~dp0" || exit /b 1
if not exist package.json (
  echo Hay dat file BAT nay trong thu muc goc cua repo FlashLab.
  goto FAIL
)
where node.exe >nul 2>&1
if errorlevel 1 (
  echo Hay cai Node.js kem npm, sau do mo lai file BAT.
  goto FAIL
)
where npm.cmd >nul 2>&1
if errorlevel 1 (
  echo Khong tim thay npm. Hay cai Node.js kem npm.
  goto FAIL
)
node.exe -e "const [major, minor] = process.versions.node.split('.').map(Number); process.exit(process.platform === 'win32' && (major > 22 || (major === 22 && minor >= 14)) ? 0 : 1)"
if errorlevel 1 (
  echo FlashLab can Node.js 22.14.0 tro len.
  goto FAIL
)
where cargo.exe >nul 2>&1
if errorlevel 1 goto MISSING_RUST
where rustc.exe >nul 2>&1
if errorlevel 1 goto MISSING_RUST
if exist node_modules\ goto BUILD
echo Dang cai dependencies...
if exist package-lock.json goto INSTALL_LOCKED
call npm.cmd install
goto INSTALL_FINISHED

:INSTALL_LOCKED
call npm.cmd ci

:INSTALL_FINISHED
if errorlevel 1 goto FAIL

:BUILD
echo FlashLab project: "%CD%"
call npm.cmd run desktop:build -- --bundles nsis
set "FLASHLAB_BUILD_EXIT=%ERRORLEVEL%"
if not "%FLASHLAB_BUILD_EXIT%"=="0" goto FINISH
echo Bo cai Windows: "%CD%\src-tauri\target\release\bundle\nsis\"
goto FINISH

:MISSING_RUST
echo Can cai Rust stable voi toolchain MSVC va mo lai terminal.
echo May build cung can Visual Studio Build Tools: Desktop development with C++ va Windows SDK.
echo Huong dan: docs\tauri.md

:FAIL
set "FLASHLAB_BUILD_EXIT=1"

:FINISH
popd
pause
exit /b %FLASHLAB_BUILD_EXIT%

:WINDOWS_ONLY
echo File BAT chi build bang cong cu Windows. Hay chep repo sang o dia Windows.
pause
exit /b 1
