@echo off
setlocal
:: Default project address travels with this BAT when copied to another drive.
:: Application ports/storage/settings still come from the project's flashlab.config.json.
set "DEFAULT_PROJECT_DIR=\\wsl.localhost\Ubuntu\home\anpham\projects\FlashLab_HTML"
set "PROJECT_DIR=%~dp0"
set "PROJECT_OVERRIDE="
if exist "%~dp0start-flashcard-path.txt" (
  set /p "PROJECT_DIR="<"%~dp0start-flashcard-path.txt"
  set "PROJECT_OVERRIDE=1"
)
if defined FLASHLAB_PROJECT_DIR (
  set "PROJECT_DIR=%FLASHLAB_PROJECT_DIR%"
  set "PROJECT_OVERRIDE=1"
)
if not "%~1"=="" (
  set "PROJECT_DIR=%~1"
  set "PROJECT_OVERRIDE=1"
)
set "PROJECT_DIR=%PROJECT_DIR:"=%"
if exist "%PROJECT_DIR%\package.json" goto PROJECT_READY
if defined PROJECT_OVERRIDE goto ASK_PROJECT
:: Start WSL directly; UNC access need not be available before the distro starts.
set "PROJECT_DIR=%DEFAULT_PROJECT_DIR%"
goto PROJECT_READY

:ASK_PROJECT
echo Khong tim thay package.json tai "%PROJECT_DIR%".
echo Nhap thu muc project FlashLab, khong phai thu muc chi chua file BAT.
echo Windows: E:\Projects\FlashLab_HTML
echo WSL: \\wsl.localhost\Ubuntu\home\anpham\projects\FlashLab_HTML
set /p "PROJECT_DIR=Thu muc project: "
set "PROJECT_DIR=%PROJECT_DIR:"=%"
if exist "%PROJECT_DIR%\package.json" goto PROJECT_READY
echo Duong dan khong hop le. Chua chay npm.
pause
exit /b 1

:PROJECT_READY
echo FlashLab project: "%PROJECT_DIR%"
:: Ports and storage come from flashlab.config.json in the project.
if /I "%PROJECT_DIR:~0,16%"=="\\wsl.localhost\" goto START_WSL
if /I "%PROJECT_DIR:~0,7%"=="\\wsl$\" goto START_WSL
:: Native Windows project: run the Windows Node/npm installed on this machine.
where npm >nul 2>&1
if errorlevel 1 (
  echo Can cai Node.js 22.14 tro len tren Windows va mo lai file BAT.
  pause
  exit /b 1
)
pushd "%PROJECT_DIR%" || exit /b 1
call npm run dev -- --open
set "FLASHLAB_EXIT=%ERRORLEVEL%"
popd
pause
exit /b %FLASHLAB_EXIT%

:START_WSL
:: FOR /F ignores leading delimiters: token 1 is the server, token 2 the distro.
for /f "tokens=2,* delims=\" %%D in ("%PROJECT_DIR%") do (
  set "DISTRO=%%D"
  set "LINUX_DIR=/%%E"
)
set "LINUX_DIR=%LINUX_DIR:\=/%"
:: Require Linux npm so Windows CMD cannot fall back to a different directory.
wsl.exe -d "%DISTRO%" --cd "%LINUX_DIR%" -- bash -ic "test -f package.json || { echo 'Khong tim thay package.json trong project WSL.'; exit 1; }; case $(command -v npm) in /mnt/*) echo 'Hay cai Node.js va npm ben trong WSL, khong dung npm Windows.'; exit 1;; esac; npm run dev -- --open"
set "FLASHLAB_EXIT=%ERRORLEVEL%"
pause
exit /b %FLASHLAB_EXIT%
