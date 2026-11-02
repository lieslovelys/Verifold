@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
set "XDG_CONFIG_HOME=%~dp0.config"
echo Starting CertFolio local dev server on http://localhost:8787 ...
npm run dev
pause

