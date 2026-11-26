Get-ChildItem -Path $PSScriptRoot -Recurse -Filter *.Presentation.csproj |
  ForEach-Object {
    Start-Process powershell -ArgumentList "-NoExit","-Command","dotnet run --project '$($_.FullName)'"
  }