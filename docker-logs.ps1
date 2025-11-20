# =====================================================
# Docker Compose ログ表示スクリプト（Windows）
# =====================================================

param(
    [string]$Service = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Rental Machine App - Docker Logs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($Service -eq "") {
    Write-Host "全サービスのログを表示します" -ForegroundColor Cyan
    Write-Host "終了するには Ctrl+C を押してください" -ForegroundColor Yellow
    Write-Host ""
    docker-compose logs -f
} else {
    Write-Host "サービス '$Service' のログを表示します" -ForegroundColor Cyan
    Write-Host "終了するには Ctrl+C を押してください" -ForegroundColor Yellow
    Write-Host ""
    docker-compose logs -f $Service
}
