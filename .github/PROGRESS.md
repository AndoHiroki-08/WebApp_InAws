# Rental Machine App (Web) - 実装進捗チェックシート

最終更新日: 2025-11-20

## 概要
このドキュメントは、`.github/copilot-instructions.md`に記載された仕様に基づいて、現在の実装状況を追跡するためのチェックシートです。

---

## 1. 技術スタック実装状況

### フロントエンド
- [x] React 19.1.0
- [x] Next.js 15.5.5
- [x] パッケージマネージャー (npm)
- [ ] Zustand (インストール済みだが、実装状況を確認中)
- [ ] React Query (TanStack Query) - 未インストール
- [x] Next.js App Router
- [x] MUI (Material-UI) - @mui/material, @emotion
- [ ] Zod - 未インストール
- [ ] React Hook Form - 未インストール
- [ ] Fetch API + React Query (React Query未実装)
- [ ] ESLint (設定済み)
- [ ] Prettier - 未確認

### バックエンド
- [x] ASP.NET Core Web API (Program.cs存在)
- [ ] Controllers (未作成)
- [ ] Models (未作成)
- [ ] Services (未作成)
- [ ] DTOs (未作成)
- [ ] Repositories (未作成)
- [ ] PostgreSQL接続設定 (未確認)

---

## 2. プロジェクト構造実装状況

### フロントエンド (src/app/)

#### 認証不要グループ (public)
- [x] `app/(public)/layout.jsx` - 存在
- [x] `app/(public)/page.jsx` - 存在（ホーム画面）

#### 認証グループ (auth)
- [x] `app/(auth)/layout.jsx` - 存在
- [x] `app/(auth)/login/page.jsx` - 存在
- [x] `app/(auth)/menu/page.jsx` - 存在

#### 認証必須グループ (main)
- [x] `app/(main)/layout.jsx` - 存在

##### 機器管理 (machines)
- [x] `app/(main)/machines/page.jsx` - 一覧ページ
- [x] `app/(main)/machines/[id]/page.jsx` - 詳細/編集ページ
- [ ] `app/(main)/machines/[asset_no]/page.jsx` - [id]から[asset_no]への変更が必要
- [x] `app/(main)/machines/new/page.jsx` - 新規登録ページ
- [ ] `app/(main)/machines/actions.jsx` - Server Actions (未作成)
- [x] `app/(main)/machines/loading.jsx` - ローディング

##### 貸出管理 (rentals)
- [x] `app/(main)/rentals/page.jsx` - 一覧ページ
- [x] `app/(main)/rentals/[id]/page.jsx` - 詳細ページ
- [ ] `app/(main)/rentals/[asset_no]/page.jsx` - [id]から[asset_no]への変更が必要
- [x] `app/(main)/rentals/new/page.jsx` - 新規登録（設計変更により廃止予定）
- [x] `app/(main)/rentals/history/page.jsx` - 貸出履歴
- [ ] `app/(main)/rentals/actions.jsx` - Server Actions (未作成)
- [x] `app/(main)/rentals/loading.jsx` - ローディング

##### ユーザー管理 (users)
- [x] `app/(main)/users/page.jsx` - 一覧ページ
- [x] `app/(main)/users/[id]/page.jsx` - 詳細/編集ページ
- [ ] `app/(main)/users/[employee_no]/page.jsx` - [id]から[employee_no]への変更が必要
- [x] `app/(main)/users/new/page.jsx` - 新規登録ページ
- [ ] `app/(main)/users/actions.jsx` - Server Actions (未作成)
- [x] `app/(main)/users/loading.jsx` - ローディング

#### ルートレイアウト
- [x] `app/layout.js` - ルートレイアウト
- [ ] `app/ThemeRegistry.jsx` - MUIテーマ設定 (components/ThemeRegistry/として存在)

---

## 3. コンポーネント実装状況

### 認証関連 (components/auth/)
- [ ] `LoginForm.jsx` - ログインフォーム (未作成)

### 共通コンポーネント (components/common/)
- [x] `Header.jsx` - 共通ヘッダー
- [x] `Sidebar.jsx` - 共通サイドバー

### 機器管理 (components/machines/)
- [ ] `MachineList.jsx` - 機器一覧 (未作成)
- [ ] `MachineForm.jsx` - 機器フォーム (未作成)
- [ ] `MachineCard.jsx` - スマホ用カード (未作成)

### 貸出管理 (components/rentals/)
- [ ] `RentalList.jsx` - 貸出一覧 (未作成)
- [ ] `RentalForm.jsx` - 貸出/返却フォーム (未作成)
- [ ] `RentalCard.jsx` - スマホ用カード (未作成)
- [ ] `RentalHistoryList.jsx` - 貸出履歴一覧 (未作成)

### ユーザー管理 (components/users/)
- [ ] `UserList.jsx` - ユーザー一覧 (未作成)
- [ ] `UserForm.jsx` - ユーザーフォーム (未作成)
- [ ] `UserCard.jsx` - スマホ用カード (未作成)

