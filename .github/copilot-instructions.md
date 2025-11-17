
# Copilot Instructions for Rental Machine App (Web)

## このドキュメントについて

- GitHub Copilot や各種 AI ツールが本リポジトリのコンテキストを理解しやすくするためのガイドです。
- 新しい機能を実装する際はここで示す技術選定・設計方針・モジュール構成を前提にしてください。
- 不確かな点がある場合は、リポジトリのファイルを探索し、ユーザーに「こういうことですか?」と確認をするようにしてください。

## 前提条件

- 回答は必ず日本語でしてください。
- コードの変更をする際、変更量が200行を超える可能性が高い場合は、事前に「この指示では変更量が200行を超える可能性がありますが、実行しますか?」とユーザーに確認をとるようにしてください。
- 何か大きい変更を加える場合、まず何をするのか計画を立てた上で、ユーザーに「このような計画で進めようと思います。」と提案してください。この時、ユーザーから計画の修正を求められた場合は計画を修正して、再提案をしてください。

## アプリ概要

**Rental Machine App (Web)** は、レンタル機器の管理と予約を統合したWebアプリケーションです。

### 主な機能

- **貸出管理**: レンタル可能な機器の一覧表示・詳細情報・貸出・返却
- **ユーザー管理**: ユーザーの登録・編集・削除・一覧表示
- **機器管理**: 機器の登録・編集・削除・一覧表示
- **リマインダー機能**: メニュー画面にユーザーの貸出状況を表示し、返却期限のリマインド
- **レスポンシブデザイン**: デスクトップ・タブレット・モバイルに対応
- **管理者権限**: 管理者ユーザーは機器・ユーザーの追加・編集・削除が可能

## 技術スタック概要

- **言語**: JavaScript
- **フレームワーク**: React 19.1.0
- **ビルドツール**: Next.js 15.5.5
- **パッケージマネージャー**: pnpm (または npm/yarn)
- **状態管理**: Zustand + React Query (TanStack Query)
- **ルーティング**: Next.js App Router
- **UIコンポーネント**: MUI (Material-UI)
- **フォーム管理**: Zod + React Hook Form
- **API通信**: Fetch API + React Query
- **バックエンド**: ASP.NET Core Web API
- **データベース**: PostgreSQL
- **リンター/フォーマッター**: ESLint + Prettier
- **型チェック**: JavaScript strict mode

## プロジェクト構成と役割

本アプリはロジックとコンポーネントの再利用と、コンポーネントの関心の分離を重視したディレクトリ構成を採用しています。

