@echo off
set "XDG_CONFIG_HOME=%~dp0.config"
set "npm_config_cache=%~dp0.npm-cache"
set "TEMP=%~dp0.tmp"
set "TMP=%~dp0.tmp"
if not exist "%~dp0.tmp" mkdir "%~dp0.tmp"
echo Starting CertFolio on http://localhost:8787 (strictly using drive D:) ...
npm run dev
pause