### UIコンポーネント (components/ui/)
- [x] `Loading.jsx` - ローディング表示
- [x] `ErrorDisplay.jsx` - エラー表示
- [x] `StyledButton.jsx` - スタイル付きボタン
- [x] `StyledCard.jsx` - スタイル付きカード
- [x] `StyledInput.jsx` - スタイル付き入力
- [x] `StyledModal.jsx` - スタイル付きモーダル
- [ ] `ConfirmDialog.jsx` - 確認ダイアログ (未作成)
- [ ] `UserSelectDialog.jsx` - ユーザー選択ダイアログ (未作成)

### テーマ (components/ThemeRegistry/)
- [x] `ThemeRegistry.js` - MUIテーマ設定
- [x] `theme.js` - テーマ定義

---

## 4. ライブラリ・ユーティリティ実装状況

### API通信 (lib/api/)
- [x] `client.js` - API通信クライアント
- [x] `machinesApi.js` - 機器API
- [x] `rentalsApi.js` - 貸出API
- [x] `usersApi.js` - ユーザーAPI

### カスタムフック (lib/hooks/)
- [x] `useAuth.js` - 認証フック

### 状態管理 (lib/stores/)
- [x] `authStore.js` - 認証ストア (Zustand)
- [x] `onlineStore.js` - オンライン状態ストア

### ユーティリティ (lib/utils/)
- [x] `formatDate.js` - 日付フォーマット
- [x] `platformUtils.js` - プラットフォーム判定

---

## 5. バックエンド実装状況

### Controllers
- [ ] `MachinesController.cs` - 機器管理API (未作成)
- [ ] `RentalsController.cs` - 貸出管理API (未作成)
- [ ] `UsersController.cs` - ユーザー管理API (未作成)

### Models
- [ ] `Machine.cs` - 機器モデル (未作成)
- [ ] `Rental.cs` - 貸出モデル (未作成)
- [ ] `User.cs` - ユーザーモデル (未作成)

### Services
- [ ] `MachineService.cs` - 機器サービス (未作成)
- [ ] `RentalService.cs` - 貸出サービス (未作成)
- [ ] `UserService.cs` - ユーザーサービス (未作成)

### DTOs
- [ ] `MachineListDTO.cs` - 機器一覧DTO (未作成)
- [ ] `MachineDetailDTO.cs` - 機器詳細DTO (未作成)
- [ ] `MachineHistoryDTO.cs` - 機器履歴DTO (未作成)
- [ ] `RentalListDTO.cs` - 貸出一覧DTO (未作成)
- [ ] `RentalDetailDTO.cs` - 貸出詳細DTO (未作成)
- [ ] `UserListDTO.cs` - ユーザー一覧DTO (未作成)
- [ ] `UserDetailDTO.cs` - ユーザー詳細DTO (未作成)

### Data Access
- [ ] `ApplicationDbContext.cs` - DBコンテキスト (未作成)
- [ ] `MachineRepository.cs` - 機器リポジトリ (未作成)
- [ ] `IMachineRepository.cs` - 機器リポジトリIF (未作成)
- [ ] `RentalRepository.cs` - 貸出リポジトリ (未作成)
- [ ] `IRentalRepository.cs` - 貸出リポジトリIF (未作成)
- [ ] `UserRepository.cs` - ユーザーリポジトリ (未作成)
- [ ] `IUserRepository.cs` - ユーザーリポジトリIF (未作成)

---

## 6. データベース実装状況

### テーブル
- [ ] `MST_DEVICE` - 機器マスタ (未作成)
- [ ] `device_asset_sequence` - 機器番号シーケンス (未作成)
- [ ] `MST_USER` - ユーザーマスタ (未作成)
- [ ] `TRN_RENTAL` - 貸出トランザクション (未作成)

---

## 7. 主要機能実装状況

### 認証機能
- [ ] ログイン機能
- [ ] 管理者権限判定
- [ ] 認証状態の永続化 (Zustand persist)
- [ ] 認証ガード

### 機器管理機能
- [ ] 機器一覧表示
  - [ ] DataGrid表示 (デスクトップ)
  - [ ] Virtuoso表示 (スマホ)
- [ ] 機器詳細表示
- [ ] 機器新規登録 (管理者のみ)
- [ ] 機器編集 (管理者のみ)
- [ ] 機器削除 (管理者のみ)
- [ ] 機器検索・フィルタリング

### ユーザー管理機能
- [ ] ユーザー一覧表示
  - [ ] DataGrid表示 (デスクトップ)
  - [ ] Virtuoso表示 (スマホ)
- [ ] ユーザー詳細表示
- [ ] ユーザー新規登録 (管理者のみ)
- [ ] ユーザー編集 (管理者のみ)
- [ ] ユーザー削除 (管理者のみ)
- [ ] ユーザーの貸出履歴表示

### 貸出管理機能
- [ ] 貸出一覧表示
  - [ ] DataGrid表示 (デスクトップ)
  - [ ] Virtuoso表示 (スマホ)
