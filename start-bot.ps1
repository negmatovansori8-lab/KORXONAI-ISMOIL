$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

function Wait-Http($url, $seconds) {
  $deadline = (Get-Date).AddSeconds($seconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $r = Invoke-WebRequest -UseBasicParsing -TimeoutSec 5 $url
      if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { return $true }
    } catch {}
    Start-Sleep -Seconds 2
  }
  return $false
}

Write-Host "Starting API..."
Start-Process -WorkingDirectory (Join-Path $root "backend") cmd -ArgumentList "/k", "npx tsx watch src/index.ts"
if (-not (Wait-Http "http://127.0.0.1:4000/api/health" 40)) {
  Write-Host "API did not start on :4000"
}

Write-Host "Starting Mini App (production)..."
$front = Join-Path $root "frontend"
if (-not (Test-Path (Join-Path $front ".next\BUILD_ID"))) {
  Push-Location $front
  npm run build
  Pop-Location
}
Start-Process -WorkingDirectory $front cmd -ArgumentList "/k", "npx next start -p 3001 -H 127.0.0.1"
if (-not (Wait-Http "http://127.0.0.1:3001/login" 60)) {
  Write-Host "Mini App did not start on :3001"
}

Write-Host "Starting Cloudflare tunnel..."
Start-Process -WorkingDirectory $root powershell -ArgumentList "-NoExit", "-Command", "npx --yes cloudflared tunnel --url http://127.0.0.1:3001"

Write-Host "API http://127.0.0.1:4000  Mini App http://127.0.0.1:3001"
Write-Host "Copy the trycloudflare.com URL into .miniapp-url and restart API if needed."
