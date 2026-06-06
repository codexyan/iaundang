@echo off
echo Fixing Claude Code model config...

powershell -Command "$claudeDir = \"$env:USERPROFILE\.claude\"; if (!(Test-Path $claudeDir)) { New-Item -ItemType Directory -Path $claudeDir | Out-Null }; $settingsFile = \"$claudeDir\settings.json\"; if (Test-Path $settingsFile) { $settings = Get-Content $settingsFile | ConvertFrom-Json } else { $settings = [PSCustomObject]@{} }; $settings | Add-Member -NotePropertyName 'model' -NotePropertyValue 'claude-opus-4-6' -Force; $settings | ConvertTo-Json -Depth 10 | Set-Content $settingsFile; Write-Host 'Model set to claude-opus-4-6 successfully!' -ForegroundColor Green"

echo.
echo Done!
pause
