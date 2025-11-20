# Docker Compose セットアップガイド

## 概要
このプロジェクトは、Docker Composeを使用してフロントエンド(Next.js)、バックエンド(ASP.NET Core)、データベース(PostgreSQL)を一括で起動・管理します。

## 前提条件
- Docker Desktop がインストールされていること
- Docker Compose がインストールされていること（Docker Desktop に同梱）
- ポート 3000, 5000, 5432 が利用可能であること

## プロジェクト構成

```
WebApp_InAws/
├── docker-compose.yml              # 開発環境用Docker Compose設定
├── docker-compose.prod.yml         # 本番環境用Docker Compose設定
├── .env.example                    # 環境変数のサンプル
├── .dockerignore                   # Docker共通の除外ファイル
├── database/
│   ├── 01_create_tables.sql       # テーブル作成スクリプト
│   └── 02_insert_sample_data.sql  # サンプルデータ投入スクリプト
├── web_backend/
│   ├── Dockerfile                  # バックエンド用Dockerfile
│   └── .dockerignore               # バックエンド用除外ファイル
└── web_frontend/
    ├── Dockerfile                  # フロントエンド開発環境用Dockerfile
    ├── Dockerfile.prod             # フロントエンド本番環境用Dockerfile
    └── .dockerignore               # フロントエンド用除外ファイル
```

## クイックスタート

### 1. 環境変数の設定（任意）

```powershell
# .env.exampleをコピーして.envを作成
Copy-Item .env.example .env

# 必要に応じて.envの内容を編集
notepad .env
```

### 2. コンテナの起動

```powershell
# 全コンテナをビルドして起動
docker-compose up -d --build
```

### 3. アクセス確認

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:5000
- **データベース**: localhost:5432

### 4. ログの確認

```powershell
# 全コンテナのログを表示
docker-compose logs -f

# 特定のコンテナのログを表示
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f database
```

## コマンド一覧

### 起動・停止

```powershell
# コンテナを起動（バックグラウンド）
docker-compose up -d

# コンテナを起動（ログ表示）
docker-compose up

# コンテナを停止
docker-compose stop

# コンテナを停止して削除
docker-compose down

# コンテナ、ネットワーク、ボリュームを全て削除
docker-compose down -v
```

### ビルド

```powershell
# イメージを再ビルド
docker-compose build

# キャッシュを使わずに再ビルド
docker-compose build --no-cache

# 特定のサービスのみビルド
docker-compose build backend
```

### コンテナの管理

```powershell
# 起動中のコンテナ一覧
docker-compose ps

# コンテナの状態確認
docker-compose ps -a

# 特定のコンテナに入る
docker-compose exec frontend sh
docker-compose exec backend sh
docker-compose exec database psql -U postgres -d rental_machine_db
```

### データベース操作

```powershell
# データベースに接続
docker-compose exec database psql -U postgres -d rental_machine_db

# SQLファイルを実行
docker-compose exec -T database psql -U postgres -d rental_machine_db < database/01_create_tables.sql

# データベースのバックアップ
docker-compose exec -T database pg_dump -U postgres rental_machine_db > backup.sql

# データベースのリストア
docker-compose exec -T database psql -U postgres -d rental_machine_db < backup.sql
```

### トラブルシューティング

```powershell
# コンテナの再起動
docker-compose restart

# 特定のコンテナの再起動
docker-compose restart backend

# コンテナの強制再作成
docker-compose up -d --force-recreate

# 未使用のイメージ・コンテナを削除
docker system prune -a
```

## ヘルスチェック

各コンテナにはヘルスチェックが設定されています。

```powershell
# ヘルスチェックの状態確認
docker-compose ps
```

- **database**: PostgreSQLの接続確認（10秒間隔）
- **backend**: APIエンドポイントの確認（30秒間隔）
- **frontend**: Webサーバーの確認（30秒間隔）

## 本番環境での起動

```powershell
# 本番環境用の設定で起動
docker-compose -f docker-compose.prod.yml up -d --build

# 環境変数を指定して起動
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## 開発時の注意事項

### ホットリロード

- **フロントエンド**: `web_frontend`フォルダがマウントされており、コード変更が即座に反映されます
- **バックエンド**: コード変更後はコンテナの再ビルドが必要です

```powershell
# バックエンドの再ビルドと再起動
docker-compose up -d --build backend
```

### ポート変更

ポートを変更する場合は、`docker-compose.yml`の`ports`セクションを編集してください。

```yaml
# 例: フロントエンドのポートを8080に変更
frontend:
  ports:
    - "8080:3000"
```

## データの永続化

データベースのデータは、Dockerボリューム`postgres_data`に保存されます。

```powershell
# ボリューム一覧
docker volume ls

# ボリュームの詳細確認
docker volume inspect webapp_inaws_postgres_data

# ボリュームの削除（データが削除されます！）
docker volume rm webapp_inaws_postgres_data
```

## ネットワーク構成

すべてのコンテナは`rental_machine_network`という同じネットワークに接続されており、コンテナ名で相互に通信できます。

```yaml
# バックエンドからデータベースへの接続例
ConnectionString: "Host=database;Port=5432;Database=rental_machine_db;..."
```

## パフォーマンス最適化

### Windows環境での最適化

Docker DesktopのWSL2バックエンドを使用することを推奨します。

```powershell
# WSL2の有効化（管理者権限が必要）
wsl --install
wsl --set-default-version 2
```

### ビルドキャッシュの活用

マルチステージビルドにより、効率的なイメージビルドを実現しています。

## セキュリティ

### 本番環境での注意点

1. **パスワード変更**: デフォルトのパスワードを変更してください
2. **環境変数**: `.env`ファイルをGit管理から除外してください
3. **ポート公開**: 必要なポートのみを公開してください
4. **HTTPS**: 本番環境ではリバースプロキシ（Nginx等）を使用してHTTPSを有効にしてください

## トラブルシューティング

### ポートが既に使用されている

```powershell
# ポート使用状況の確認
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :5432

# プロセスの終了（PIDを指定）
taskkill /PID <PID> /F
```

### データベースの接続エラー

```powershell
# データベースコンテナのログ確認
docker-compose logs database

# データベースの再起動
docker-compose restart database

# データベースへの接続テスト
docker-compose exec database psql -U postgres -d rental_machine_db -c "SELECT 1;"
```

### フロントエンドがビルドできない

```powershell
# node_modulesを削除して再ビルド
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
```

### バックエンドがビルドできない

```powershell
# ビルドキャッシュをクリア
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
```

## よくある質問

### Q: データベースのデータをリセットしたい
```powershell
docker-compose down -v
docker-compose up -d
```

### Q: 特定のサービスだけを再起動したい
```powershell
docker-compose restart backend
```

### Q: コンテナ内でコマンドを実行したい
```powershell
# フロントエンドコンテナ内でnpmコマンドを実行
docker-compose exec frontend npm install

# バックエンドコンテナ内でdotnetコマンドを実行
docker-compose exec backend dotnet --version
```

### Q: ログファイルが大きくなりすぎた
```powershell
# ログをクリア
docker-compose down
docker system prune -a
docker-compose up -d
```

## まとめ

このDocker Compose構成により、開発環境を簡単に構築・管理できます。問題が発生した場合は、このドキュメントのトラブルシューティングセクションを参照してください。

## 関連ドキュメント

- [データベース設計書](database/README.md)
- [Copilot Instructions](.github/copilot-instructions.md)
- [データベース設計](.github/docs/database-design.md)
