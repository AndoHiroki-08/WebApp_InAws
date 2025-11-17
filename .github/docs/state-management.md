# 状態管理設計書

## 目次
- [状態管理の概要](#状態管理の概要)
- [Zustand ストア](#zustand-ストア)
- [React Query (TanStack Query)](#react-query-tanstack-query)
- [状態の分類](#状態の分類)
- [データフロー](#データフロー)
- [ベストプラクティス](#ベストプラクティス)

---

## 状態管理の概要

本アプリケーションでは、**Zustand** と **React Query (TanStack Query)** を組み合わせた状態管理戦略を採用しています。

### 採用理由

#### Zustand
- **シンプルなAPI**: Redux に比べてボイラープレートが少ない
- **TypeScript サポート**: 型安全な状態管理
- **パフォーマンス**: 必要なコンポーネントのみ再レンダリング
- **Middleware サポート**: persist, devtools など

#### React Query
- **サーバー状態の管理**: API から取得したデータのキャッシング
- **自動再取得**: ウィンドウフォーカス時の自動更新
- **楽観的更新**: UI の即座な反映
- **エラーハンドリング**: リトライ機能、エラー状態の管理

### 状態の分類

| 分類 | 管理ツール | 例 |
|------|----------|-----|
| **グローバルクライアント状態** | Zustand | 認証情報、オンライン/オフライン状態 |
| **サーバー状態** | React Query | 機器一覧、ユーザー一覧、貸出一覧 |
| **ローカルコンポーネント状態** | useState | フォーム入力値、モーダル開閉状態 |

---

## Zustand ストア

### 1. authStore.js (認証ストア)

#### 役割
- ログインユーザー情報の管理
- 認証状態の管理
- 権限チェック機能

#### 実装

```javascript
/**
 * 認証ストア
 * 
 * 管理する状態:
 * - user: ログインユーザー情報
 * - isAuthenticated: 認証状態
 * 
 * アクション:
 * - setUser: ユーザー情報をセット
 * - logout: ログアウト処理
 * - isAdmin: 管理者かどうかを判定
 * - checkAuth: 認証状態を確認
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        // 状態
        user: null,
        isAuthenticated: false,

        // アクション: ログイン
        setUser: (userData) => set({
          user: userData,
          isAuthenticated: true
        }),

        // アクション: ログアウト
        logout: () => set({
          user: null,
          isAuthenticated: false
        }),

        // 計算プロパティ: 管理者かどうか
        isAdmin: () => {
          const { user } = get();
          return user?.account_level === true;
        },

        // アクション: 認証状態確認
        checkAuth: () => {
          const { user } = get();
          return user !== null && !user.retire_date;
        }
      }),
      {
        name: 'auth-storage', // localStorage のキー名
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated
        })
      }
    ),
    { name: 'AuthStore' } // DevTools での表示名
  )
);
```

#### 使用例

```javascript
// コンポーネント内での使用
import { useAuthStore } from '@/lib/stores/authStore';

function MyComponent() {
  const { user, isAuthenticated, isAdmin, setUser, logout } = useAuthStore();

  // 認証チェック
  if (!isAuthenticated) {
    return <div>ログインしてください</div>;
  }

  // 管理者チェック
  if (isAdmin()) {
    return <AdminPanel />;
  }

  return (
    <div>
      <p>ようこそ、{user.name}さん</p>
      <button onClick={logout}>ログアウト</button>
    </div>
  );
}
```

---

### 2. onlineStore.js (オンライン状態ストア)

#### 役割
- ネットワーク接続状態の管理
- オンライン/オフライン切り替え時の処理

#### 実装

```javascript
/**
 * オンライン状態ストア
 * 
 * 管理する状態:
 * - isOnline: オンライン状態
 * 
 * アクション:
 * - setOnline: オンライン状態をセット
 * - checkOnlineStatus: 現在のオンライン状態を確認
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useOnlineStore = create(
  devtools(
    (set, get) => ({
      // 状態
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,

      // アクション: オンライン状態をセット
      setOnline: (status) => set({ isOnline: status }),

      // アクション: 現在のオンライン状態を確認
      checkOnlineStatus: () => {
        const { isOnline } = get();
        return isOnline;
      }
    }),
    { name: 'OnlineStore' }
  )
);

// ブラウザのオンライン/オフラインイベントを監視
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useOnlineStore.getState().setOnline(true);
  });

  window.addEventListener('offline', () => {
    useOnlineStore.getState().setOnline(false);
  });
}
```

#### 使用例

```javascript
import { useOnlineStore } from '@/lib/stores/onlineStore';

function MyComponent() {
  const { isOnline } = useOnlineStore();

  if (!isOnline) {
    return (
      <div style={{ backgroundColor: 'red', color: 'white', padding: '10px' }}>
        オフラインモードです。一部の機能が制限されています。
      </div>
    );
  }

  return <div>オンライン</div>;
}
```

---

## React Query (TanStack Query)

### セットアップ

```javascript
// app/layout.js
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分間キャッシュ
      cacheTime: 1000 * 60 * 10, // 10分間保持
      refetchOnWindowFocus: true, // ウィンドウフォーカス時に再取得
      retry: 1, // リトライ回数
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

---

### 使用パターン

#### 1. データ取得 (useQuery)

```javascript
/**
 * 機器一覧の取得
 */
import { useQuery } from '@tanstack/react-query';
import { machinesApi } from '@/lib/api/machinesApi';

function MachineList() {
  const {
    data: machines,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['machines'], // キャッシュキー
    queryFn: () => machinesApi.getMachines(), // データ取得関数
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (isError) {
    return <div>エラー: {error.message}</div>;
  }

  return (
    <div>
      <button onClick={() => refetch()}>更新</button>
      {machines.map((machine) => (
        <div key={machine.asset_no}>{machine.maker}</div>
      ))}
    </div>
  );
}
```

---

#### 2. データ作成・更新・削除 (useMutation)

```javascript
/**
 * 機器の新規登録
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { machinesApi } from '@/lib/api/machinesApi';

function MachineForm() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => machinesApi.createMachine(data),
    
    // 楽観的更新
    onMutate: async (newMachine) => {
      // 進行中のクエリをキャンセル
      await queryClient.cancelQueries(['machines']);

      // 現在のキャッシュを取得
      const previousMachines = queryClient.getQueryData(['machines']);

      // 楽観的にキャッシュを更新
      queryClient.setQueryData(['machines'], (old) => [...old, newMachine]);

      // ロールバック用に前の状態を返す
      return { previousMachines };
    },

    // 成功時
    onSuccess: (data) => {
      // キャッシュを無効化して再取得
      queryClient.invalidateQueries(['machines']);
      alert('機器を登録しました');
    },

    // エラー時
    onError: (error, newMachine, context) => {
      // ロールバック
      queryClient.setQueryData(['machines'], context.previousMachines);
      alert(`エラー: ${error.message}`);
    },

    // 完了時（成功・失敗問わず）
    onSettled: () => {
      // 念のため再取得
      queryClient.invalidateQueries(['machines']);
    }
  });

  const handleSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* フォームフィールド */}
      <button type="submit" disabled={createMutation.isLoading}>
        {createMutation.isLoading ? '登録中...' : '登録'}
      </button>
    </form>
  );
}
```

---

#### 3. 依存データの取得

```javascript
/**
 * 機器詳細の取得（資産番号に依存）
 */
import { useQuery } from '@tanstack/react-query';
import { machinesApi } from '@/lib/api/machinesApi';

function MachineDetail({ assetNo }) {
  const { data: machine, isLoading } = useQuery({
    queryKey: ['machines', assetNo], // キャッシュキーに依存パラメータを含める
    queryFn: () => machinesApi.getMachine(assetNo),
    enabled: !!assetNo, // assetNo が存在する場合のみクエリを実行
  });

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return <div>{machine.maker}</div>;
}
```

---

#### 4. ページネーション

```javascript
/**
 * ページネーション対応の機器一覧
 */
import { useQuery } from '@tanstack/react-query';
import { machinesApi } from '@/lib/api/machinesApi';
import { useState } from 'react';

function MachineListPaginated() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isPreviousData } = useQuery({
    queryKey: ['machines', { page }],
    queryFn: () => machinesApi.getMachines({ page, pageSize: 20 }),
    keepPreviousData: true, // ページ遷移時に前のデータを保持
  });

  return (
    <div>
      {isLoading && <div>読み込み中...</div>}
      
      {data?.data.map((machine) => (
        <div key={machine.asset_no}>{machine.maker}</div>
      ))}

      <div>
        <button 
          onClick={() => setPage((old) => Math.max(old - 1, 1))}
          disabled={page === 1}
        >
          前へ
        </button>

        <span>ページ {page} / {data?.pagination.totalPages}</span>

        <button 
          onClick={() => setPage((old) => old + 1)}
          disabled={isPreviousData || page === data?.pagination.totalPages}
        >
          次へ
        </button>
      </div>
    </div>
  );
}
```

---

#### 5. 無限スクロール

```javascript
/**
 * 無限スクロール対応の機器一覧
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { machinesApi } from '@/lib/api/machinesApi';

function MachineListInfinite() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['machines', 'infinite'],
    queryFn: ({ pageParam = 1 }) => 
      machinesApi.getMachines({ page: pageParam, pageSize: 20 }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    }
  });

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.data.map((machine) => (
            <div key={machine.asset_no}>{machine.maker}</div>
          ))}
        </div>
      ))}

      <button 
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage
          ? '読み込み中...'
          : hasNextPage
          ? 'さらに読み込む'
          : 'すべて読み込み済み'}
      </button>
    </div>
  );
}
```

---

## 状態の分類

### 1. グローバルクライアント状態 (Zustand)

| ストア | 状態 | 説明 |
|--------|------|------|
| authStore | user | ログインユーザー情報 |
| authStore | isAuthenticated | 認証状態 |
| onlineStore | isOnline | オンライン/オフライン状態 |

### 2. サーバー状態 (React Query)

| エンティティ | クエリキー | 説明 |
|------------|----------|------|
| 機器一覧 | `['machines']` | 全機器のリスト |
| 機器詳細 | `['machines', assetNo]` | 特定機器の詳細情報 |
| 機器の貸出履歴 | `['machines', assetNo, 'history']` | 特定機器の貸出履歴 |
| ユーザー一覧 | `['users']` | 全ユーザーのリスト |
| ユーザー詳細 | `['users', employeeNo]` | 特定ユーザーの詳細情報 |
| ユーザーの貸出履歴 | `['users', employeeNo, 'rentals']` | 特定ユーザーの貸出履歴 |
| 貸出一覧 | `['rentals']` | 全貸出のリスト |
| 貸出履歴 | `['rentals', 'history']` | 過去の貸出履歴 |
| リマインダー | `['rentals', 'reminders']` | 返却期限のリマインダー |

### 3. ローカルコンポーネント状態 (useState)

| コンポーネント | 状態 | 説明 |
|--------------|------|------|
| フォーム | formData | 入力フィールドの値 |
| モーダル | isOpen | モーダルの開閉状態 |
| 検索バー | searchTerm | 検索キーワード |
| フィルター | filters | フィルター条件 |
| ページネーション | page | 現在のページ番号 |

---

## データフロー

### 読み取りフロー

```
1. コンポーネントマウント
   ↓
2. useQuery フック呼び出し
   ↓
3. キャッシュチェック
   ├─ キャッシュあり → 即座に返却
   └─ キャッシュなし → API リクエスト
       ↓
4. API 呼び出し (lib/api/*Api.js)
   ↓
5. バックエンド API
   ↓
6. レスポンス
   ↓
7. キャッシュに保存
   ↓
8. コンポーネントに返却
   ↓
9. UI 更新
```

---

### 書き込みフロー（楽観的更新）

```
1. ユーザー操作（フォーム送信）
   ↓
2. useMutation の mutate() 呼び出し
   ↓
3. onMutate（楽観的更新）
   - 現在のキャッシュを保存
   - キャッシュを即座に更新
   - UI が即座に反映される
   ↓
4. API リクエスト送信
   ↓
5. バックエンド API
   ↓
6. レスポンス
   ├─ 成功 → onSuccess
   │   - キャッシュを無効化
   │   - 最新データを再取得
   │
   └─ 失敗 → onError
       - キャッシュをロールバック
       - エラーメッセージ表示
```

---

## ベストプラクティス

### 1. キャッシュキーの命名規則

```javascript
// ✅ 良い例: 配列形式で階層構造を表現
['machines'] // 機器一覧
['machines', assetNo] // 特定機器
['machines', assetNo, 'history'] // 特定機器の履歴

// ❌ 悪い例: 文字列結合
['machine-' + assetNo]
```

---

### 2. キャッシュの無効化

```javascript
// 特定のクエリを無効化
queryClient.invalidateQueries(['machines']);

// 特定の機器のみ無効化
queryClient.invalidateQueries(['machines', assetNo]);

// 機器関連のすべてのクエリを無効化
queryClient.invalidateQueries({ queryKey: ['machines'] });
```

---

### 3. エラーハンドリング

```javascript
const { data, error, isError } = useQuery({
  queryKey: ['machines'],
  queryFn: machinesApi.getMachines,
  onError: (error) => {
    console.error('機器一覧の取得に失敗しました:', error);
    // エラートースト表示など
  }
});

if (isError) {
  return <ErrorDisplay message={error.message} />;
}
```

---

### 4. ローディング状態の表示

```javascript
const { data, isLoading, isFetching } = useQuery({
  queryKey: ['machines'],
  queryFn: machinesApi.getMachines
});

// 初回ロード
if (isLoading) {
  return <LoadingSpinner />;
}

// バックグラウンド再取得
if (isFetching) {
  return (
    <div>
      <div style={{ opacity: 0.5 }}>
        {/* データ表示 */}
      </div>
      <div>更新中...</div>
    </div>
  );
}
```

---

### 5. React Query DevTools の活用

```javascript
// 開発環境のみ DevTools を有効化
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  {children}
  {process.env.NODE_ENV === 'development' && (
    <ReactQueryDevtools initialIsOpen={false} />
  )}
</QueryClientProvider>
```

---

## まとめ

本アプリケーションの状態管理は、**Zustand** でグローバルなクライアント状態を、**React Query** でサーバー状態を管理することで、シンプルかつ効率的な実装を実現しています。楽観的更新やキャッシング戦略により、優れたユーザー体験を提供します。
