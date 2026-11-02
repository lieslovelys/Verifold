$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
$env:XDG_CONFIG_HOME = "$PSScriptRoot\.config"
Write-Host "Starting CertFolio local dev server on http://localhost:8787 ..." -ForegroundColor Cyan
& "C:\Program Files\nodejs\npm.cmd" run dev

