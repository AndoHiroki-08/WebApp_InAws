# =====================================================
# Docker Compose 停止スクリプト（Windows）
# =====================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Rental Machine App - Docker Stop" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# コンテナを停止
Write-Host "コンテナを停止しています..." -ForegroundColor Cyan
docker-compose stop
if ($LASTEXITCODE -ne 0) {
    Write-Host "エラー: コンテナの停止に失敗しました。" -ForegroundColor Red
    exit 1
}
Write-Host "✓ コンテナを停止しました" -ForegroundColor Green
Write-Host ""

# オプション: コンテナとネットワークを削除
$removeContainers = Read-Host "コンテナとネットワークを削除しますか？ (y/N)"
if ($removeContainers -eq "y" -or $removeContainers -eq "Y") {
    Write-Host "コンテナとネットワークを削除しています..." -ForegroundColor Cyan
    docker-compose down
    Write-Host "✓ コンテナとネットワークを削除しました" -ForegroundColor Green
    Write-Host ""
    
    # オプション: ボリュームも削除
    $removeVolumes = Read-Host "データベースのデータ(ボリューム)も削除しますか？ (y/N)"
    if ($removeVolumes -eq "y" -or $removeVolumes -eq "Y") {
        Write-Host "警告: データベースのデータが完全に削除されます！" -ForegroundColor Red
        $confirm = Read-Host "本当に削除しますか？ (yes/no)"
        if ($confirm -eq "yes") {
            docker-compose down -v
            Write-Host "✓ ボリュームを削除しました" -ForegroundColor Green
        } else {
            Write-Host "ボリュームの削除をキャンセルしました" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "完了" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "再度起動するには:" -ForegroundColor Yellow
Write-Host "  .\docker-start.ps1" -ForegroundColor White
Write-Host "または" -ForegroundColor Yellow
Write-Host "  docker-compose up -d" -ForegroundColor White
