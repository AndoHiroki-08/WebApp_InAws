# 実装ガントチャート

最終更新: 2025-11-20

## 概要

PROGRESS.mdから抽出したタスクをガントチャート形式で可視化しています。

### 統計情報

- **総タスク数**: 191
- **完了**: 47 (25%)
- **残り**: 144

---

## フェーズ別ガントチャート（推奨）

実装をフェーズに分けて可視化しています。各フェーズの完了マイルストーンも表示されます。

```mermaid
gantt
    title Rental Machine App 実装ガントチャート
    dateFormat YYYY-MM-DD
    axisFormat %m/%d
    todayMarker off

    section フェーズ1: 基盤構築
    Zustand (インストール済みだが、実装状況を確認中) :active, TASK-004, 2025-11-20, 14d
    React Query (TanStack Query) - 未インストール :active, TASK-005, 2025-11-23, 14d
    Zod - 未インストール :active, TASK-008, 2025-11-26, 14d
    React Hook Form - 未インストール :active, TASK-009, 2025-11-29, 14d
    Fetch API + React Query (React Query未実装) :active, TASK-010, 2025-12-02, 14d
    フェーズ1: 基盤構築完了 :milestone, M1, 2025-12-05, 1d

    section フェーズ2: バックエンド開発
    `MachinesController.cs` - 機器管理API (未作成) :active, TASK-079, 2025-12-12, 28d, after TASK-102
    `RentalsController.cs` - 貸出管理API (未作成) :active, TASK-080, 2025-12-18, 28d, after TASK-102
    `UsersController.cs` - ユーザー管理API (未作成) :active, TASK-081, 2025-12-24, 28d, after TASK-102
    `Machine.cs` - 機器モデル (未作成) :active, TASK-082, 2025-12-30, 28d, after TASK-102
    `Rental.cs` - 貸出モデル (未作成) :active, TASK-083, 2026-01-05, 28d, after TASK-102
    フェーズ2: バックエンド開発完了 :milestone, M2, 2026-01-11, 1d

    section フェーズ3: フロントエンド開発
    `LoginForm.jsx` - ログインフォーム (未作成) :active, TASK-047, 2026-01-18, 21d, after TASK-004, TASK-028
    `MachineList.jsx` - 機器一覧 (未作成) :active, TASK-050, 2026-01-23, 21d, after TASK-004, TASK-028
    `MachineForm.jsx` - 機器フォーム (未作成) :active, TASK-051, 2026-01-28, 21d, after TASK-004, TASK-028
    `MachineCard.jsx` - スマホ用カード (未作成) :active, TASK-052, 2026-02-02, 21d, after TASK-004, TASK-028
    `RentalList.jsx` - 貸出一覧 (未作成) :active, TASK-053, 2026-02-07, 21d, after TASK-004, TASK-028
    フェーズ3: フロントエンド開発完了 :milestone, M3, 2026-02-12, 1d

    section フェーズ4: 機能実装
    ログイン機能 :active, TASK-106, 2026-02-19, 42d, after TASK-047, TASK-079
    管理者権限判定 :active, TASK-107, 2026-02-28, 42d, after TASK-047, TASK-079
    認証状態の永続化 (Zustand persist) :active, TASK-108, 2026-03-09, 42d, after TASK-047, TASK-079
    認証ガード :active, TASK-109, 2026-03-18, 42d, after TASK-047, TASK-079
    機器一覧表示 :active, TASK-110, 2026-03-27, 42d, after TASK-047, TASK-079
    フェーズ4: 機能実装完了 :milestone, M4, 2026-04-05, 1d

    section フェーズ5: 品質向上
    関数コンポーネントのみ使用 :active, TASK-156, 2026-04-12, 7d
    hooks ルールの遵守 :active, TASK-157, 2026-04-14, 7d
    useEffect 依存配列の正確な指定 :active, TASK-158, 2026-04-16, 7d
    key prop の適切な使用 :active, TASK-159, 2026-04-18, 7d
    Single Responsibility 原則 :active, TASK-160, 2026-04-20, 7d
    フェーズ5: 品質向上完了 :milestone, M5, 2026-04-22, 1d

    section フェーズ6: デプロイ準備
    Docker設定 (Dockerfile存在) :active, TASK-180, 2026-04-29, 7d
    Docker Compose設定 :active, TASK-181, 2026-05-01, 7d
    CI/CDパイプライン :active, TASK-182, 2026-05-03, 7d
    AWS設定 :active, TASK-183, 2026-05-05, 7d
    環境変数管理 :active, TASK-184, 2026-05-07, 7d
    フェーズ6: デプロイ準備完了 :milestone, M6, 2026-05-09, 1d
```


---

## 優先度別ガントチャート

未完了タスクを優先度別に並べています。