- フロントエンド (Next.js):
```
src/
├── app/
│   │
│   ├── (public)/                 # ★ 認証不要グループ (ホーム画面)
│   │   ├── layout.jsx            # ★ (public)用レイアウト (ヘッダー/フッター)
│   │   └── page.jsx              # ★ ホーム画面 (RSC)
│   │
│   ├── (auth)/                   # 認証グループ
│   │   ├── layout.jsx            # (auth)用レイアウト
│   │   ├── login/
│   │   │   └── page.jsx          # ログインページ (RSC) -> LoginForm (Client) を呼び出す
│   │   └── menu/
│   │       └── page.jsx          # ★ メニュー/ダッシュボード (RSC)
│   │
│   ├── (main)/                   # 認証必須グループ
│   │   ├── layout.jsx            # ★ (main)用レイアウト (認証ガード 'use client')
│   │   │
│   │   ├── machines/
│   │   │   ├── [asset_no]/       # ★ [id] -> [asset_no] に変更
│   │   │   │   └── page.jsx      # 機器詳細/編集 (RSC) -> MachineForm (Client) を呼び出す
│   │   │   ├── new/
│   │   │   │   └── page.jsx      # 機器新規登録 (RSC) -> MachineForm (Client) を呼び出す
│   │   │   ├── page.jsx          # 機器一覧 (RSC) -> MachineList (Client) を呼び出す
│   │   │   └── actions.jsx       # 機器関連の Server Actions ('use server')
│   │   │
│   │   ├── rentals/
│   │   │   ├── [asset_no]/       # ★ [id] -> [asset_no] に変更 (貸出/返却ページ)
│   │   │   │   └── page.jsx      # (RSC) -> RentalForm (Client) を呼び出す
│   │   │   ├── history/
│   │   │   │   └── page.jsx      # 貸出履歴 (RSC) -> RentalHistoryList (Client) を呼び出す
│   │   │   ├── page.jsx          # ★ 貸出管理一覧 (RSC) -> RentalList (Client) を呼び出す
│   │   │   ├── actions.jsx       # レンタル関連の Server Actions ('use server')
│   │   │   └── new/              # ★ この new/ ディレクトリは設計変更により廃止
│   │   │
│   │   └── users/
│   │       ├── [employee_no]/    # ★ [id] -> [employee_no] に変更
│   │       │   └── page.jsx      # ユーザー詳細/編集 (RSC) -> UserForm (Client) を呼び出す
│   │       ├── new/
│   │       │   └── page.jsx      # ユーザー新規登録 (RSC) -> UserForm (Client) を呼び出す
│   │       ├── page.jsx          # ユーザー一覧 (RSC) -> UserList (Client) を呼び出す
│   │       ├── layout.jsx        # (users)グループ専用のレイアウト (※必要に応じて)
│   │       └── actions.jsx       # ユーザー関連の Server Actions ('use server')
│   │
│   ├── layout.jsx                # ★ ルートレイアウト (RSC)
│   └── ThemeRegistry.jsx         # ★ MUIテーマ設定用 ('use client')
│
├── components/                   # ★ 全ての 'use client' コンポーネント
│   │
│   ├── auth/                     # ★
│   │   └── LoginForm.jsx         # ★ ログインフォーム ('use client')
│   │
│   ├── common/
│   │   ├── Header.jsx            # 共通ヘッダー ('use client')
│   │   └── Sidebar.jsx           # ★ 共通サイドバー (MUI Drawer) ('use client')
│   │
│   ├── machines/                 # ★
│   │   ├── MachineList.jsx       # ★ 機器一覧 (DataGrid/Virtuoso切替) ('use client')
│   │   ├── MachineForm.jsx       # ★ 機器フォーム ('use client')
│   │   └── MachineCard.jsx       # ★ 機器一覧のスマホ用カード ('use client')
│   │
│   ├── rentals/                  # ★
│   │   ├── RentalList.jsx        # ★ 貸出一覧 (DataGrid/Virtuoso切替) ('use client')
│   │   ├── RentalForm.jsx        # ★ 貸出/返却フォーム ('use client')
│   │   ├── RentalCard.jsx        # ★ 貸出一覧のスマホ用カード ('use client')
│   │   └── RentalHistoryList.jsx # ★ 貸出履歴一覧 ('use client')
│   │
│   ├── users/                    # ★
│   │   ├── UserList.jsx          # ★ ユーザー一覧 (DataGrid/Virtuoso切替) ('use client')
│   │   ├── UserForm.jsx          # ★ ユーザーフォーム ('use client')
│   │   └── UserCard.jsx          # ★ ユーザー一覧のスマホ用カード ('use client')
│   │
│   └── ui/                       # ★
│       ├── ConfirmDialog.jsx     # ★ グローバル確認ダイアログ ('use client')
│       ├── UserSelectDialog.jsx  # ★ ユーザー選択ダイアログ ('use client')
│       └── LoadingSpinner.jsx    # ★ ローディング表示
│
├── lib/                          # ロジック・メソッド
│   ├── api/                      # API通信ロジック (Server Actions から呼び出される)
│   │   ├── machinesApi.js
│   │   ├── rentalsApi.js
│   │   └── usersApi.js
│   ├── hooks/                    # 共通カスタムフック
│   │   └── useAuth.js            # (※必要に応じて)
│   └── utils/                    # 共通ヘルパー
│       └── formatDate.js
│
├── public/                       # PWA 関連ファイル
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── manifest.json　           # PWA マニフェスト
│
├── stores/                       # ★ Zustand ストア
│   └── authStore.js              # ★ 認証ストア
│
└── next.config.mjs               #　PWA 設定含む  

```
- バックエンド (ASP.NET Core):
```
src/
├── Controllers/
│   ├── MachinesController.cs
│   ├── RentalsController.cs
│   └── UsersController.cs
├── Models/
│   ├── Machine.cs
│   ├── Rental.cs
│   └── User.cs
├── Services/
│   ├── MachineService.cs
│   ├── RentalService.cs
│   └── UserService.cs
├── DTOs/
│   ├── MachineListDTO.cs
│   ├── MachineDetailDTO.cs
│   ├── MachineHistoryDTO.cs
│   ├── RentalListDTO.cs
│   ├── RentalDetailDTO.cs
│   ├── UserListDTO.cs
│   └── UserDetailDTO.cs
├── Data/
│   └── ApplicationDbContext.cs
├── Repositories/
│   ├── MachineRepository.cs
│   ├── IMachineRepository.cs
│   ├── RentalRepository.cs
│   ├── IRentalRepository.cs
│   ├── UserRepository.cs
│   └── IUserRepository.cs
├── appsettings.json
└── Program.cs
```

