param(
  [string]$TaskName = "CareerKLineDailyIngest"
)

schtasks /Delete /TN $TaskName /F | Out-Null
Write-Host "Scheduled task removed: $TaskName"
