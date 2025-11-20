# レンタル機器管理システム (Rental Machine App)

社内のIT機器（PC、タブレット等）のレンタル管理を効率化するWebアプリケーションです。

## 📱 主な機能

- **機器管理**: IT機器の登録・編集・削除・一覧表示
- **ユーザー管理**: 社員情報の管理と権限制御
- **貸出管理**: 機器の貸出・返却処理
- **リマインダー**: 返却期限の自動通知
- **レスポンシブデザイン**: デスクトップ・タブレット・モバイル対応

## 🛠️ 技術スタック

### フロントエンド
- Next.js 15.5.5 (App Router)
- React 19.1.0
- Material-UI (MUI)
- Zustand (状態管理)
- React Query (サーバー状態管理)

### バックエンド
- ASP.NET Core 9.0
- Entity Framework Core
- PostgreSQL

## 🚀 セットアップ

### 🐳 Docker Compose による起動（推奨）

**最も簡単な方法**: Docker Composeを使用してフロントエンド・バックエンド・データベースを一括起動

#### クイックスタート

```powershell
# クイックスタートスクリプトを実行
.\docker-start.ps1
```

または

```powershell
# Docker Composeで起動
docker-compose up -d --build
```

#### アクセス
- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:5000
- **データベース**: localhost:5432

#### ログ表示
```powershell
# 全サービスのログ
.\docker-logs.ps1

# 特定のサービスのログ
.\docker-logs.ps1 -Service frontend
```

#### 停止
```powershell
# 停止スクリプトを実行
.\docker-stop.ps1

# または直接停止
docker-compose down
```

詳細は [Docker セットアップガイド](./README_DOCKER.md) を参照してください。

---

### 📦 個別起動

個別にサービスを起動する場合は以下の手順に従ってください。

#### 前提条件
- Node.js 22+ / npm (または pnpm)
- .NET 9.0 SDK
- PostgreSQL 16+

#### データベース

```powershell
# PostgreSQLに接続してスクリプトを実行
psql -U postgres -f database/01_create_tables.sql
psql -U postgres -f database/02_insert_sample_data.sql
```

#### フロントエンド

```bash
cd web_frontend
npm install
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

#### バックエンド

```bash
cd web_backend
dotnet restore
dotnet run
```

http://localhost:5000 でAPIが起動します。

---

## 📚 ドキュメント

- **[Docker セットアップガイド](./README_DOCKER.md)** - Docker Composeによる環境構築（推奨）
- **[データベース設計書](./.github/docs/database-design.md)** - DB構造とサンプルデータ

## 🔐 開発用ログイン

**管理者権限**
- 社員番号: `admin`
- パスワード: 任意の文字列

**一般ユーザー**
- 社員番号: `user`
- パスワード: 任意の文字列

## 📝 プロジェクト構成

```
WebApp_InAws/
├── docker-compose.yml              # Docker Compose設定（開発環境）
├── docker-compose.prod.yml         # Docker Compose設定（本番環境）
├── docker-start.ps1                # クイックスタートスクリプト
├── docker-stop.ps1                 # 停止スクリプト
├── docker-logs.ps1                 # ログ表示スクリプト
├── .env.example                    # 環境変数サンプル
│
├── database/                       # データベース関連
│   ├── 01_create_tables.sql       # テーブル作成SQL
│   ├── 02_insert_sample_data.sql  # サンプルデータ（30件×3テーブル）
│   └── README.md                   # データベースセットアップガイド
│
├── web_frontend/          # Next.js フロントエンド
│   ├── Dockerfile                  # 開発環境用
│   ├── Dockerfile.prod             # 本番環境用
│   ├── src/
│   │   ├── app/          # App Router ページ
│   │   ├── components/   # Reactコンポーネント
│   │   └── lib/          # ユーティリティ・API・ストア
│   └── public/           # 静的ファイル
│
├── web_backend/          # ASP.NET Core バックエンド
│   ├── Dockerfile                  # ASP.NET Core用
│   ├── Controllers/      # APIエンドポイント
│   ├── Services/         # ビジネスロジック
│   ├── Repositories/     # データアクセス層
│   ├── Models/           # エンティティ
│   └── DTOs/             # データ転送オブジェクト
│
└── .github/
    ├── copilot-instructions.md     # AI開発ガイドライン
    └── docs/             # 技術ドキュメント
        ├── database-design.md      # データベース設計
        └── ...
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは社内利用を目的としています。

## 👥 開発者

- 開発チーム

---

**最終更新日**: 2025年11月18日