- データベース: PostgreSQL
```
-- Machines テーブル
CREATE TABLE MST_DEVICE (
    asset_no VARCHAR(20) PRIMARY KEY DEFAULT ('PC-' || LPAD(nextval('device_asset_sequence')::TEXT, 3, '0')), // 自動採番 
    maker VARCHAR(20), // 製造元
    os VARCHAR(20), // OS
    memory VARCHAR(10), // メモリ
    capacity VARCHAR(10), // ストレージ容量
    has_gpu BOOLEAN DEFAULT FALSE, // GPUの有無
    location VARCHAR(30), // 設置場所
    broken_flag BOOLEAN DEFAULT FALSE, // 故障フラグ
    lease_start_date DATE, // リース開始日
    lease_end_date DATE, // リース終了日
    note VARCHAR(100), // 備考
    register_date DATE, // 登録日
    update_date DATE, // 更新日
    inventory_date DATE, // 棚卸日
    delete_flag BOOLEAN DEFAULT FALSE　
);

CREATE SEQUENCE device_asset_sequence // 自動採番用シーケンス
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 999999
    CACHE 1;

-- Users テーブル
CREATE TABLE MST_USER (
    employee_no VARCHAR(20) PRIMARY KEY, // 社員番号
    name VARCHAR(20) NOT NULL, // 名前
    name_kana VARCHAR(20), // 名前（カナ）
    department VARCHAR(20), // 部署
    tel_no VARCHAR(20), // 電話番号
    mail_address VARCHAR(50), // メールアドレス
    age INT, // 年齢
    gender INT, // 性別
    position VARCHAR(20), // 役職
    account_level BOOLEAN DEFAULT FALSE NOT NULL, // アカウントレベル
    retire_date DATE, // 退職日
    register_date DATE NOT NULL, // 登録日
    update_date DATE, // 更新日
    delete_flag BOOLEAN DEFAULT FALSE NOT NULL
);
ALTER TABLE MST_USER ADD CONSTRAINT employees_mail_address_uk UNIQUE (mail_address); // メールアドレスの一意制約

-- Rentals テーブル
CREATE TABLE TRN_RENTAL (
  rental_id SERIAL PRIMARY KEY, // 自動採番
  asset_no VARCHAR(20) NOT NULL, // 機器番号
  employee_no VARCHAR(20) NOT NULL, // 社員番号
  rental_flag BOOLEAN DEFAULT FALSE NOT NULL, // 貸出フラグ
  rental_date DATE NOT NULL,  // 貸出日
  return_due_date DATE, // 返却予定日
  return_date DATE, // 返却日
  note VARCHAR(100),  // 備考
  delete_flag BOOLEAN DEFAULT FALSE NOT NULL, // 削除フラグ
  FOREIGN KEY (asset_no) REFERENCES MST_DEVICE(asset_no),
  FOREIGN KEY (employee_no) REFERENCES MST_USER(employee_no)
);

```
- 画面遷移の流れ
```
1. 起動
2. ブラウザかアプリかを判定し、アプリならログイン画面、ブラウザならホーム画面へ遷移
3. ホーム画面では、認証不要でアプリの概要とログインリンクを表示
4. ログイン画面でユーザの認証と管理者権限の有無を判定し、メニュー画面へ遷移
 - [管理者] 
 　 -5. メニュー画面で機器管理・ユーザー管理・貸出管理へのリンクを表示。貸出期限間近と期限切れの件数を表示し、詳細画面へ遷移可能にする。
    -6. 機器管理画面で機器の一覧表示・詳細表示・新規登録・編集・削除が可能にする。
    -7. ユーザー管理画面でユーザーの一覧表示・詳細表示・新規登録・編集・削除が可能にする。
    -8. ユーザー詳細画面でそのユーザーの貸出履歴の一覧表示が可能にする。
    -9. 貸出管理画面ですべての機器の貸出状況の一覧表示・詳細表示・貸出・返却が可能にする。
    -10. 貸出履歴画面で過去の貸出履歴の一覧表示が可能にする。

 - [一般ユーザー]
 　 -5. メニュー画面で機器管理・貸出管理へのリンクを表示。自身の貸出状況を表示し、詳細画面へ遷移可能にする。
    -6. 機器管理画面で機器の一覧表示・詳細表示が可能にする。
    -7. 貸出管理画面ですべての機器の貸出状況の一覧表示・詳細表示・貸出・返却が可能にする。
    -8. 貸出履歴画面で過去の貸出履歴の一覧表示が可能にする。

```
## アーキテクチャ指針

### コンポーネント設計

- **MUIの使用**:　MUIコンポーネントをベースにカスタムコンポーネントを作成
- **Composition Pattern**: 小さなコンポーネントを組み合わせて複雑な UI を構築
- **サーバーコンポーネント (RSC) と クライアントコンポーネントの分離**: 
  デフォルトはサーバーコンポーネントとし、データ取得や静的な表示を担当させます。
  イベントハンドラ (onClick等) やフック (useState等) が必要なコンポーネントのみ、
  ファイル先頭に 'use client' を記述し、クライアントコンポーネントとします。

### 状態管理の方針

