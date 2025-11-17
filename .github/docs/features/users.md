# ユーザー管理機能設計書

## 目次
- [機能概要](#機能概要)
- [画面一覧](#画面一覧)
- [データモデル](#データモデル)
- [ビジネスロジック](#ビジネスロジック)
- [API仕様](#api仕様)
- [フロントエンド実装](#フロントエンド実装)
- [バックエンド実装](#バックエンド実装)

---

## 機能概要

ユーザー管理機能は、システムを利用するユーザー（社員）の登録・編集・削除・一覧表示・詳細表示を行う機能です。**管理者のみがアクセス可能**です。

### 主な機能
1. **ユーザー一覧表示**: すべてのユーザーを一覧で表示
2. **ユーザー詳細表示**: ユーザーの詳細情報と貸出履歴を表示
3. **ユーザー新規登録**: 新しいユーザーを登録（管理者のみ）
4. **ユーザー編集**: 既存のユーザー情報を編集（管理者のみ）
5. **ユーザー削除**: ユーザーを論理削除（管理者のみ）
6. **検索・フィルター**: 条件に基づいたユーザーの絞り込み
7. **貸出履歴確認**: ユーザーごとの貸出履歴表示

---

## 画面一覧

| 画面名 | パス | 権限 |
|--------|------|------|
| ユーザー一覧 | `/users` | 管理者のみ |
| ユーザー詳細・編集 | `/users/[employee_no]` | 管理者のみ |
| ユーザー新規登録 | `/users/new` | 管理者のみ |

---

## データモデル

### MST_USER テーブル

```sql
CREATE TABLE MST_USER (
    employee_no VARCHAR(20) PRIMARY KEY,  -- 社員番号
    name VARCHAR(20) NOT NULL,            -- 名前
    name_kana VARCHAR(20),                -- 名前（カナ）
    department VARCHAR(20),               -- 部署
    tel_no VARCHAR(20),                   -- 電話番号
    mail_address VARCHAR(50),             -- メールアドレス
    age INT,                              -- 年齢
    gender INT,                           -- 性別（0: 男性, 1: 女性, 2: その他）
    position VARCHAR(20),                 -- 役職
    account_level BOOLEAN DEFAULT FALSE NOT NULL, -- アカウントレベル（管理者フラグ）
    retire_date DATE,                     -- 退職日
    register_date DATE NOT NULL,          -- 登録日
    update_date DATE,                     -- 更新日
    delete_flag BOOLEAN DEFAULT FALSE NOT NULL
);

-- メールアドレスの一意制約
ALTER TABLE MST_USER ADD CONSTRAINT employees_mail_address_uk UNIQUE (mail_address);
```

### フィールド説明

| フィールド名 | 型 | 必須 | 説明 |
|------------|----|----|------|
| `employee_no` | VARCHAR(20) | ○ | 社員番号（手動入力、一意） |
| `name` | VARCHAR(20) | ○ | 名前 |
| `name_kana` | VARCHAR(20) | × | 名前（カナ） |
| `department` | VARCHAR(20) | × | 部署 |
| `tel_no` | VARCHAR(20) | × | 電話番号 |
| `mail_address` | VARCHAR(50) | × | メールアドレス（一意） |
| `age` | INT | × | 年齢 |
| `gender` | INT | × | 性別（0: 男性, 1: 女性, 2: その他） |
| `position` | VARCHAR(20) | × | 役職 |
| `account_level` | BOOLEAN | ○ | アカウントレベル（true: 管理者, false: 一般ユーザー） |
| `retire_date` | DATE | × | 退職日 |
| `register_date` | DATE | ○ | 登録日 |
| `update_date` | DATE | × | 更新日 |
| `delete_flag` | BOOLEAN | ○ | 削除フラグ（論理削除） |

---

## ビジネスロジック

### ユーザー登録時のルール

1. **社員番号の重複チェック**
   - 既存の社員番号と重複していないこと

2. **必須項目のチェック**
   - `employee_no`, `name` は必須

3. **メールアドレスの一意性**
   - 同じメールアドレスは登録できない

4. **デフォルト値の設定**
   - `account_level`: false（一般ユーザー）
   - `delete_flag`: false
   - `register_date`: 現在日時

### ユーザー編集時のルール

1. **更新日時の自動設定**
   - `update_date` を現在日時に自動更新

2. **退職日の設定**
   - 退職日が設定されたユーザーはログイン不可

3. **管理者権限の変更**
   - 自分自身の管理者権限は削除できない（システムに管理者が必要）

### ユーザー削除時のルール

1. **論理削除**
   - 物理削除ではなく、`delete_flag = true` にする

2. **削除前チェック**
   - 機器を貸出中のユーザーは削除できない
   - 最後の管理者は削除できない
   - 確認ダイアログを表示

---

## API仕様

### 1. ユーザー一覧取得

**エンドポイント**: `GET /api/users`

**クエリパラメータ**:
- `search` (string, optional): 検索キーワード
- `filter` (string, optional): フィルター条件（`admin`, `general`, `retired`）
- `page` (int, optional): ページ番号（デフォルト: 1）
- `limit` (int, optional): 1ページあたりの件数（デフォルト: 50）

**レスポンス**:
```json
{
  "users": [
    {
      "employee_no": "E001",
      "name": "山田太郎",
      "name_kana": "ヤマダタロウ",
      "department": "開発部",
      "tel_no": "090-1234-5678",
      "mail_address": "yamada@example.com",
      "age": 30,
      "gender": 0,
      "position": "エンジニア",
      "account_level": true,
      "retire_date": null,
      "has_rental": false
    }
  ],
  "total": 50,
  "page": 1,
  "totalPages": 1
}
```

### 2. ユーザー詳細取得

**エンドポイント**: `GET /api/users/{employee_no}`

**パスパラメータ**:
- `employee_no` (string, required): 社員番号

**レスポンス**:
```json
{
  "employee_no": "E001",
  "name": "山田太郎",
  "name_kana": "ヤマダタロウ",
  "department": "開発部",
  "tel_no": "090-1234-5678",
  "mail_address": "yamada@example.com",
  "age": 30,
  "gender": 0,
  "position": "エンジニア",
  "account_level": true,
  "retire_date": null,
  "register_date": "2024-01-01",
  "update_date": "2024-11-15",
  "rental_history": [
    {
      "rental_id": 123,
      "asset_no": "PC-001",
      "machine_name": "Dell Precision 5570",
      "rental_date": "2024-11-01",
      "return_due_date": "2024-11-15",
      "return_date": "2024-11-14"
    }
  ],
  "current_rentals": [
    {
      "rental_id": 456,
      "asset_no": "PC-002",
      "machine_name": "HP ZBook Studio G9",
      "rental_date": "2024-11-10",
      "return_due_date": "2024-11-24"
    }
  ]
}
```

### 3. ユーザー新規登録

**エンドポイント**: `POST /api/users`

**リクエストボディ**:
```json
{
  "employee_no": "E001",
  "name": "山田太郎",
  "name_kana": "ヤマダタロウ",
  "department": "開発部",
  "tel_no": "090-1234-5678",
  "mail_address": "yamada@example.com",
  "age": 30,
  "gender": 0,
  "position": "エンジニア",
  "account_level": false
}
```

**レスポンス**:
```json
{
  "employee_no": "E001",
  "name": "山田太郎",
  "name_kana": "ヤマダタロウ",
  "department": "開発部",
  "tel_no": "090-1234-5678",
  "mail_address": "yamada@example.com",
  "age": 30,
  "gender": 0,
  "position": "エンジニア",
  "account_level": false,
  "register_date": "2024-11-17"
}
```

### 4. ユーザー更新

**エンドポイント**: `PUT /api/users/{employee_no}`

**パスパラメータ**:
- `employee_no` (string, required): 社員番号

**リクエストボディ**:
```json
{
  "name": "山田太郎",
  "name_kana": "ヤマダタロウ",
  "department": "技術部",
  "tel_no": "090-1234-5678",
  "mail_address": "yamada@example.com",
  "age": 31,
  "gender": 0,
  "position": "シニアエンジニア",
  "account_level": true,
  "retire_date": null
}
```

**レスポンス**:
```json
{
  "employee_no": "E001",
  "name": "山田太郎",
  "name_kana": "ヤマダタロウ",
  "department": "技術部",
  "tel_no": "090-1234-5678",
  "mail_address": "yamada@example.com",
  "age": 31,
  "gender": 0,
  "position": "シニアエンジニア",
  "account_level": true,
  "retire_date": null,
  "update_date": "2024-11-17"
}
```

### 5. ユーザー削除

**エンドポイント**: `DELETE /api/users/{employee_no}`

**パスパラメータ**:
- `employee_no` (string, required): 社員番号

**レスポンス**:
```json
{
  "message": "ユーザーを削除しました",
  "employee_no": "E001"
}
```

---

## フロントエンド実装

### ユーザー一覧画面 (UserList.jsx)

```javascript
/**
 * ユーザー一覧コンポーネント
 * 
 * 機能:
 * 1. ユーザー一覧の表示（DataGrid または Virtuoso）
 * 2. 検索・フィルター機能
 * 3. ページネーション
 * 4. 新規登録ボタン（管理者のみ）
 * 5. 詳細・編集・削除ボタン
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataGrid } from '@mui/x-data-grid';
import { Button, TextField, Select, MenuItem, Chip } from '@mui/material';
import Link from 'next/link';

export default function UserList({ initialData }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // データ取得
  const { data: users, isLoading } = useQuery({
    queryKey: ['users', searchTerm, filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filter !== 'all') params.append('filter', filter);
      
      const response = await fetch(`/api/users?${params}`);
      return response.json();
    },
    initialData
  });

  // 削除ミューテーション
  const deleteMutation = useMutation({
    mutationFn: (employee_no) => 
      fetch(`/api/users/${employee_no}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    }
  });

  const handleDelete = (employee_no, has_rental) => {
    if (has_rental) {
      alert('貸出中の機器があるため削除できません');
      return;
    }

    if (confirm('本当に削除しますか?')) {
      deleteMutation.mutate(employee_no);
    }
  };

  // DataGrid のカラム定義
  const columns = [
    { field: 'employee_no', headerName: '社員番号', width: 120 },
    { field: 'name', headerName: '名前', width: 150 },
    { field: 'name_kana', headerName: 'フリガナ', width: 150 },
    { field: 'department', headerName: '部署', width: 120 },
    { field: 'position', headerName: '役職', width: 120 },
    { 
      field: 'account_level', 
      headerName: '権限', 
      width: 100,
      renderCell: (params) => (
        params.value ? 
          <Chip label="管理者" color="primary" size="small" /> :
          <Chip label="一般" size="small" />
      )
    },
    { 
      field: 'retire_date', 
      headerName: 'ステータス', 
      width: 100,
      renderCell: (params) => (
        params.value ? 
          <Chip label="退職" color="error" size="small" /> :
          <Chip label="在職" color="success" size="small" />
      )
    },
    {
      field: 'actions',
      headerName: '操作',
      width: 200,
      renderCell: (params) => (
        <>
          <Link href={`/users/${params.row.employee_no}`}>
            <Button size="small">詳細</Button>
          </Link>
          <Link href={`/users/${params.row.employee_no}`}>
            <Button size="small">編集</Button>
          </Link>
          <Button 
            size="small" 
            color="error"
            onClick={() => handleDelete(
              params.row.employee_no, 
              params.row.has_rental
            )}
            disabled={params.row.has_rental}
          >
            削除
          </Button>
        </>
      )
    }
  ];

  return (
    <div>
      <h1>ユーザー一覧</h1>

      {/* 検索・フィルター */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <TextField
          label="検索"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="社員番号、名前、部署..."
        />
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <MenuItem value="all">すべて</MenuItem>
          <MenuItem value="admin">管理者のみ</MenuItem>
          <MenuItem value="general">一般ユーザーのみ</MenuItem>
          <MenuItem value="retired">退職者</MenuItem>
        </Select>

        {/* 新規登録ボタン */}
        <Link href="/users/new">
          <Button variant="contained">新規登録</Button>
        </Link>
      </div>

      {/* ユーザー一覧テーブル */}
      <DataGrid
        rows={users?.users || []}
        columns={columns}
        getRowId={(row) => row.employee_no}
        loading={isLoading}
        pageSize={50}
        rowsPerPageOptions={[25, 50, 100]}
        autoHeight
      />
    </div>
  );
}
```

### ユーザーフォームコンポーネント (UserForm.jsx)

```javascript
/**
 * ユーザー登録・編集フォーム
 * 
 * 機能:
 * 1. 新規登録または編集モード
 * 2. React Hook Form でフォーム管理
 * 3. Zod でバリデーション
 * 4. 楽観的更新
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  TextField, Button, Select, MenuItem, 
  FormControlLabel, Checkbox, FormControl, InputLabel 
} from '@mui/material';
import { useRouter } from 'next/navigation';

// バリデーションスキーマ
const userSchema = z.object({
  employee_no: z.string().min(1, '社員番号は必須です'),
  name: z.string().min(1, '名前は必須です'),
  name_kana: z.string().optional(),
  department: z.string().optional(),
  tel_no: z.string().optional(),
  mail_address: z.string().email('メールアドレスの形式が正しくありません').optional(),
  age: z.number().min(18, '18歳以上である必要があります').optional(),
  gender: z.number().min(0).max(2).optional(),
  position: z.string().optional(),
  account_level: z.boolean(),
  retire_date: z.string().optional()
});

export default function UserForm({ user = null }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!user;

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: user || {
      account_level: false
    }
  });

  // 登録・更新ミューテーション
  const mutation = useMutation({
    mutationFn: async (data) => {
      const url = isEdit 
        ? `/api/users/${user.employee_no}` 
        : '/api/users';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '保存に失敗しました');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      router.push('/users');
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="社員番号"
        {...register('employee_no')}
        error={!!errors.employee_no}
        helperText={errors.employee_no?.message}
        disabled={isEdit}
        fullWidth
        margin="normal"
      />

      <TextField
        label="名前"
        {...register('name')}
        error={!!errors.name}
        helperText={errors.name?.message}
        fullWidth
        margin="normal"
      />

      <TextField
        label="フリガナ"
        {...register('name_kana')}
        fullWidth
        margin="normal"
      />

      <TextField
        label="部署"
        {...register('department')}
        fullWidth
        margin="normal"
      />

      <TextField
        label="電話番号"
        {...register('tel_no')}
        fullWidth
        margin="normal"
      />

      <TextField
        label="メールアドレス"
        type="email"
        {...register('mail_address')}
        error={!!errors.mail_address}
        helperText={errors.mail_address?.message}
        fullWidth
        margin="normal"
      />

      <TextField
        label="年齢"
        type="number"
        {...register('age', { valueAsNumber: true })}
        error={!!errors.age}
        helperText={errors.age?.message}
        fullWidth
        margin="normal"
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>性別</InputLabel>
        <Select {...register('gender', { valueAsNumber: true })} defaultValue={0}>
          <MenuItem value={0}>男性</MenuItem>
          <MenuItem value={1}>女性</MenuItem>
          <MenuItem value={2}>その他</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="役職"
        {...register('position')}
        fullWidth
        margin="normal"
      />

      <FormControlLabel
        control={<Checkbox {...register('account_level')} />}
        label="管理者権限"
      />

      {isEdit && (
        <TextField
          label="退職日"
          type="date"
          {...register('retire_date')}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin="normal"
        />
      )}

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={mutation.isLoading}
        >
          {isEdit ? '更新' : '登録'}
        </Button>
        <Button 
          type="button" 
          onClick={() => router.back()}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
```

---

## バックエンド実装

### UsersController.cs

```csharp
/**
 * ユーザー管理コントローラー
 * 
 * エンドポイント:
 * - GET /api/users: ユーザー一覧取得
 * - GET /api/users/{employee_no}: ユーザー詳細取得
 * - POST /api/users: ユーザー新規登録
 * - PUT /api/users/{employee_no}: ユーザー更新
 * - DELETE /api/users/{employee_no}: ユーザー削除
 */

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly UserService _userService;

    public UsersController(
        IUserRepository userRepository, 
        UserService userService)
    {
        _userRepository = userRepository;
        _userService = userService;
    }

    // GET: api/users
    [HttpGet]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search,
        [FromQuery] string? filter,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 50)
    {
        var users = await _userService.GetUsersAsync(search, filter, page, limit);
        return Ok(users);
    }

    // GET: api/users/{employee_no}
    [HttpGet("{employee_no}")]
    public async Task<IActionResult> GetUser(string employee_no)
    {
        var user = await _userService.GetUserDetailAsync(employee_no);
        
        if (user == null)
        {
            return NotFound(new { message = "ユーザーが見つかりません" });
        }

        return Ok(user);
    }

    // POST: api/users
    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] UserDTO dto)
    {
        try
        {
            var user = await _userService.CreateUserAsync(dto);
            return CreatedAtAction(nameof(GetUser), new { employee_no = user.EmployeeNo }, user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PUT: api/users/{employee_no}
    [HttpPut("{employee_no}")]
    public async Task<IActionResult> UpdateUser(string employee_no, [FromBody] UserDTO dto)
    {
        try
        {
            var user = await _userService.UpdateUserAsync(employee_no, dto);
            
            if (user == null)
            {
                return NotFound(new { message = "ユーザーが見つかりません" });
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // DELETE: api/users/{employee_no}
    [HttpDelete("{employee_no}")]
    public async Task<IActionResult> DeleteUser(string employee_no)
    {
        try
        {
            var success = await _userService.DeleteUserAsync(employee_no);
            
            if (!success)
            {
                return BadRequest(new { message = "貸出中の機器があるため削除できません" });
            }

            return Ok(new { message = "ユーザーを削除しました", employee_no });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
```

### UserService.cs

```csharp
/**
 * ユーザー管理サービス
 * 
 * ビジネスロジック:
 * - ユーザーの検索・フィルター
 * - バリデーション
 * - 削除前チェック
 */

public class UserService
{
    private readonly IUserRepository _userRepository;
    private readonly IRentalRepository _rentalRepository;

    public UserService(IUserRepository userRepository, IRentalRepository rentalRepository)
    {
        _userRepository = userRepository;
        _rentalRepository = rentalRepository;
    }

    public async Task<UserListResult> GetUsersAsync(
        string? search, 
        string? filter, 
        int page, 
        int limit)
    {
        var query = _userRepository.GetAll()
            .Where(u => !u.DeleteFlag);

        // 検索
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(u => 
                u.EmployeeNo.Contains(search) ||
                u.Name.Contains(search) ||
                u.Department.Contains(search));
        }

        // フィルター
        if (filter == "admin")
        {
            query = query.Where(u => u.AccountLevel);
        }
        else if (filter == "general")
        {
            query = query.Where(u => !u.AccountLevel);
        }
        else if (filter == "retired")
        {
            query = query.Where(u => u.RetireDate.HasValue);
        }

        var total = await query.CountAsync();
        var users = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

        // 貸出中の機器があるかチェック
        var usersWithRentalFlag = users.Select(u => new UserListDTO
        {
            EmployeeNo = u.EmployeeNo,
            Name = u.Name,
            NameKana = u.NameKana,
            Department = u.Department,
            Position = u.Position,
            AccountLevel = u.AccountLevel,
            RetireDate = u.RetireDate,
            HasRental = _rentalRepository.HasActiveRentals(u.EmployeeNo).Result
        }).ToList();

        return new UserListResult
        {
            Users = usersWithRentalFlag,
            Total = total,
            Page = page,
            TotalPages = (int)Math.Ceiling(total / (double)limit)
        };
    }

    public async Task<UserDetailDTO> GetUserDetailAsync(string employee_no)
    {
        var user = await _userRepository.GetByEmployeeNoAsync(employee_no);
        
        if (user == null || user.DeleteFlag)
        {
            return null;
        }

        // 貸出履歴を取得
        var rentalHistory = await _rentalRepository.GetHistoryByEmployeeNoAsync(employee_no);
        var currentRentals = await _rentalRepository.GetCurrentRentalsByEmployeeNoAsync(employee_no);

        return new UserDetailDTO
        {
            EmployeeNo = user.EmployeeNo,
            Name = user.Name,
            NameKana = user.NameKana,
            Department = user.Department,
            TelNo = user.TelNo,
            MailAddress = user.MailAddress,
            Age = user.Age,
            Gender = user.Gender,
            Position = user.Position,
            AccountLevel = user.AccountLevel,
            RetireDate = user.RetireDate,
            RegisterDate = user.RegisterDate,
            UpdateDate = user.UpdateDate,
            RentalHistory = rentalHistory,
            CurrentRentals = currentRentals
        };
    }

    public async Task<User> CreateUserAsync(UserDTO dto)
    {
        // 重複チェック
        var existing = await _userRepository.GetByEmployeeNoAsync(dto.EmployeeNo);
        if (existing != null)
        {
            throw new Exception("この社員番号は既に登録されています");
        }

        // メールアドレス重複チェック
        if (!string.IsNullOrEmpty(dto.MailAddress))
        {
            var existingEmail = await _userRepository.GetByMailAddressAsync(dto.MailAddress);
            if (existingEmail != null)
            {
                throw new Exception("このメールアドレスは既に登録されています");
            }
        }

        var user = new User
        {
            EmployeeNo = dto.EmployeeNo,
            Name = dto.Name,
            NameKana = dto.NameKana,
            Department = dto.Department,
            TelNo = dto.TelNo,
            MailAddress = dto.MailAddress,
            Age = dto.Age,
            Gender = dto.Gender,
            Position = dto.Position,
            AccountLevel = dto.AccountLevel,
            RegisterDate = DateTime.Today,
            DeleteFlag = false
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return user;
    }

    public async Task<User> UpdateUserAsync(string employee_no, UserDTO dto)
    {
        var user = await _userRepository.GetByEmployeeNoAsync(employee_no);
        
        if (user == null || user.DeleteFlag)
        {
            return null;
        }

        user.Name = dto.Name;
        user.NameKana = dto.NameKana;
        user.Department = dto.Department;
        user.TelNo = dto.TelNo;
        user.MailAddress = dto.MailAddress;
        user.Age = dto.Age;
        user.Gender = dto.Gender;
        user.Position = dto.Position;
        user.AccountLevel = dto.AccountLevel;
        user.RetireDate = dto.RetireDate;
        user.UpdateDate = DateTime.Today;

        await _userRepository.SaveChangesAsync();

        return user;
    }

    public async Task<bool> DeleteUserAsync(string employee_no)
    {
        var user = await _userRepository.GetByEmployeeNoAsync(employee_no);
        
        if (user == null || user.DeleteFlag)
        {
            return false;
        }

        // 貸出中チェック
        var hasActiveRentals = await _rentalRepository.HasActiveRentals(employee_no);
        if (hasActiveRentals)
        {
            return false;
        }

        user.DeleteFlag = true;
        await _userRepository.SaveChangesAsync();

        return true;
    }
}
```

---

## まとめ

ユーザー管理機能は、管理者のみがアクセス可能な機能であり、システムの利用者を管理する重要な機能です。権限管理、貸出履歴の表示、削除制限など、実用的な機能を備えています。
