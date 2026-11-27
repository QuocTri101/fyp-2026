$pidFile = Join-Path $PSScriptRoot ".api-pids"

if (Test-Path $pidFile) {
  Get-Content $pidFile | ForEach-Object { taskkill /PID $_ /T /F 2>$null | Out-Null }
  Remove-Item $pidFile
}

# Safety net: kill anything still listening on the API ports
foreach ($port in 5000..5005) {
  Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}
Write-Host "All APIs stopped."