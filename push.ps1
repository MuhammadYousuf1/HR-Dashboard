<#
.SYNOPSIS
  Stage, commit and push the current changes to the GitHub repository (origin/main).
.PARAMETER Message
  Optional commit message. When omitted a timestamped message is used.
.PARAMETER Push
  Set to "no" to skip pushing (commit only).
#>
param(
    [string]$Message = $null,
    [string]$Push = "yes"
)

$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
if (-not $root) { $root = $PWD.Path }
Set-Location $root

Write-Host "=== Pushing repository at: $root ===" -ForegroundColor Cyan

if (-not (Test-Path ".git")) {
    Write-Host "[ERROR] Not a git repository." -ForegroundColor Red
    exit 1
}

if (-not $Message) { $Message = "Update " + (Get-Date -Format "yyyy-MM-dd HH:mm") }
$Message = $Message.Trim()

Write-Host "1) Staging changes..." -ForegroundColor Cyan
git add -A
if ($LASTEXITCODE -ne 0) { exit 1 }
git status --short

if (-not (git status --porcelain)) {
    Write-Host "[SKIP] Nothing to commit - working tree is clean." -ForegroundColor Yellow
} else {
    Write-Host "2) Committing: $Message" -ForegroundColor Cyan
    git commit -m $Message
    if ($LASTEXITCODE -ne 0) { exit 1 }
}

if ($Push -in @("no","false","0","n")) {
    Write-Host "Push skipped." -ForegroundColor Yellow
    exit 0
}

Write-Host "3) Pushing to origin/main ..." -ForegroundColor Cyan
git push origin HEAD:main
$attempts = 0
while ($LASTEXITCODE -ne 0 -and $attempts -lt 5) {
    $attempts++
    Write-Host "   Push rejected - pulling (rebase) then retrying..." -ForegroundColor Yellow
    git pull --rebase origin main
    if ($LASTEXITCODE -ne 0) { Write-Host "   Rebase failed - resolve conflicts manually." -ForegroundColor Red; exit 1 }
    git push origin HEAD:main
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "=== SUCCESS: Code pushed to origin/main ===" -ForegroundColor Green
    git status -sb
} else {
    Write-Host "=== FAILED ===" -ForegroundColor Red
    exit 1
}