- [ ] 貸出詳細表示
- [ ] 貸出処理
- [ ] 返却処理
- [ ] 貸出履歴表示
- [ ] 返却期限リマインダー

### リマインダー機能
- [ ] メニュー画面での貸出状況表示
- [ ] 返却期限間近の通知
- [ ] 返却期限切れの通知

### PWA機能
- [ ] オフライン対応
- [ ] キャッシュ管理
- [ ] プッシュ通知 (オプション)
- [ ] マニフェスト設定

### レスポンシブデザイン
- [ ] デスクトップ対応
- [ ] タブレット対応
- [ ] モバイル対応
- [ ] ブレークポイント設定

---

## 8. 画面遷移実装状況

- [ ] 起動時のブラウザ/アプリ判定
- [ ] ホーム画面 (認証不要)
- [ ] ログイン画面
- [ ] メニュー/ダッシュボード
  - [ ] 管理者向けメニュー
  - [ ] 一般ユーザー向けメニュー
  - [ ] 貸出状況表示
- [ ] 機器管理画面への遷移
- [ ] ユーザー管理画面への遷移
- [ ] 貸出管理画面への遷移
- [ ] 貸出履歴画面への遷移

---

## 9. コーディング規約準拠状況

### React作法
- [ ] 関数コンポーネントのみ使用
- [ ] hooks ルールの遵守
- [ ] useEffect 依存配列の正確な指定
- [ ] key prop の適切な使用

### コンポーネント設計
- [ ] Single Responsibility 原則
- [ ] Props の型定義 (JSDocまたはPropTypes)
- [ ] Named export の使用
- [ ] Composition Pattern の活用

### スタイリング
- [ ] MUI sx prop の使用
- [ ] MUI styled API の使用
- [ ] レスポンシブデザインの実装
- [ ] テーマカスタマイズ

### アクセシビリティ
- [ ] セマンティック HTML の使用
- [ ] aria 属性の適切な使用
- [ ] キーボード操作対応
- [ ] フォーカス管理

### パフォーマンス最適化
- [ ] React.memo の適切な使用
- [ ] useMemo / useCallback の使用
- [ ] Code Splitting の実装
- [ ] 画像最適化

---

## 10. テスト実装状況

- [ ] ユニットテスト
- [ ] 統合テスト
- [ ] E2Eテスト
- [ ] テストカバレッジ目標

---

## 11. デプロイメント・インフラ

- [ ] Docker設定 (Dockerfile存在)
- [ ] Docker Compose設定
- [ ] CI/CDパイプライン
- [ ] AWS設定
- [ ] 環境変数管理

---

## 12. ドキュメント

- [x] README.md
- [x] copilot-instructions.md
- [ ] API仕様書
- [ ] データベース設計書
- [ ] コンポーネント仕様書
- [ ] デプロイ手順書

---

## 優先度別タスク

### 高優先度 (Critical)
1. [ ] React Query (TanStack Query) のインストール
2. [ ] Zod + React Hook Form のインストール
3. [ ] バックエンドのController/Model/Service実装
4. [ ] データベーススキーマの作成
5. [ ] 認証機能の完全実装
6. [ ] 主要コンポーネント (List/Form) の作成

### 中優先度 (High)
1. [ ] [id] -> [asset_no]/[employee_no] への変更
2. [ ] Server Actions の実装
3. [ ] レスポンシブデザインの完全実装
4. [ ] エラーハンドリングの強化

### 低優先度 (Medium)
1. [ ] PWA機能の完全実装
2. [ ] パフォーマンス最適化
3. [ ] テストの実装
4. [ ] ドキュメントの充実

---

## 進捗サマリー

### フロントエンド
- **全体進捗**: 約30%
- **ページ構造**: 70% (基本的な構造は完成、リファクタリング必要)
- **コンポーネント**: 20% (共通UIのみ、機能別コンポーネント未実装)
- **状態管理**: 40% (Zustand設定済み、React Query未実装)
- **API通信**: 50% (API関数は存在、React Queryとの統合必要)

### バックエンド
- **全体進捗**: 約5%
- **プロジェクト構成**: 10% (Program.csのみ)
- **Controllers**: 0%
- **Models**: 0%
- **Services**: 0%
- **Repositories**: 0%

### データベース
- **全体進捗**: 0%
- **スキーマ設計**: 仕様書にはあるが未実装

---

## 次のステップ

1. **依存関係の追加**
   - React Query (@tanstack/react-query)
   - Zod
   - React Hook Form

2. **バックエンドの基盤構築**
   - Models, DTOs, Controllers, Services, Repositories の作成
   - データベース接続設定

3. **コンポーネントの実装**
   - machines, rentals, users 配下のコンポーネント作成

4. **Server Actions の実装**
   - actions.jsx ファイルの作成

5. **ルーティングの修正**
   - [id] -> [asset_no]/[employee_no] への変更

---

## 備考

- このチェックシートは定期的に更新してください
- 新機能追加時は該当セクションにチェック項目を追加してください
- 完了したタスクは `[x]` でマークしてください
- 進捗率は目視での概算です
