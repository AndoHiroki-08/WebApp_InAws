# Rental Machine App - Technical Documentation

## 📋 ドキュメント一覧

本ディレクトリには、Rental Machine App (Web) の技術ドキュメントがまとめられています。

---

## 📊 プロジェクト管理

### [実装進捗チェックシート](./PROGRESS.md)
プロジェクトの実装状況を追跡するための包括的なチェックシートです。

**内容**:
- 技術スタック、プロジェクト構造、コンポーネントの実装状況
- バックエンド、データベース、主要機能の進捗
- 優先度別タスクリスト
- 進捗サマリーと次のステップ

### [タスク一覧](./TASKS.md)
PROGRESS.mdから自動生成されたタスク一覧です（191個のタスク）。

**内容**:
- 優先度別タスク一覧（最優先・高・中・低）
- セクション別タスク一覧
- 統計情報と進捗率
- 依存関係の表示

### [ガントチャート](./GANTT.md)
タスクのスケジュールを可視化したMermaidガントチャートです。

**内容**:
- フェーズ別ガントチャート（6フェーズ構成）
- 優先度別ガントチャート
- マイルストーン表示
- タスクの依存関係

**更新方法**:
```bash
cd .github/scripts
node generate_tasks.js
```

---

## 📚 コアドキュメント

### 1. [アーキテクチャ設計書](./architecture.md)
システム全体のアーキテクチャ、技術スタック、ディレクトリ構造、レイヤー構成を解説しています。

**内容**:
- システム概要と目的
- 技術スタックの選定理由
- フロントエンド・バックエンドの構成
- データフローとレイヤー構成

---

### 2. [認証・権限管理設計書](./auth-design.md)
認証フローとユーザーロール、権限チェックの詳細設計です。

**内容**:
- 認証フローの詳細
- 管理者と一般ユーザーの権限
- ルートガード実装
- セキュリティ考慮事項

---

### 3. [画面遷移・ルーティング設計書](./routing-design.md)
Next.js App Router を使用した画面遷移とルーティングの設計です。

**内容**:
- ルートグループ構成
- 画面一覧と詳細仕様
- Server Components と Client Components の分離
- ナビゲーション設計

---

### 4. [API設計書](./api-design.md)
バックエンド API のエンドポイント仕様とデータフォーマットです。

**内容**:
- 共通仕様（リクエスト/レスポンス形式）
- 認証・機器・ユーザー・貸出の各API仕様
- エラーハンドリング
- ページネーション

---

### 5. [データベース設計書](./database-design.md)
PostgreSQL のテーブル設計とER図、インデックス設計です。

**内容**:
- テーブル定義（MST_DEVICE, MST_USER, TRN_RENTAL）
- ER図とリレーション
- インデックス設計
- 制約・トリガー
- バックアップ・リストア手順

---

### 6. [状態管理設計書](./state-management.md)
Zustand と React Query を使用した状態管理の詳細設計です。

**内容**:
- Zustand ストアの実装（authStore, onlineStore）
- React Query の使用パターン
- データフロー
- ベストプラクティス

---

## 🎯 機能別ドキュメント

### [features/machines.md](./features/machines.md)
機器管理機能の詳細設計

**内容**:
- 画面仕様（一覧・詳細・新規登録・編集）
- API仕様
- ビジネスルール
- バリデーション

---

### [features/users.md](./features/users.md)
ユーザー管理機能の詳細設計

**内容**:
- 画面仕様（一覧・詳細・新規登録・編集）
- API仕様
- ビジネスルール
- バリデーション

---

### [features/rentals.md](./features/rentals.md)
貸出管理機能の詳細設計

**内容**:
- 画面仕様（一覧・貸出・返却・履歴）
- API仕様
- ビジネスルール
- バリデーション

---

## 🚀 クイックスタート

### 1. プロジェクト概要を理解する
まず [アーキテクチャ設計書](./architecture.md) を読んで、システム全体の構成を把握してください。

### 2. 開発環境のセットアップ

#### フロントエンド
```bash
cd web_frontend
pnpm install
pnpm dev
```

#### バックエンド
```bash
cd web_backend
dotnet restore
dotnet run
```

#### データベース
[データベース設計書](./database-design.md) の「データ移行・初期化スクリプト」セクションを参照してください。

### 3. 認証の実装
[認証・権限管理設計書](./auth-design.md) を参照し、ログイン機能を実装してください。

### 4. 機能の実装
[features/](./features/) ディレクトリ内の各ドキュメントを参照し、機能を実装してください。

---

## 📖 読み進め方

### 新規参加メンバー向け
1. [アーキテクチャ設計書](./architecture.md) → システム全体像
2. [認証・権限管理設計書](./auth-design.md) → 認証の仕組み
3. [画面遷移・ルーティング設計書](./routing-design.md) → 画面構成
4. [データベース設計書](./database-design.md) → データモデル
5. [features/](./features/) → 各機能の詳細

### フロントエンド開発者向け
1. [アーキテクチャ設計書](./architecture.md) → ディレクトリ構造
2. [画面遷移・ルーティング設計書](./routing-design.md) → ルーティング
3. [状態管理設計書](./state-management.md) → Zustand, React Query
4. [API設計書](./api-design.md) → バックエンドとの通信

### バックエンド開発者向け
1. [アーキテクチャ設計書](./architecture.md) → レイヤー構成
2. [データベース設計書](./database-design.md) → テーブル設計
3. [API設計書](./api-design.md) → エンドポイント仕様
4. [features/](./features/) → ビジネスロジック

---

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 15.5.5**: React フレームワーク（App Router）
- **React 19.1.0**: UI ライブラリ
- **Material-UI (MUI)**: UI コンポーネント
- **Zustand**: グローバル状態管理
- **React Query (TanStack Query)**: サーバー状態管理
- **React Hook Form**: フォーム管理
- **Zod**: スキーマ検証

### バックエンド
- **ASP.NET Core 9.0**: Web API フレームワーク
- **Entity Framework Core**: ORM
- **PostgreSQL**: データベース

### インフラ
- **Docker**: コンテナ化
- **AWS**: ホスティング（予定）

---

## 📝 ドキュメント更新ルール

### 更新タイミング
- 新機能追加時
- 設計変更時
- 技術スタック変更時
- バグ修正時（設計に影響がある場合）

### 更新手順
1. 該当するドキュメントを編集
2. 変更内容をコミットメッセージに記載
3. プルリクエストで変更内容をレビュー
4. マージ後、チームに共有

### コミットメッセージ例
```
docs: [アーキテクチャ] PWA機能の追加に伴う設計書更新

- アーキテクチャ設計書にPWA機能の説明を追加
- Service Worker の役割を明記
```

---

## 🔗 関連リンク

### 外部ドキュメント
- [Next.js 公式ドキュメント](https://nextjs.org/docs)
- [React 公式ドキュメント](https://react.dev/)
- [Material-UI 公式ドキュメント](https://mui.com/)
- [Zustand 公式ドキュメント](https://zustand-demo.pmnd.rs/)
- [React Query 公式ドキュメント](https://tanstack.com/query/latest)
- [ASP.NET Core 公式ドキュメント](https://learn.microsoft.com/ja-jp/aspnet/core/)
- [PostgreSQL 公式ドキュメント](https://www.postgresql.org/docs/)

### プロジェクトリポジトリ
- [GitHub リポジトリ](https://github.com/your-org/rental-machine-app)
- [Issue Tracker](https://github.com/your-org/rental-machine-app/issues)
- [Project Board](https://github.com/your-org/rental-machine-app/projects)

---


**最終更新日**: 2025年11月17日
