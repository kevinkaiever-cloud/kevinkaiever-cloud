param(
  [string]$ProjectPath = "C:\Users\Administrator\Downloads\kevinkaiever-cloud-git"
)

$taskName = "CareerKLineDailyIngest"
$scriptPath = Join-Path $ProjectPath "scripts\run-ingest.ps1"
$action = "powershell.exe -ExecutionPolicy Bypass -File `"$scriptPath`" -ProjectPath `"$ProjectPath`""

schtasks /Create /TN $taskName /SC DAILY /ST 02:30 /TR $action /F | Out-Null
Write-Host "Scheduled task created: $taskName (daily at 02:30)"
