# 認証・権限管理設計書

## 目次
- [認証フロー概要](#認証フロー概要)
- [ユーザーロール](#ユーザーロール)
- [認証プロセス](#認証プロセス)
- [状態管理](#状態管理)
- [ルートガード](#ルートガード)
- [権限チェック](#権限チェック)

---

## 認証フロー概要

本アプリケーションは、**社員番号ベースの認証**を採用しています。

### 基本フロー

```
1. アプリ起動
   ↓
2. プラットフォーム判定
   - PWA/アプリ → ログイン画面へ
   - ブラウザ → ホーム画面へ
   ↓
3. ホーム画面（認証不要）
   - アプリ概要表示
   - ログインリンク
   ↓
4. ログイン画面
   - 社員番号入力
   - パスワード入力（将来実装）
   ↓
5. 認証処理
   - バックエンドに社員番号を送信
   - ユーザー情報取得
   - アカウントレベル（権限）確認
   ↓
6. 認証成功
   - Zustand にユーザー情報保存
   - メニュー画面へリダイレクト
   ↓
7. 以降の画面遷移
   - 認証状態を維持
   - 権限に応じた機能制限
```

---

## ユーザーロール

### 1. 管理者ユーザー (Admin)
- **account_level**: `true`
- **権限**:
  - 機器の登録・編集・削除
  - ユーザーの登録・編集・削除
  - 全ユーザーの貸出状況閲覧
  - 貸出履歴の閲覧
  - すべての機器の貸出・返却操作

### 2. 一般ユーザー (General User)
- **account_level**: `false`
- **権限**:
  - 機器の閲覧のみ（登録・編集・削除不可）
  - 自分の貸出状況のみ閲覧
  - 自分が借りている機器の返却
  - 利用可能な機器の貸出

---

## 認証プロセス

### ログイン処理の詳細

#### フロントエンド (LoginForm.jsx)

```javascript
/**
 * ログインフォームコンポーネント
 * 
 * 処理フロー:
 * 1. ユーザーが社員番号を入力
 * 2. 送信ボタンをクリック
 * 3. バックエンドAPIにPOSTリクエスト
 * 4. レスポンスからユーザー情報を取得
 * 5. Zustand の authStore にユーザー情報を保存
 * 6. /menu にリダイレクト
 */

const handleLogin = async (data) => {
  try {
    // API呼び出し
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_no: data.employee_no,
        password: data.password // 将来実装
      })
    });

    if (!response.ok) {
      throw new Error('ログインに失敗しました');
    }

    const userData = await response.json();

    // Zustand ストアに保存
    setUser({
      employee_no: userData.employee_no,
      name: userData.name,
      department: userData.department,
      account_level: userData.account_level, // 管理者フラグ
      isAuthenticated: true
    });

    // メニュー画面へリダイレクト
    router.push('/menu');
  } catch (error) {
    setError(error.message);
  }
};
```

#### バックエンド (AuthController.cs)

```csharp
/**
 * 認証コントローラー
 * 
 * POST /api/auth/login
 * 
 * リクエストボディ:
 * {
 *   "employee_no": "string",
 *   "password": "string" (将来実装)
 * }
 * 
 * レスポンス:
 * {
 *   "employee_no": "string",
 *   "name": "string",
 *   "department": "string",
 *   "account_level": boolean,
 *   "mail_address": "string"
 * }
 */

[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    // 1. MST_USER テーブルから社員番号で検索
    var user = await _userRepository.GetByEmployeeNoAsync(request.EmployeeNo);

    // 2. ユーザーが存在しない、または削除済みの場合
    if (user == null || user.DeleteFlag)
    {
        return Unauthorized(new { message = "ユーザーが見つかりません" });
    }

    // 3. 退職済みユーザーの場合
    if (user.RetireDate.HasValue && user.RetireDate.Value <= DateTime.Today)
    {
        return Unauthorized(new { message = "このユーザーは退職済みです" });
    }

    // 4. パスワード検証（将来実装）
    // if (!VerifyPassword(request.Password, user.PasswordHash))
    // {
    //     return Unauthorized(new { message = "パスワードが間違っています" });
    // }

    // 5. ユーザー情報を返却
    return Ok(new
    {
        employee_no = user.EmployeeNo,
        name = user.Name,
        department = user.Department,
        account_level = user.AccountLevel,
        mail_address = user.MailAddress
    });
}
```

---

## 状態管理

### Zustand による認証状態管理

#### authStore.js

```javascript
/**
 * 認証ストア
 * 
 * 管理する状態:
 * - user: ログインユーザー情報
 * - isAuthenticated: 認証状態
 * - isAdmin: 管理者フラグ（計算プロパティ）
 * 
 * アクション:
 * - setUser: ユーザー情報をセット
 * - logout: ログアウト処理
 * - checkAuth: 認証状態確認
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // 状態
      user: null,
      isAuthenticated: false,

      // 計算プロパティ: 管理者かどうか
      isAdmin: () => {
        const { user } = get();
        return user?.account_level === true;
      },

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
  )
);
```

### 使用例

```javascript
// コンポーネント内での使用
const { user, isAuthenticated, isAdmin, logout } = useAuthStore();

// 管理者かどうかチェック
if (isAdmin()) {
  // 管理者専用機能
}

// ログアウト
const handleLogout = () => {
  logout();
  router.push('/login');
};
```

---

## ルートガード

### (main)/layout.jsx での認証チェック

```javascript
/**
 * メインレイアウト
 * 
 * 役割:
 * - 認証が必要なページ群を包むレイアウト
 * - 認証されていない場合はログインページにリダイレクト
 * - ヘッダーとサイドバーを表示
 * 
 * 'use client' ディレクティブが必要
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';

export default function MainLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    // 認証チェック
    if (!isAuthenticated || !checkAuth()) {
      // 未認証の場合、ログインページへリダイレクト
      router.push('/login');
    }
  }, [isAuthenticated, checkAuth, router]);

  // 認証されていない場合は何も表示しない
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
```

---

## 権限チェック

### コンポーネントレベルでの権限制御

#### 機器管理画面での例

```javascript
/**
 * 機器一覧画面 (MachineList.jsx)
 * 
 * 権限による機能制限:
 * - 管理者: 新規登録・編集・削除ボタン表示
 * - 一般ユーザー: 閲覧のみ（ボタン非表示）
 */

'use client';

import { useAuthStore } from '@/lib/stores/authStore';

export default function MachineList() {
  const { isAdmin } = useAuthStore();

  return (
    <div>
      <h1>機器一覧</h1>
      
      {/* 管理者のみ新規登録ボタン表示 */}
      {isAdmin() && (
        <Button href="/machines/new">
          新規登録
        </Button>
      )}

      {/* 機器一覧表示 */}
      <DataGrid
        rows={machines}
        columns={[
          // ...
          {
            field: 'actions',
            headerName: '操作',
            renderCell: (params) => (
              <>
                <Button href={`/machines/${params.row.asset_no}`}>
                  詳細
                </Button>
                
                {/* 管理者のみ編集・削除ボタン表示 */}
                {isAdmin() && (
                  <>
                    <Button href={`/machines/${params.row.asset_no}/edit`}>
                      編集
                    </Button>
                    <Button onClick={() => handleDelete(params.row.asset_no)}>
                      削除
                    </Button>
                  </>
                )}
              </>
            )
          }
        ]}
      />
    </div>
  );
}
```

#### ユーザー管理画面での例

```javascript
/**
 * ユーザー管理画面
 * 
 * アクセス制限:
 * - 管理者: アクセス可能
 * - 一般ユーザー: アクセス不可（404またはリダイレクト）
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';

export default function UsersPage() {
  const router = useRouter();
  const { isAdmin } = useAuthStore();

  useEffect(() => {
    // 管理者でない場合、メニューにリダイレクト
    if (!isAdmin()) {
      router.push('/menu');
    }
  }, [isAdmin, router]);

  // 管理者でない場合は何も表示しない
  if (!isAdmin()) {
    return null;
  }

  return (
    <div>
      <h1>ユーザー管理</h1>
      {/* ユーザー一覧表示 */}
    </div>
  );
}
```

---

## バックエンドでの権限チェック

### API レベルでの権限検証

```csharp
/**
 * 機器コントローラー
 * 
 * 権限チェック:
 * - POST, PUT, DELETE: 管理者のみ
 * - GET: 全ユーザー
 */

[ApiController]
[Route("api/[controller]")]
public class MachinesController : ControllerBase
{
    // GET: すべてのユーザーがアクセス可能
    [HttpGet]
    public async Task<IActionResult> GetMachines()
    {
        var machines = await _machineService.GetAllAsync();
        return Ok(machines);
    }

    // POST: 管理者のみ
    [HttpPost]
    [Authorize(Roles = "Admin")] // 将来実装
    public async Task<IActionResult> CreateMachine([FromBody] MachineDTO dto)
    {
        // 管理者チェック（現在は手動実装）
        var user = await GetCurrentUserAsync();
        if (!user.AccountLevel)
        {
            return Forbidden(new { message = "権限がありません" });
        }

        var machine = await _machineService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetMachine), new { id = machine.AssetNo }, machine);
    }

    // PUT: 管理者のみ
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")] // 将来実装
    public async Task<IActionResult> UpdateMachine(string id, [FromBody] MachineDTO dto)
    {
        var user = await GetCurrentUserAsync();
        if (!user.AccountLevel)
        {
            return Forbidden(new { message = "権限がありません" });
        }

        var machine = await _machineService.UpdateAsync(id, dto);
        return Ok(machine);
    }

    // DELETE: 管理者のみ
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")] // 将来実装
    public async Task<IActionResult> DeleteMachine(string id)
    {
        var user = await GetCurrentUserAsync();
        if (!user.AccountLevel)
        {
            return Forbidden(new { message = "権限がありません" });
        }

        await _machineService.DeleteAsync(id);
        return NoContent();
    }
}
```

---

## セキュリティ考慮事項

### 現状の実装
- 社員番号による認証
- account_level による権限管理
- フロントエンドでの権限チェック
- バックエンドでの権限チェック

### 将来の実装予定
- [ ] **パスワード認証**: bcrypt によるハッシュ化
- [ ] **JWT トークン**: ステートレスな認証
- [ ] **リフレッシュトークン**: セキュアなセッション管理
- [ ] **CSRF トークン**: クロスサイトリクエストフォージェリ対策
- [ ] **レート制限**: ブルートフォース攻撃対策
- [ ] **2要素認証 (2FA)**: メールまたはTOTP
- [ ] **セッションタイムアウト**: 30分の非アクティブでログアウト
- [ ] **監査ログ**: ログイン履歴の記録

---

## トラブルシューティング

### よくある問題

#### 1. ログイン後すぐにログアウトされる
- **原因**: localStorage が無効化されている
- **解決**: ブラウザの設定を確認

#### 2. 管理者なのに権限エラーが出る
- **原因**: account_level が正しく設定されていない
- **解決**: データベースの MST_USER テーブルを確認

#### 3. リロード後に認証が切れる
- **原因**: persist ミドルウェアの設定ミス
- **解決**: authStore.js の persist 設定を確認

---

## まとめ

本アプリケーションの認証・権限管理は、シンプルかつ効果的な設計を採用しています。将来的にはJWT認証やパスワードハッシュ化など、より強固なセキュリティ機能を実装予定です。
