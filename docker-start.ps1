# =====================================================
# Docker Compose クイックスタートスクリプト（Windows）
# =====================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Rental Machine App - Docker Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Docker Desktopが起動しているか確認
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "エラー: Docker Desktopが起動していません。" -ForegroundColor Red
    Write-Host "Docker Desktopを起動してから、再度実行してください。" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Docker Desktopが起動しています" -ForegroundColor Green
Write-Host ""

# .envファイルが存在しない場合は作成
if (-not (Test-Path ".env")) {
    Write-Host "環境変数ファイル(.env)が見つかりません。" -ForegroundColor Yellow
    Write-Host ".env.exampleから.envを作成します..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .envファイルを作成しました" -ForegroundColor Green
    Write-Host ""
}

# 既存のコンテナを停止・削除
Write-Host "既存のコンテナを停止しています..." -ForegroundColor Cyan
docker-compose down 2>$null
Write-Host "✓ 既存のコンテナを停止しました" -ForegroundColor Green
Write-Host ""

# イメージをビルド
Write-Host "Dockerイメージをビルドしています（初回は時間がかかります）..." -ForegroundColor Cyan
docker-compose build --no-cache
if ($LASTEXITCODE -ne 0) {
    Write-Host "エラー: イメージのビルドに失敗しました。" -ForegroundColor Red
    exit 1
}
Write-Host "✓ イメージのビルドが完了しました" -ForegroundColor Green
Write-Host ""

# コンテナを起動
Write-Host "コンテナを起動しています..." -ForegroundColor Cyan
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "エラー: コンテナの起動に失敗しました。" -ForegroundColor Red
    exit 1
}
Write-Host "✓ コンテナを起動しました" -ForegroundColor Green
Write-Host ""

# ヘルスチェック待機
Write-Host "サービスの起動を待機しています..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# コンテナの状態確認
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "コンテナの状態" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "アクセス情報" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "フロントエンド: " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Green
Write-Host "バックエンドAPI: " -NoNewline
Write-Host "http://localhost:5000" -ForegroundColor Green
Write-Host "データベース:    " -NoNewline
Write-Host "localhost:5432" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "ログを表示するには:" -ForegroundColor Yellow
Write-Host "  docker-compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "コンテナを停止するには:" -ForegroundColor Yellow
Write-Host "  docker-compose down" -ForegroundColor White
Write-Host ""
Write-Host "詳細は README_DOCKER.md を参照してください。" -ForegroundColor Cyan
