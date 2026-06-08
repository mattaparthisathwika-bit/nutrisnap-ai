# Set all temp directories to D: to avoid C: disk full error
$env:npm_config_cache = "D:\npm-cache"
$env:TMPDIR = "D:\temp"
$env:TEMP = "D:\temp"
$env:TMP = "D:\temp"

# Ensure we're in the right directory
Set-Location D:\cal-ai-clone-starter\cal-ai-clone

Write-Host "Starting OpenAI proxy on port 3001..." -ForegroundColor Green
npm run proxy
