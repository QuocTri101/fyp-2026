$pidFile = Join-Path $PSScriptRoot ".api-pids"
Remove-Item $pidFile -ErrorAction SilentlyContinue

Get-ChildItem -Path $PSScriptRoot -Recurse -Filter *.Presentation.csproj |
  ForEach-Object {
    $p = Start-Process powershell -PassThru -ArgumentList "-NoExit","-Command","dotnet run --project '$($_.FullName)'"
    $p.Id | Add-Content $pidFile
  }