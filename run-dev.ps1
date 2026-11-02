$workspace = $PSScriptRoot
$env:XDG_CONFIG_HOME = "$workspace\.config"
$env:npm_config_cache = "$workspace\.npm-cache"
$env:TEMP = "$workspace\.tmp"
$env:TMP = "$workspace\.tmp"

if (-not (Test-Path "$workspace\.tmp")) {
    New-Item -ItemType Directory -Path "$workspace\.tmp" -Force | Out-Null
}

Write-Host "Starting CertFolio on http://localhost:8787 (all caches & storage on D:) ..." -ForegroundColor Cyan
& npm.cmd run dev
