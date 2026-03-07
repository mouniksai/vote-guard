# VoteGuard Frontend — Test Runner (PowerShell)
# Usage: .\testing\run-tests.ps1 [command]

param (
    [string]$Command = "help"
)

Write-Host ""
Write-Host "🗳️  VoteGuard Frontend — Test Suite" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

switch ($Command) {
    "all" {
        Write-Host "▶ Running all tests..." -ForegroundColor Blue
        npx jest --config jest.config.js --verbose
    }
    "watch" {
        Write-Host "▶ Running tests in watch mode..." -ForegroundColor Blue
        npx jest --config jest.config.js --watch
    }
    "coverage" {
        Write-Host "▶ Running tests with coverage report..." -ForegroundColor Blue
        npx jest --config jest.config.js --coverage
    }
    "utils" {
        Write-Host "▶ Running utility tests..." -ForegroundColor Blue
        npx jest --config jest.config.js --testPathPattern="testing/unit/utils" --verbose
    }
    "middleware" {
        Write-Host "▶ Running middleware tests..." -ForegroundColor Blue
        npx jest --config jest.config.js --testPathPattern="testing/unit/middleware" --verbose
    }
    "pages" {
        Write-Host "▶ Running page component tests..." -ForegroundColor Blue
        npx jest --config jest.config.js --testPathPattern="testing/unit/pages" --verbose
    }
    "login" {
        Write-Host "▶ Running login page tests..." -ForegroundColor Blue
        npx jest --config jest.config.js -- login --verbose
    }
    "dashboard" {
        Write-Host "▶ Running dashboard tests..." -ForegroundColor Blue
        npx jest --config jest.config.js -- dashboard --verbose
    }
    "clean" {
        Write-Host "▶ Cleaning test artifacts..." -ForegroundColor Blue
        if (Test-Path "coverage") { Remove-Item -Recurse -Force "coverage" }
        if (Test-Path "node_modules\.cache") { Remove-Item -Recurse -Force "node_modules\.cache" }
        Write-Host "✅ Cleaned!" -ForegroundColor Green
    }
    default {
        Write-Host "Usage: .\testing\run-tests.ps1 [command]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  all          - Run all tests"
        Write-Host "  watch        - Run tests in watch mode"
        Write-Host "  coverage     - Run tests with coverage report"
        Write-Host "  utils        - Run utility tests"
        Write-Host "  middleware   - Run middleware tests"
        Write-Host "  pages        - Run page component tests"
        Write-Host "  login        - Run login page tests"
        Write-Host "  dashboard    - Run dashboard tests"
        Write-Host "  clean        - Clean test artifacts"
        Write-Host ""
        Write-Host "Example: .\testing\run-tests.ps1 coverage" -ForegroundColor Gray
    }
}

Write-Host ""
