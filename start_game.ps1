$env:PATH = "C:\Users\asus\.gemini\antigravity\scratch\nodejs;" + $env:PATH
Set-Location -Path $PSScriptRoot
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   3D Lord Ganesha & Lord Shiva Endless Runner" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Start-Process "http://localhost:3000"
npm run dev
