param(
  [string]$ProjectPath = "C:\Users\Administrator\Downloads\kevinkaiever-cloud-git"
)

$node = "C:\Program Files\nodejs\node.exe"
$npm = "C:\Program Files\nodejs\npm.cmd"

if (!(Test-Path $ProjectPath)) {
  Write-Host "ProjectPath not found: $ProjectPath"
  exit 1
}

Push-Location $ProjectPath
& $npm run ingest
Pop-Location