- **オンライン**: ログイン時にサーバーから最新データを取得し、Zustand と React Query で管理
- **オフライン**: PWA 機能を活用し、キャッシュデータを使用。
- **管理情報**: ユーザーの管理権限、オンライン/オフライン状態などを Zustand で管理

### データフロー

1. **UI → Hook**: ユーザーアクションをカスタムフックに通知
2. **Hook → API (React Query)**: API 呼び出しを React Query でラップ
3. **API → Hook → UI**: データを取得し、キャッシュして UI に反映
4. **楽観的更新**: React Query の `onMutate` で即座に UI を更新

## ディレクトリ・ファイル命名規則

### コンポーネント

- **ファイル名**: PascalCase (例: `TaskList.jsx`, `TaskCard.jsx`)
- **ディレクトリ**: ケバブケース (例: `task-list/`, `calendar-view/`)
- **index.ts**: 各ディレクトリに配置し、外部へのエクスポートを集約

### フック

- **ファイル名**: camelCase + `use` プレフィックス (例: `useTaskList.js`, `useAuth.js`)

### ユーティリティ

- **ファイル名**: camelCase (例: `formatDate.js`, `validateEmail.js`)

### 型定義

- **ファイル名**: camelCase または PascalCase (例: `task.types.js`, `Task.js`)
- **型名**: PascalCase (例: `Task`, `User`, `ApiResponse<T>`)

## UI 実装ガイド

### コンポーネント設計原則

- **Single Responsibility**: 1つのコンポーネントは1つの責務のみ
- **Props の型定義**: 全ての props に明示的な型を定義
- **デフォルトエクスポートを避ける**: Named export を使用し、リファクタリングを容易に
- **children パターン**: 柔軟性が必要な場合は `children` を活用

### スタイリング

-**material-UI (MUI)** をベースに使用: MUI のテーマカスタマイズを活用
- **sx prop**: 簡単なスタイルは `sx` propで定義
- **styled API**: 複雑なスタイルやテーマ依存のスタイルには MUI の `styled` API を使用
- **レスポンシブデザイン**: MUI の `useMediaQuery` フックや `sx` prop のブレークポイントを活用

### アクセシビリティ (a11y)

- **セマンティック HTML**: 適切な HTML タグを使用 (`<button>`, `<nav>`, `<main>` 等)
- **aria 属性**: 必要に応じて `aria-label`, `aria-describedby` 等を付与
- **キーボード操作**: すべての操作をキーボードで実行可能に
- **フォーカス管理**: `focus-visible` で適切なフォーカススタイルを適用

### パフォーマンス最適化

- **React.memo**: 不要な再レンダリングを防ぐ
- **useMemo / useCallback**: 高コストな計算や関数の再生成を防ぐ
- **Code Splitting**: React.lazy + Suspense で遅延ロード
- **画像最適化**: WebP 形式、適切なサイズ、lazy loading

## 状態管理の実装ガイド

### Zustand の使い方

```JavaScript
// stores/authStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        logout: () => set({ user: null, isAuthenticated: false }),
      }),
      { name: 'auth-storage' }
    )
  )
);
```

## コーディング規約・ベストプラクティス

### React の作法

- **関数コンポーネント**: クラスコンポーネントは使用しない
- **hooks のルール**: トップレベルでのみ呼び出し、条件分岐内で呼び出さない
- **useEffect の依存配列**: 正確に指定し、不要な再実行を防ぐ
- **key prop**: リストレンダリング時に一意で安定した key を使用


### インポート順序

1. React 関連
2. 外部ライブラリ
3. 内部モジュール (features, shared, lib)
4. 型定義
5. スタイル

```typescript
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { TaskList } from '@/features/task/components';
import { Button } from '@/shared/components/ui';
import { formatDate } from '@/shared/utils';

import type { Task } from '@/features/task/types';

import styles from './Home.module.css';
```

### コメント

- **JSDoc**: 複雑な関数には JSDoc コメントを付与
- **TODO コメント**: 一時的な実装には `// TODO:` を残す
- **コメントアウト**: コンポーネントまたはページスクリプトの役割を説明するコメントを冒頭に記述 5行程度

## アンチパターン

以下のパターンは避けてください。既存コードで発見した場合は、リファクタリングを提案してください。

### コンポーネント設計

- **巨大コンポーネント**: 1つのコンポーネントが200行を超える場合は分割を検討
- **Prop Drilling**: 深い階層での props バケツリレーは、Context や状態管理ライブラリで解決
- **命名の重複**: 同じ名前のコンポーネントや関数が複数存在することを避ける。命名は一意でわかりやすいものにする。

## まとめ

このドキュメントを常に最新に保ち、新しい技術選定や設計変更があった場合は適宜更新してください。


---# Copilot Instructions for Rental Machine App (Web)
