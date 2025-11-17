# 画面遷移・ルーティング設計書

## 目次
- [ルーティング構造](#ルーティング構造)
- [画面一覧](#画面一覧)
- [各ページの詳細仕様](#各ページの詳細仕様)
- [画面遷移フロー](#画面遷移フロー)
- [Server Components と Client Components](#server-components-と-client-components)

---

## ルーティング構造

Next.js App Router を使用したファイルベースルーティング。

### ルートグループ

```
app/
├── (public)/           # 認証不要
│   └── page.jsx        # ホーム画面
│
├── (auth)/             # 認証関連（認証不要）
│   ├── login/
│   │   └── page.jsx    # ログイン画面
│   └── menu/
│       └── page.jsx    # メニュー/ダッシュボード
│
└── (main)/             # 認証必須
    ├── machines/       # 機器管理
    ├── users/          # ユーザー管理（管理者のみ）
    └── rentals/        # 貸出管理
```

---

## 画面一覧

### 1. 認証不要ページ

| パス | ファイル | 説明 | アクセス権限 |
|------|---------|------|------------|
| `/` | `(public)/page.jsx` | ホーム画面 | 全ユーザー |
| `/login` | `(auth)/login/page.jsx` | ログイン画面 | 全ユーザー |

### 2. 認証必須ページ（全ユーザー）

| パス | ファイル | 説明 | アクセス権限 |
|------|---------|------|------------|
| `/menu` | `(auth)/menu/page.jsx` | メニュー/ダッシュボード | 認証済み |
| `/machines` | `(main)/machines/page.jsx` | 機器一覧 | 認証済み |
| `/machines/[asset_no]` | `(main)/machines/[asset_no]/page.jsx` | 機器詳細 | 認証済み |
| `/rentals` | `(main)/rentals/page.jsx` | 貸出一覧 | 認証済み |
| `/rentals/[asset_no]` | `(main)/rentals/[asset_no]/page.jsx` | 貸出・返却 | 認証済み |
| `/rentals/history` | `(main)/rentals/history/page.jsx` | 貸出履歴 | 認証済み |

### 3. 認証必須ページ（管理者のみ）

| パス | ファイル | 説明 | アクセス権限 |
|------|---------|------|------------|
| `/machines/new` | `(main)/machines/new/page.jsx` | 機器新規登録 | 管理者のみ |
| `/users` | `(main)/users/page.jsx` | ユーザー一覧 | 管理者のみ |
| `/users/new` | `(main)/users/new/page.jsx` | ユーザー新規登録 | 管理者のみ |
| `/users/[employee_no]` | `(main)/users/[employee_no]/page.jsx` | ユーザー詳細・編集 | 管理者のみ |

---

## 各ページの詳細仕様

### 1. ホーム画面 `/`

**ファイル**: `app/(public)/page.jsx`

#### 目的
- アプリケーションの紹介
- ログインへの誘導

#### 表示内容
- アプリ名とロゴ
- アプリの概要説明
- 主な機能の紹介
- ログインボタン

#### 処理フロー
```javascript
/**
 * ホーム画面（Server Component）
 * 
 * 処理:
 * 1. 静的コンテンツを表示
 * 2. ログインボタンをクリック → /login へ遷移
 */

export default function HomePage() {
  return (
    <div>
      <h1>Rental Machine App</h1>
      <p>社内機器のレンタル管理システム</p>
      <ul>
        <li>機器の貸出・返却</li>
        <li>返却期限のリマインダー</li>
        <li>貸出履歴の確認</li>
      </ul>
      <Link href="/login">
        <Button>ログイン</Button>
      </Link>
    </div>
  );
}
```

---

### 2. ログイン画面 `/login`

**ファイル**: `app/(auth)/login/page.jsx`

#### 目的
- ユーザー認証

#### 表示内容
- 社員番号入力フィールド
- パスワード入力フィールド（将来実装）
- ログインボタン
- エラーメッセージ表示

#### 処理フロー
```javascript
/**
 * ログイン画面（Server Component）
 * 
 * 処理:
 * 1. LoginForm (Client Component) をレンダリング
 */

import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div>
      <h1>ログイン</h1>
      <LoginForm />
    </div>
  );
}
```

```javascript
/**
 * LoginForm (Client Component)
 * 
 * 処理:
 * 1. 社員番号を入力
 * 2. ログインボタンをクリック
 * 3. バックエンド API に認証リクエスト送信
 * 4. 成功 → Zustand にユーザー情報保存 → /menu へ遷移
 * 5. 失敗 → エラーメッセージ表示
 */

'use client';

export default function LoginForm() {
  const [employeeNo, setEmployeeNo] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_no: employeeNo })
      });

      if (!response.ok) {
        throw new Error('ログインに失敗しました');
      }

      const userData = await response.json();
      setUser(userData);
      router.push('/menu');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={employeeNo}
        onChange={(e) => setEmployeeNo(e.target.value)}
        placeholder="社員番号"
        required
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">ログイン</button>
    </form>
  );
}
```

---

### 3. メニュー画面 `/menu`

**ファイル**: `app/(auth)/menu/page.jsx`

#### 目的
- ダッシュボード表示
- 各機能へのナビゲーション

#### 表示内容（管理者）
- ユーザー名表示
- 機器管理リンク
- ユーザー管理リンク
- 貸出管理リンク
- 返却期限間近の件数（リンク付き）
- 返却期限切れの件数（リンク付き）

#### 表示内容（一般ユーザー）
- ユーザー名表示
- 機器管理リンク（閲覧のみ）
- 貸出管理リンク
- 自分の貸出状況表示

#### 処理フロー
```javascript
/**
 * メニュー画面（Server Component）
 * 
 * 処理:
 * 1. ユーザー情報を取得（Zustand から）
 * 2. 権限に応じたメニューを表示
 * 3. リマインダー情報を表示
 */

import { cookies } from 'next/headers';
import MenuContent from '@/components/menu/MenuContent';

export default async function MenuPage() {
  // サーバーサイドでリマインダー情報を取得
  const reminders = await fetch('http://localhost:5000/api/rentals/reminders', {
    cache: 'no-store'
  }).then(res => res.json());

  return (
    <div>
      <h1>メニュー</h1>
      <MenuContent reminders={reminders} />
    </div>
  );
}
```

```javascript
/**
 * MenuContent (Client Component)
 * 
 * 処理:
 * 1. ユーザー情報を Zustand から取得
 * 2. 管理者の場合、全機能のリンクを表示
 * 3. 一般ユーザーの場合、制限されたリンクを表示
 */

'use client';

export default function MenuContent({ reminders }) {
  const { user, isAdmin } = useAuthStore();

  return (
    <div>
      <h2>ようこそ、{user?.name}さん</h2>

      {/* 共通メニュー */}
      <nav>
        <Link href="/machines">機器管理</Link>
        <Link href="/rentals">貸出管理</Link>
      </nav>

      {/* 管理者専用メニュー */}
      {isAdmin() && (
        <nav>
          <Link href="/users">ユーザー管理</Link>
        </nav>
      )}

      {/* リマインダー表示 */}
      {isAdmin() ? (
        <div>
          <h3>リマインダー</h3>
          <p>返却期限間近: {reminders.dueSoon}件</p>
          <p>返却期限切れ: {reminders.overdue}件</p>
          <Link href="/rentals?filter=dueSoon">詳細を見る</Link>
        </div>
      ) : (
        <div>
          <h3>あなたの貸出状況</h3>
          {/* 自分の貸出一覧を表示 */}
        </div>
      )}
    </div>
  );
}
```

---

### 4. 機器一覧画面 `/machines`

**ファイル**: `app/(main)/machines/page.jsx`

#### 目的
- 登録されている機器の一覧表示

#### 表示内容
- 機器一覧テーブル（DataGrid または Virtuoso）
  - 資産番号
  - メーカー
  - OS
  - メモリ
  - ストレージ
  - GPU有無
  - 設置場所
  - 貸出状況
- 検索・フィルター機能
- 新規登録ボタン（管理者のみ）

#### 処理フロー
```javascript
/**
 * 機器一覧画面（Server Component）
 * 
 * 処理:
 * 1. 機器一覧データを取得
 * 2. MachineList (Client Component) にデータを渡す
 */

import MachineList from '@/components/machines/MachineList';

export default async function MachinesPage() {
  // サーバーサイドでデータ取得
  const machines = await fetch('http://localhost:5000/api/machines', {
    cache: 'no-store'
  }).then(res => res.json());

  return (
    <div>
      <h1>機器一覧</h1>
      <MachineList initialData={machines} />
    </div>
  );
}
```

```javascript
/**
 * MachineList (Client Component)
 * 
 * 処理:
 * 1. initialData を表示
 * 2. React Query で最新データを取得・キャッシュ
 * 3. 検索・フィルター機能
 * 4. ページネーションまたは仮想スクロール
 * 5. 詳細ボタン → /machines/[asset_no] へ遷移
 * 6. 新規登録ボタン → /machines/new へ遷移（管理者のみ）
 */

'use client';

export default function MachineList({ initialData }) {
  const { data: machines } = useQuery({
    queryKey: ['machines'],
    queryFn: () => fetch('/api/machines').then(res => res.json()),
    initialData
  });

  const { isAdmin } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div>
      {/* 検索バー */}
      <input
        type="text"
        placeholder="検索..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* 新規登録ボタン（管理者のみ） */}
      {isAdmin() && (
        <Link href="/machines/new">
          <Button>新規登録</Button>
        </Link>
      )}

      {/* 機器一覧表示 */}
      <DataGrid
        rows={machines}
        columns={[
          { field: 'asset_no', headerName: '資産番号' },
          { field: 'maker', headerName: 'メーカー' },
          { field: 'os', headerName: 'OS' },
          { field: 'memory', headerName: 'メモリ' },
          {
            field: 'actions',
            headerName: '操作',
            renderCell: (params) => (
              <Link href={`/machines/${params.row.asset_no}`}>
                <Button>詳細</Button>
              </Link>
            )
          }
        ]}
      />
    </div>
  );
}
```

---

### 5. 機器詳細画面 `/machines/[asset_no]`

**ファイル**: `app/(main)/machines/[asset_no]/page.jsx`

#### 目的
- 機器の詳細情報表示
- 編集・削除（管理者のみ）

#### 表示内容
- 全フィールドの詳細情報
- 貸出履歴
- 編集ボタン（管理者のみ）
- 削除ボタン（管理者のみ）
- 貸出ボタン（貸出可能な場合）

#### 処理フロー
```javascript
/**
 * 機器詳細画面（Server Component）
 * 
 * 処理:
 * 1. asset_no をパラメータから取得
 * 2. 機器詳細データを取得
 * 3. MachineDetail (Client Component) にデータを渡す
 */

import MachineDetail from '@/components/machines/MachineDetail';

export default async function MachineDetailPage({ params }) {
  const { asset_no } = params;

  const machine = await fetch(`http://localhost:5000/api/machines/${asset_no}`, {
    cache: 'no-store'
  }).then(res => res.json());

  return (
    <div>
      <h1>機器詳細</h1>
      <MachineDetail machine={machine} />
    </div>
  );
}
```

```javascript
/**
 * MachineDetail (Client Component)
 * 
 * 処理:
 * 1. 機器情報を表示
 * 2. 編集ボタン → インライン編集モードに切り替え（管理者のみ）
 * 3. 削除ボタン → 確認ダイアログ → 削除実行（管理者のみ）
 * 4. 貸出ボタン → /rentals/[asset_no] へ遷移
 */

'use client';

export default function MachineDetail({ machine }) {
  const { isAdmin } = useAuthStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const router = useRouter();

  const deleteMutation = useMutation({
    mutationFn: () => fetch(`/api/machines/${machine.asset_no}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      router.push('/machines');
    }
  });

  const handleDelete = () => {
    if (confirm('本当に削除しますか?')) {
      deleteMutation.mutate();
    }
  };

  return (
    <div>
      {isEditMode ? (
        <MachineForm machine={machine} onCancel={() => setIsEditMode(false)} />
      ) : (
        <div>
          <p>資産番号: {machine.asset_no}</p>
          <p>メーカー: {machine.maker}</p>
          <p>OS: {machine.os}</p>
          {/* ... その他のフィールド */}

          {/* 操作ボタン */}
          {isAdmin() && (
            <>
              <Button onClick={() => setIsEditMode(true)}>編集</Button>
              <Button onClick={handleDelete}>削除</Button>
            </>
          )}

          {/* 貸出可能な場合 */}
          {!machine.rental_flag && (
            <Link href={`/rentals/${machine.asset_no}`}>
              <Button>貸出</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
```

---

### 6. 機器新規登録画面 `/machines/new`

**ファイル**: `app/(main)/machines/new/page.jsx`

#### 目的
- 新しい機器の登録（管理者のみ）

#### 表示内容
- 機器情報入力フォーム
- 登録ボタン
- キャンセルボタン

#### 処理フロー
```javascript
/**
 * 機器新規登録画面（Server Component）
 * 
 * 処理:
 * 1. MachineForm (Client Component) をレンダリング
 */

import MachineForm from '@/components/machines/MachineForm';

export default function NewMachinePage() {
  return (
    <div>
      <h1>機器新規登録</h1>
      <MachineForm />
    </div>
  );
}
```

```javascript
/**
 * MachineForm (Client Component)
 * 
 * 処理:
 * 1. React Hook Form でフォーム管理
 * 2. Zod でバリデーション
 * 3. 登録ボタン → React Query の mutation で POST リクエスト
 * 4. 成功 → /machines へ遷移
 * 5. 失敗 → エラーメッセージ表示
 */

'use client';

export default function MachineForm({ machine = null }) {
  const router = useRouter();
  const isEdit = !!machine;

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: machine || {}
  });

  const createMutation = useMutation({
    mutationFn: (data) => fetch('/api/machines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      router.push('/machines');
    }
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('maker', { required: true })} placeholder="メーカー" />
      {errors.maker && <span>メーカーは必須です</span>}

      <input {...register('os', { required: true })} placeholder="OS" />
      {errors.os && <span>OSは必須です</span>}

      {/* ... その他のフィールド */}

      <button type="submit">登録</button>
      <button type="button" onClick={() => router.back()}>キャンセル</button>
    </form>
  );
}
```

---

### 7. ユーザー一覧画面 `/users`

**ファイル**: `app/(main)/users/page.jsx`

#### 目的
- 登録されているユーザーの一覧表示（管理者のみ）

#### 表示内容
- ユーザー一覧テーブル
  - 社員番号
  - 名前
  - 部署
  - 役職
  - アカウントレベル
- 新規登録ボタン

#### 処理フロー
```javascript
/**
 * ユーザー一覧画面（Server Component）
 * 
 * 処理:
 * 1. ユーザー一覧データを取得
 * 2. UserList (Client Component) にデータを渡す
 */

import UserList from '@/components/users/UserList';

export default async function UsersPage() {
  const users = await fetch('http://localhost:5000/api/users', {
    cache: 'no-store'
  }).then(res => res.json());

  return (
    <div>
      <h1>ユーザー一覧</h1>
      <UserList initialData={users} />
    </div>
  );
}
```

---

### 8. 貸出一覧画面 `/rentals`

**ファイル**: `app/(main)/rentals/page.jsx`

#### 目的
- 全機器の貸出状況表示

#### 表示内容
- 貸出一覧テーブル
  - 資産番号
  - 機器名
  - 貸出者
  - 貸出日
  - 返却予定日
  - ステータス（貸出中/返却済み/期限切れ）
- フィルター（貸出中のみ/返却済みのみ/期限切れのみ）

#### 処理フロー
```javascript
/**
 * 貸出一覧画面（Server Component）
 * 
 * 処理:
 * 1. 貸出一覧データを取得
 * 2. RentalList (Client Component) にデータを渡す
 */

import RentalList from '@/components/rentals/RentalList';

export default async function RentalsPage() {
  const rentals = await fetch('http://localhost:5000/api/rentals', {
    cache: 'no-store'
  }).then(res => res.json());

  return (
    <div>
      <h1>貸出一覧</h1>
      <RentalList initialData={rentals} />
    </div>
  );
}
```

---

### 9. 貸出・返却画面 `/rentals/[asset_no]`

**ファイル**: `app/(main)/rentals/[asset_no]/page.jsx`

#### 目的
- 機器の貸出または返却処理

#### 表示内容（貸出時）
- 機器情報表示
- 貸出者選択（ユーザー検索ダイアログ）
- 返却予定日選択
- 備考入力
- 貸出ボタン

#### 表示内容（返却時）
- 機器情報表示
- 現在の貸出情報表示
- 返却ボタン

#### 処理フロー
```javascript
/**
 * 貸出・返却画面（Server Component）
 * 
 * 処理:
 * 1. asset_no をパラメータから取得
 * 2. 機器情報と貸出状況を取得
 * 3. RentalForm (Client Component) にデータを渡す
 */

import RentalForm from '@/components/rentals/RentalForm';

export default async function RentalPage({ params }) {
  const { asset_no } = params;

  const machine = await fetch(`http://localhost:5000/api/machines/${asset_no}`, {
    cache: 'no-store'
  }).then(res => res.json());

  return (
    <div>
      <h1>{machine.rental_flag ? '返却' : '貸出'}</h1>
      <RentalForm machine={machine} />
    </div>
  );
}
```

---

### 10. 貸出履歴画面 `/rentals/history`

**ファイル**: `app/(main)/rentals/history/page.jsx`

#### 目的
- 過去の貸出履歴表示

#### 表示内容
- 履歴一覧テーブル
  - 資産番号
  - 機器名
  - 貸出者
  - 貸出日
  - 返却予定日
  - 返却日
  - 備考

#### 処理フロー
```javascript
/**
 * 貸出履歴画面（Server Component）
 * 
 * 処理:
 * 1. 貸出履歴データを取得
 * 2. RentalHistoryList (Client Component) にデータを渡す
 */

import RentalHistoryList from '@/components/rentals/RentalHistoryList';

export default async function RentalHistoryPage() {
  const history = await fetch('http://localhost:5000/api/rentals/history', {
    cache: 'no-store'
  }).then(res => res.json());

  return (
    <div>
      <h1>貸出履歴</h1>
      <RentalHistoryList initialData={history} />
    </div>
  );
}
```

---

## 画面遷移フロー

### 管理者ユーザーの場合

```
起動
 ↓
プラットフォーム判定
 ├─ PWA → /login
 └─ ブラウザ → /
      ↓
     /login
      ↓
   認証成功
      ↓
    /menu ━━━━━━━━━┓
      ┃              ┃
      ┣→ /machines ━╋→ /machines/new
      ┃      ┃       ┃
      ┃      ┗━━━━━━╋→ /machines/[asset_no]
      ┃              ┃
      ┣→ /users ━━━━╋→ /users/new
      ┃      ┃       ┃
      ┃      ┗━━━━━━╋→ /users/[employee_no]
      ┃              ┃
      ┗→ /rentals ━━╋→ /rentals/[asset_no]
             ┃       ┃
             ┗━━━━━━╋→ /rentals/history
```

### 一般ユーザーの場合

```
起動
 ↓
プラットフォーム判定
 ├─ PWA → /login
 └─ ブラウザ → /
      ↓
     /login
      ↓
   認証成功
      ↓
    /menu ━━━━━━━━━┓
      ┃              ┃
      ┣→ /machines ━╋→ /machines/[asset_no]（閲覧のみ）
      ┃              ┃
      ┗→ /rentals ━━╋→ /rentals/[asset_no]
             ┃       ┃
             ┗━━━━━━╋→ /rentals/history
```

---

## Server Components と Client Components

### Server Components (RSC) の役割

- **データ取得**: バックエンドAPIから直接データ取得
- **SEO最適化**: HTMLを事前レンダリング
- **パフォーマンス**: JavaScriptバンドルサイズの削減

#### 使用箇所
- `app/**/page.jsx`
- `app/**/layout.jsx`

### Client Components の役割

- **インタラクション**: ユーザー操作への対応
- **状態管理**: useState, useEffect などのフック使用
- **イベントハンドラ**: onClick, onChange などのイベント処理

#### 使用箇所
- `components/**/*.jsx`
- フォームコンポーネント
- 一覧表示コンポーネント
- ダイアログコンポーネント

### データフローの例

```
Server Component (page.jsx)
    ↓ データ取得
Backend API
    ↓ initialData として渡す
Client Component
    ↓ React Query で再取得・キャッシュ
最新データを表示
```

---

## ナビゲーション

### Header コンポーネント

```javascript
/**
 * Header (Client Component)
 * 
 * 表示内容:
 * - アプリ名
 * - ユーザー名
 * - ログアウトボタン
 */

'use client';

export default function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header>
      <h1>Rental Machine App</h1>
      <div>
        <span>{user?.name}</span>
        <button onClick={handleLogout}>ログアウト</button>
      </div>
    </header>
  );
}
```

### Sidebar コンポーネント

```javascript
/**
 * Sidebar (Client Component)
 * 
 * 表示内容:
 * - メニューリンク
 * - 権限に応じた表示制御
 */

'use client';

export default function Sidebar() {
  const { isAdmin } = useAuthStore();

  return (
    <aside>
      <nav>
        <Link href="/menu">メニュー</Link>
        <Link href="/machines">機器管理</Link>
        {isAdmin() && <Link href="/users">ユーザー管理</Link>}
        <Link href="/rentals">貸出管理</Link>
        <Link href="/rentals/history">貸出履歴</Link>
      </nav>
    </aside>
  );
}
```

---

## まとめ

Next.js App Router の特性を活かし、Server Components と Client Components を適切に分離することで、パフォーマンスとUXを両立させた設計になっています。
