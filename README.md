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

### 前提条件
- Node.js 18+ / pnpm
- .NET 9.0 SDK
- PostgreSQL

### フロントエンド

```bash
cd web_frontend
pnpm install
pnpm dev
```

http://localhost:3000 でアプリケーションが起動します。

### バックエンド

```bash
cd web_backend
dotnet restore
dotnet run
```

http://localhost:5023 でAPIが起動します。

### データベース

詳細は [データベース設計書](./.github/docs/database-design.md) を参照してください。

## 📚 ドキュメント

詳細なドキュメントは [.github/docs/](./.github/docs/) ディレクトリにあります。

- [アーキテクチャ設計書](./.github/docs/architecture.md)
- [API設計書](./.github/docs/api-design.md)
- [データベース設計書](./.github/docs/database-design.md)
- [画面遷移・ルーティング設計書](./.github/docs/routing-design.md)

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
├── web_frontend/          # Next.js フロントエンド
│   ├── src/
│   │   ├── app/          # App Router ページ
│   │   ├── components/   # Reactコンポーネント
│   │   └── lib/          # ユーティリティ・API・ストア
│   └── public/           # 静的ファイル
│
├── web_backend/          # ASP.NET Core バックエンド
│   ├── Controllers/      # APIエンドポイント
│   ├── Services/         # ビジネスロジック
│   ├── Repositories/     # データアクセス層
│   ├── Models/           # エンティティ
│   └── DTOs/             # データ転送オブジェクト
│
└── .github/
    └── docs/             # 技術ドキュメント
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
