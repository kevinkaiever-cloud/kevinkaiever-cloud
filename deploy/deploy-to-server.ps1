# 一键部署到 103.189.141.176
# 运行: .\deploy\deploy-to-server.ps1
# 会提示输入 SSH 密码

$server = "103.189.141.176"
$user = "root"
$scriptPath = Join-Path $PSScriptRoot "remote-deploy.sh"
$scriptContent = (Get-Content $scriptPath -Raw -Encoding UTF8) -replace "`r`n", "`n"
if ($scriptContent -match "`r") { $scriptContent = $scriptContent -replace "`r", "" }

Write-Host ">>> 正在连接 $user@$server 并部署..." -ForegroundColor Cyan
Write-Host ">>> 请输入 SSH 密码（若需要）" -ForegroundColor Yellow
Write-Host ""

$scriptContent | ssh -o StrictHostKeyChecking=no "${user}@${server}" "bash -s"
