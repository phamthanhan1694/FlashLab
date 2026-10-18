@echo off
setlocal DisableDelayedExpansion
:: Default to the directory containing this launcher on any machine or drive.
:: Application ports/storage/settings still come from the project's flashlab.config.json.
set "PROJECT_DIR=%~dp0"
:: Priority: command-line argument > environment variable > path file > launcher directory.
if exist "%~dp0start-flashcard-path.txt" (
  set /p "PROJECT_DIR="<"%~dp0start-flashcard-path.txt"
)
if defined FLASHLAB_PROJECT_DIR (
  set "PROJECT_DIR=%FLASHLAB_PROJECT_DIR%"
)
if not "%~1"=="" (
  set "PROJECT_DIR=%~1"
)
set "PROJECT_DIR=%PROJECT_DIR:"=%"
:: Only use Windows project paths; never start a Linux distribution through a share.
if /I "%PROJECT_DIR:~0,16%"=="\\wsl.localhost\" goto WINDOWS_ONLY
if /I "%PROJECT_DIR:~0,7%"=="\\wsl$\" goto WINDOWS_ONLY
:: Resolve relative overrides from the launcher, independent of the terminal's directory.
pushd "%~dp0" || exit /b 1
for %%P in ("%PROJECT_DIR%") do set "PROJECT_DIR=%%~fP"
popd
if exist "%PROJECT_DIR%\package.json" goto PROJECT_READY

:ASK_PROJECT
echo Khong tim thay package.json tai "%PROJECT_DIR%".
echo Nhap thu muc project FlashLab, khong phai thu muc chi chua file BAT.
echo Co the keo thu muc project vao cua so nay, roi nhan Enter.
set /p "PROJECT_DIR=Thu muc project: "
set "PROJECT_DIR=%PROJECT_DIR:"=%"
if /I "%PROJECT_DIR:~0,16%"=="\\wsl.localhost\" goto WINDOWS_ONLY
if /I "%PROJECT_DIR:~0,7%"=="\\wsl$\" goto WINDOWS_ONLY
if exist "%PROJECT_DIR%\package.json" goto PROJECT_READY
echo Duong dan khong hop le. Chua chay npm.
pause
exit /b 1

:PROJECT_READY
echo FlashLab project: "%PROJECT_DIR%"
:: Ports and storage come from flashlab.config.json in the project.
:: Native Windows project: run the Windows Node/npm installed on this machine.
pushd "%PROJECT_DIR%" || exit /b 1
:: Use the project's installed NVM for Windows version without changing its global symlink.
if not defined NVM_HOME goto CHECK_RUNTIME
if not exist "%NVM_HOME%\nvm.exe" goto CHECK_RUNTIME
if not exist .nvmrc goto CHECK_RUNTIME
set "REQUIRED_NODE_VERSION="
set /p "REQUIRED_NODE_VERSION="<.nvmrc
if not defined REQUIRED_NODE_VERSION goto CHECK_RUNTIME
set "REQUIRED_NODE_VERSION=%REQUIRED_NODE_VERSION:v=%"
if not exist "%NVM_HOME%\v%REQUIRED_NODE_VERSION%\node.exe" (
  echo Node.js trong .nvmrc chua duoc cai trong NVM for Windows.
  echo Chay: nvm install %REQUIRED_NODE_VERSION%
  goto FAIL_WINDOWS
)
set "PATH=%NVM_HOME%\v%REQUIRED_NODE_VERSION%;%PATH%"

:CHECK_RUNTIME
where node.exe >nul 2>&1
if errorlevel 1 (
  echo Khong tim thay Node.js tren Windows.
  echo Hay cai Node.js 22.14.0 tro len kem npm, sau do mo lai file BAT.
  goto FAIL_WINDOWS
)
where npm.cmd >nul 2>&1
if errorlevel 1 (
  echo Khong tim thay npm tren Windows. Hay cai Node.js kem npm.
  goto FAIL_WINDOWS
)
echo Node.js:
node.exe --version
if errorlevel 1 goto FAIL_WINDOWS
where node.exe
echo npm:
call npm.cmd --version
if errorlevel 1 goto FAIL_WINDOWS
where npm.cmd
:: Match package.json: Node.js >= 22.14.0.
node.exe -e "const [major, minor] = process.versions.node.split('.').map(Number); process.exit(process.platform === 'win32' && (major > 22 || (major === 22 && minor >= 14)) ? 0 : 1)"
if errorlevel 1 (
  echo FlashLab can Node.js 22.14.0 tro len. Hay cap nhat Node.js roi chay lai file BAT.
  goto FAIL_WINDOWS
)

:: First run: create local settings from the portable template.
if exist flashlab.config.json goto CHECK_DEPENDENCIES
if not exist flashlab.config.example.json (
  echo Khong tim thay flashlab.config.example.json de tao cau hinh.
  goto FAIL_WINDOWS
)
echo Chua co flashlab.config.json. Dang tao cau hinh tu file mau...
copy /y "flashlab.config.example.json" "flashlab.config.json" >nul
if errorlevel 1 goto FAIL_WINDOWS

:CHECK_DEPENDENCIES
:: First run: install dependencies before starting the development server.
if exist node_modules\ goto RUN_DEV
echo Chua co node_modules. Dang cai dependencies...
if exist package-lock.json goto INSTALL_LOCKED
call npm.cmd install
goto INSTALL_FINISHED

:INSTALL_LOCKED
call npm.cmd ci

:INSTALL_FINISHED
if errorlevel 1 goto FAIL_WINDOWS

:RUN_DEV
call npm.cmd run dev -- --open
set "FLASHLAB_EXIT=%ERRORLEVEL%"
popd
pause
exit /b %FLASHLAB_EXIT%

:FAIL_WINDOWS
popd
pause
exit /b 1

:WINDOWS_ONLY
echo File BAT chi chay bang Node.js va npm cua Windows.
echo Hay chon thu muc project tren Windows hoac chep repo sang o dia Windows.
pause
exit /b 1