```mermaid
gantt
    title Rental Machine App 実装ガントチャート
    dateFormat YYYY-MM-DD
    axisFormat %m/%d
    todayMarker off

    section 最優先
    Zustand (インストール済みだが、実装状況を確認中) :active, TASK-004, 2025-11-20, 14d
    React Query (TanStack Query) - 未インストール :active, TASK-005, 2025-11-21, 14d
    Zod - 未インストール :active, TASK-008, 2025-11-22, 14d
    React Hook Form - 未インストール :active, TASK-009, 2025-11-23, 14d
    Fetch API + React Query (React Query未実装) :active, TASK-010, 2025-11-24, 14d
    ESLint (設定済み) :active, TASK-011, 2025-11-25, 14d
    Prettier - 未確認 :active, TASK-012, 2025-11-26, 14d
    Controllers (未作成) :active, TASK-014, 2025-11-27, 14d
    Models (未作成) :active, TASK-015, 2025-11-28, 14d
    Services (未作成) :active, TASK-016, 2025-11-29, 14d

    section 高優先度
    `app/(main)/machines/[asset_no]/page.jsx` - [id]から :active, TASK-028, 2025-11-30, 7d
    `app/(main)/machines/actions.jsx` - Server Actions :active, TASK-030, 2025-12-01, 7d
    `app/(main)/rentals/[asset_no]/page.jsx` - [id]から[ :active, TASK-034, 2025-12-02, 7d
    `app/(main)/rentals/actions.jsx` - Server Actions  :active, TASK-037, 2025-12-03, 7d
    `app/(main)/users/[employee_no]/page.jsx` - [id]から :active, TASK-041, 2025-12-04, 7d
    `app/(main)/users/actions.jsx` - Server Actions (未 :active, TASK-043, 2025-12-05, 7d
    `app/ThemeRegistry.jsx` - MUIテーマ設定 (components/The :active, TASK-046, 2025-12-06, 7d
    `LoginForm.jsx` - ログインフォーム (未作成) :active, TASK-047, 2025-12-07, 21d, after TASK-004, TASK-028
    `MachineList.jsx` - 機器一覧 (未作成) :active, TASK-050, 2025-12-08, 21d, after TASK-004, TASK-028
    `MachineForm.jsx` - 機器フォーム (未作成) :active, TASK-051, 2025-12-09, 21d, after TASK-004, TASK-028

    section 中優先度
    起動時のブラウザ/アプリ判定 :active, TASK-145, 2025-12-10, 14d
    ホーム画面 (認証不要) :active, TASK-146, 2025-12-11, 14d
    ログイン画面 :active, TASK-147, 2025-12-12, 14d
    メニュー/ダッシュボード :active, TASK-148, 2025-12-13, 14d
    管理者向けメニュー :active, TASK-149, 2025-12-14, 14d
    一般ユーザー向けメニュー :active, TASK-150, 2025-12-15, 14d
    貸出状況表示 :active, TASK-151, 2025-12-16, 14d
    機器管理画面への遷移 :active, TASK-152, 2025-12-17, 14d
    ユーザー管理画面への遷移 :active, TASK-153, 2025-12-18, 14d
    貸出管理画面への遷移 :active, TASK-154, 2025-12-19, 14d

    section 低優先度
    関数コンポーネントのみ使用 :active, TASK-156, 2025-12-20, 7d
    hooks ルールの遵守 :active, TASK-157, 2025-12-21, 7d
    useEffect 依存配列の正確な指定 :active, TASK-158, 2025-12-22, 7d
    key prop の適切な使用 :active, TASK-159, 2025-12-23, 7d
    Single Responsibility 原則 :active, TASK-160, 2025-12-24, 7d
    Props の型定義 (JSDocまたはPropTypes) :active, TASK-161, 2025-12-25, 7d
    Named export の使用 :active, TASK-162, 2025-12-26, 7d
    Composition Pattern の活用 :active, TASK-163, 2025-12-27, 7d
    MUI sx prop の使用 :active, TASK-164, 2025-12-28, 7d
    MUI styled API の使用 :active, TASK-165, 2025-12-29, 7d
```


---

## ガントチャートの見方

### 凡例

- **緑色のバー**: 完了済みタスク
- **青色のバー**: 未完了タスク（進行中）
- **マイルストーン**: 各フェーズの完了地点

### フェーズの説明

1. **フェーズ1: 基盤構築**
   - 技術スタックのセットアップ
   - プロジェクト構造の整備
   - データベース設計

2. **フェーズ2: バックエンド開発**
   - Models, DTOs, Repositories, Services, Controllers の実装

3. **フェーズ3: フロントエンド開発**
   - コンポーネントの実装
   - ライブラリ・ユーティリティの整備

4. **フェーズ4: 機能実装**
   - 主要機能（機器管理、ユーザー管理、貸出管理）の実装
   - 画面遷移の実装

5. **フェーズ5: 品質向上**
   - テストの実装
   - コーディング規約の適用

6. **フェーズ6: デプロイ準備**
   - インフラ設定
   - ドキュメント整備

---

## タスクの詳細

各タスクの詳細情報は[TASKS.md](./TASKS.md)を参照してください。

---

## 更新方法

PROGRESS.mdのチェックリストを更新した後、以下のコマンドで再生成:

```bash
cd .github/scripts
node generate_tasks.js
```

---

*このファイルは自動生成されました。手動で編集しないでください。*
*更新する場合は、PROGRESS.mdを編集してからスクリプトを実行してください。*
