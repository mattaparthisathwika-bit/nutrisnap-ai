# Set all temp directories to D: to avoid C: disk full error
$env:npm_config_cache = "D:\npm-cache"
$env:TMPDIR = "D:\temp"
$env:TEMP = "D:\temp"
$env:TMP = "D:\temp"
$env:NODE_TEMP_DIR = "D:\node-temp"
$env:METRO_CACHE_DIR = "D:\metro-cache"

# Create temp directories if they don't exist
@("D:\npm-cache", "D:\temp", "D:\node-temp", "D:\metro-cache") | ForEach-Object {
  if (-not (Test-Path $_)) {
    New-Item -ItemType Directory -Path $_ -Force | Out-Null
  }
}

# Ensure we're in the right directory
Set-Location D:\cal-ai-clone-starter\cal-ai-clone

Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

Write-Host "Starting development server..." -ForegroundColor Green
npm start
