# アーキテクチャ設計書

## 目次
- [システム概要](#システム概要)
- [技術スタック](#技術スタック)
- [システム構成](#システム構成)
- [ディレクトリ構造](#ディレクトリ構造)
- [レイヤー構成](#レイヤー構成)

---

## システム概要

**Rental Machine App (Web)** は、レンタル機器の管理と予約を統合したWebアプリケーションです。

### 目的
- 社内のレンタル機器（PC等）の効率的な管理
- ユーザーによる機器の貸出・返却のセルフサービス化
- 管理者による機器・ユーザー情報の一元管理
- 返却期限のリマインダー機能による延滞防止

### 主要機能
1. **機器管理**: 機器の登録・編集・削除・一覧表示・詳細表示
2. **ユーザー管理**: ユーザーの登録・編集・削除・一覧表示・詳細表示
3. **貸出管理**: 機器の貸出・返却・履歴管理・ステータス確認
4. **認証・認可**: ユーザーログイン・権限による機能制限
5. **リマインダー**: 返却期限のアラート表示

---

## 技術スタック

### フロントエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 15.5.5 | React フレームワーク（App Router使用） |
| React | 19.1.0 | UI ライブラリ |
| Material-UI (MUI) | 最新 | UI コンポーネントライブラリ |
| Zustand | 最新 | グローバル状態管理（認証、オンライン状態） |
| React Query (TanStack Query) | 最新 | サーバー状態管理、キャッシング |
| React Hook Form | 最新 | フォーム状態管理 |
| Zod | 最新 | スキーマ検証 |
| pnpm | 最新 | パッケージマネージャー |

### バックエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| ASP.NET Core | 9.0 | Web API フレームワーク |
| Entity Framework Core | 最新 | ORM |
| PostgreSQL | 最新 | データベース |

### インフラ
- **コンテナ**: Docker
- **ホスティング**: AWS (予定)
- **CI/CD**: GitHub Actions (予定)

---

## システム構成

```
┌─────────────┐
│   Browser   │ ← PWA対応
│  (Client)   │
└──────┬──────┘
       │ HTTPS
       ↓
┌─────────────────────┐
│   Next.js Frontend  │
│   (React App)       │
│  - App Router       │
│  - RSC/Client Mix   │
└──────┬──────────────┘
       │ REST API
       ↓
┌─────────────────────┐
│  ASP.NET Core API   │
│  - Controllers      │
│  - Services         │
│  - Repositories     │
└──────┬──────────────┘
       │ SQL
       ↓
┌─────────────────────┐
│    PostgreSQL       │
│   - MST_DEVICE      │
│   - MST_USER        │
│   - TRN_RENTAL      │
└─────────────────────┘
```

---

## ディレクトリ構造

### フロントエンド (web_frontend/)

```
src/
├── app/                          # Next.js App Router
│   ├── layout.js                 # ルートレイアウト (RSC)
│   ├── page.js                   # ルートページ
│   │
│   ├── (public)/                 # 認証不要グループ
│   │   ├── layout.jsx            # 公開ページ用レイアウト
│   │   └── page.jsx              # ホーム画面
│   │
│   ├── (auth)/                   # 認証関連グループ
│   │   ├── layout.jsx            # 認証ページ用レイアウト
│   │   ├── login/                # ログインページ
│   │   │   └── page.jsx
│   │   └── menu/                 # メニュー/ダッシュボード
│   │       └── page.jsx
│   │
│   └── (main)/                   # 認証必須グループ
│       ├── layout.jsx            # メインコンテンツ用レイアウト
│       ├── machines/             # 機器管理
│       │   ├── page.jsx          # 一覧
│       │   ├── [asset_no]/       # 詳細・編集
│       │   │   └── page.jsx
│       │   └── new/              # 新規登録
│       │       └── page.jsx
│       ├── users/                # ユーザー管理
│       │   ├── page.jsx
│       │   ├── [employee_no]/
│       │   │   └── page.jsx
│       │   └── new/
│       │       └── page.jsx
│       └── rentals/              # 貸出管理
│           ├── page.jsx          # 一覧
│           ├── [asset_no]/       # 貸出・返却
│           │   └── page.jsx
│           └── history/          # 履歴
│               └── page.jsx
│
├── components/                   # React コンポーネント
│   ├── common/                   # 共通コンポーネント
│   │   ├── Header.jsx
│   │   └── Sidebar.jsx
│   ├── ThemeRegistry/            # MUI テーマ設定
│   │   ├── ThemeRegistry.js
│   │   └── theme.js
│   └── ui/                       # 汎用UIコンポーネント
│       ├── ErrorDisplay.jsx
│       ├── Loading.jsx
│       ├── StyledButton.jsx
│       ├── StyledCard.jsx
│       ├── StyledInput.jsx
│       └── StyledModal.jsx
│
├── lib/                          # ロジック・ユーティリティ
│   ├── api/                      # API通信
│   │   ├── client.js             # APIクライアント設定
│   │   ├── machinesApi.js
│   │   ├── rentalsApi.js
│   │   └── usersApi.js
│   ├── hooks/                    # カスタムフック
│   │   └── useAuth.js
│   ├── stores/                   # Zustand ストア
│   │   ├── authStore.js
│   │   └── onlineStore.js
│   └── utils/                    # ヘルパー関数
│       ├── formatDate.js
│       └── platformUtils.js
│
└── public/                       # 静的ファイル
    ├── icons/                    # PWA アイコン
    └── manifest.json             # PWA マニフェスト
```

### バックエンド (web_backend/)

```
web_backend/
├── Controllers/                  # API エンドポイント
│   ├── MachinesController.cs
│   ├── UsersController.cs
│   └── RentalsController.cs
│
├── Services/                     # ビジネスロジック
│   ├── MachineService.cs
│   ├── UserService.cs
│   └── RentalService.cs
│
├── Repositories/                 # データアクセス層
│   ├── IMachineRepository.cs
│   ├── MachineRepository.cs
│   ├── IUserRepository.cs
│   ├── UserRepository.cs
│   ├── IRentalRepository.cs
│   └── RentalRepository.cs
│
├── Models/                       # エンティティ
│   ├── Machine.cs
│   ├── User.cs
│   └── Rental.cs
│
├── DTOs/                         # データ転送オブジェクト
│   ├── MachineListDTO.cs
│   ├── MachineDetailDTO.cs
│   ├── UserListDTO.cs
│   ├── UserDetailDTO.cs
│   ├── RentalListDTO.cs
│   └── RentalDetailDTO.cs
│
├── Data/                         # データベースコンテキスト
│   └── ApplicationDbContext.cs
│
├── Program.cs                    # アプリケーションエントリポイント
└── appsettings.json              # 設定ファイル
```

---

## レイヤー構成

### フロントエンドのレイヤー

```
┌──────────────────────────────────────┐
│  Presentation Layer (RSC Pages)     │  ← データ取得、ページレンダリング
│  - app/**/page.jsx                  │
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│  Component Layer (Client)           │  ← インタラクション、UI表示
│  - components/**/*.jsx               │
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│  Logic Layer                         │  ← 状態管理、API通信
│  - lib/hooks/                        │
│  - lib/stores/ (Zustand)             │
│  - React Query                       │
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│  Data Access Layer                   │  ← バックエンド通信
│  - lib/api/*Api.js                   │
└──────────────────────────────────────┘
```

### バックエンドのレイヤー

```
┌──────────────────────────────────────┐
│  API Layer (Controllers)             │  ← HTTPリクエスト処理
│  - Controllers/*Controller.cs        │
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│  Business Logic Layer (Services)     │  ← ビジネスルール実装
│  - Services/*Service.cs               │
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│  Data Access Layer (Repositories)    │  ← データ操作
│  - Repositories/*Repository.cs        │
└────────────┬─────────────────────────┘
             │
             ↓
┌──────────────────────────────────────┐
│  Database Layer (PostgreSQL)         │  ← データ永続化
│  - MST_DEVICE, MST_USER, TRN_RENTAL  │
└──────────────────────────────────────┘
```

---

## コンポーネント分類

### Server Components (RSC)
- データ取得が必要なページ (`app/**/page.jsx`)
- 静的なレイアウト (`app/**/layout.jsx`)
- SEOが重要なページ

### Client Components
- ユーザーインタラクションが必要なコンポーネント
- useState, useEffect などのフックを使用するコンポーネント
- イベントハンドラ (onClick, onChange 等) を持つコンポーネント

---

## データフロー

### 読み取り処理
```
1. User Action (Click)
   ↓
2. Client Component
   ↓
3. React Query (useQuery)
   ↓
4. API Client (lib/api/*Api.js)
   ↓
5. ASP.NET Core Controller
   ↓
6. Service Layer
   ↓
7. Repository Layer
   ↓
8. PostgreSQL
   ↓
9. Response → Cache → UI Update
```

### 書き込み処理
```
1. User Action (Submit)
   ↓
2. Client Component (Form)
   ↓
3. React Query (useMutation)
   ↓ onMutate (楽観的更新)
4. API Client (POST/PUT/DELETE)
   ↓
5. ASP.NET Core Controller
   ↓
6. Service Layer (Validation)
   ↓
7. Repository Layer
   ↓
8. PostgreSQL
   ↓
9. Response → Cache Invalidation → Refetch
```

---

## パフォーマンス戦略

### キャッシング
- **React Query**: 5分間のデータキャッシュ
- **Browser Cache**: 静的リソースのキャッシュ
- **Service Worker**: PWAによるオフライン対応

### 最適化
- **コード分割**: React.lazy + Suspense
- **画像最適化**: Next.js Image コンポーネント
- **バンドル最適化**: Tree shaking, Minification

---

## セキュリティ

### 認証・認可
- JWTトークンによる認証（予定）
- ロールベースのアクセス制御（管理者/一般ユーザー）

### データ保護
- HTTPS通信
- XSS対策（React の自動エスケープ）
- CSRF対策（予定）
- SQLインジェクション対策（パラメータ化クエリ）

---

## 今後の拡張予定

- [ ] PWA機能の完全実装
- [ ] オフラインモード対応
- [ ] リアルタイム通知（SignalR）
- [ ] ダークモード対応
- [ ] 多言語対応（i18n）
- [ ] テスト自動化（Jest, Playwright）
