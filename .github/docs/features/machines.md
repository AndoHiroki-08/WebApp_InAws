# 機器管理機能設計書

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

機器管理機能は、レンタル可能な機器（PC等）の登録・編集・削除・一覧表示・詳細表示を行う機能です。

### 主な機能
1. **機器一覧表示**: すべての機器を一覧で表示
2. **機器詳細表示**: 機器の詳細情報と貸出履歴を表示
3. **機器新規登録**: 新しい機器を登録（管理者のみ）
4. **機器編集**: 既存の機器情報を編集（管理者のみ）
5. **機器削除**: 機器を論理削除（管理者のみ）
6. **検索・フィルター**: 条件に基づいた機器の絞り込み
7. **貸出状況確認**: 機器の貸出中/利用可能ステータス

---

## 画面一覧

| 画面名 | パス | 権限 |
|--------|------|------|
| 機器一覧 | `/machines` | 全ユーザー（閲覧）、管理者（全操作） |
| 機器詳細 | `/machines/[asset_no]` | 全ユーザー（閲覧）、管理者（編集・削除） |
| 機器新規登録 | `/machines/new` | 管理者のみ |

---

## データモデル

### MST_DEVICE テーブル

```sql
CREATE TABLE MST_DEVICE (
    asset_no VARCHAR(20) PRIMARY KEY DEFAULT ('PC-' || LPAD(nextval('device_asset_sequence')::TEXT, 3, '0')),
    maker VARCHAR(20),           -- 製造元
    os VARCHAR(20),              -- OS
    memory VARCHAR(10),          -- メモリ
    capacity VARCHAR(10),        -- ストレージ容量
    has_gpu BOOLEAN DEFAULT FALSE, -- GPUの有無
    location VARCHAR(30),        -- 設置場所
    broken_flag BOOLEAN DEFAULT FALSE, -- 故障フラグ
    lease_start_date DATE,       -- リース開始日
    lease_end_date DATE,         -- リース終了日
    note VARCHAR(100),           -- 備考
    register_date DATE,          -- 登録日
    update_date DATE,            -- 更新日
    inventory_date DATE,         -- 棚卸日
    delete_flag BOOLEAN DEFAULT FALSE
);
```

### フィールド説明
| フィールド名       | 型          | 必須 | 説明                                        |
|-------------------|-------------|------|---------------------------------------------|
| `asset_no`        | VARCHAR(20) | ○    | 資産番号（自動採番: PC-001, PC-002, ...）    |
| `maker`           | VARCHAR(20) | ○    | 製造元（例: Dell, HP, Lenovo）              |
| `os`              | VARCHAR(20) | ○    | OS（例: Windows 11, macOS, Ubuntu）        |
| `memory`          | VARCHAR(10) | ○    | メモリ容量（例: 8GB, 16GB, 32GB）           |
| `capacity`        | VARCHAR(10) | ○    | ストレージ容量（例: 256GB, 512GB, 1TB）      |
| `has_gpu`         | BOOLEAN     | ○    | GPU搭載の有無                               |
| `location`        | VARCHAR(30) | ×    | 設置場所（例: 第1倉庫、B棟3F）               |
| `broken_flag`     | BOOLEAN     | ○    | 故障フラグ（true: 故障中）                   |
| `lease_start_date`| DATE        | ×    | リース開始日                                |
| `lease_end_date`  | DATE        | ×    | リース終了日                                |
| `note`            | VARCHAR(100)| ×    | 備考                                        |
| `register_date`   | DATE        | ○    | 登録日                                      |
| `update_date`     | DATE        | ×    | 更新日                                      |
| `inventory_date`  | DATE        | ×    | 棚卸日                                      |
| `delete_flag`     | BOOLEAN     | ○    | 削除フラグ（論理削除）                       |

---

## ビジネスロジック

### 機器登録時のルール

1. **資産番号の自動採番**
   - `PC-001`, `PC-002`, ... の形式で自動生成
   - シーケンス `device_asset_sequence` を使用

2. **必須項目のチェック**
   - `maker`, `os`, `memory`, `capacity` は必須

3. **デフォルト値の設定**
   - `has_gpu`: false
   - `broken_flag`: false
   - `delete_flag`: false
   - `register_date`: 現在日時

4. **リース期間の検証**
   - `lease_start_date` が指定されている場合、`lease_end_date` も必須
   - `lease_end_date` は `lease_start_date` より後でなければならない

### 機器編集時のルール

1. **更新日時の自動設定**
   - `update_date` を現在日時に自動更新

2. **貸出中の機器の制限**
   - 貸出中の機器は削除できない
   - 貸出中でも編集は可能（故障フラグ等の更新のため）

3. **故障フラグの設定**
   - 故障中 (`broken_flag = true`) の機器は貸出不可

### 機器削除時のルール

1. **論理削除**
   - 物理削除ではなく、`delete_flag = true` にする
   - データベースから実際には削除しない

2. **削除前チェック**
   - 貸出中の機器は削除できない
   - 確認ダイアログを表示

---

## API仕様

### 1. 機器一覧取得

**エンドポイント**: `GET /api/machines`

**クエリパラメータ**:
- `search` (string, optional): 検索キーワード
- `filter` (string, optional): フィルター条件（`available`, `rented`, `broken`）
- `page` (int, optional): ページ番号（デフォルト: 1）
- `limit` (int, optional): 1ページあたりの件数（デフォルト: 50）

**レスポンス**:
```json
{
  "machines": [
    {
      "asset_no": "PC-001",
      "maker": "Dell",
      "os": "Windows 11",
      "memory": "16GB",
      "capacity": "512GB",
      "has_gpu": true,
      "location": "第1倉庫",
      "broken_flag": false,
      "rental_flag": false,
      "lease_end_date": "2026-12-31"
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 2
}
```

### 2. 機器詳細取得

**エンドポイント**: `GET /api/machines/{asset_no}`

**パスパラメータ**:
- `asset_no` (string, required): 資産番号

**レスポンス**:
```json
{
  "asset_no": "PC-001",
  "maker": "Dell",
  "os": "Windows 11",
  "memory": "16GB",
  "capacity": "512GB",
  "has_gpu": true,
  "location": "第1倉庫",
  "broken_flag": false,
  "lease_start_date": "2024-01-01",
  "lease_end_date": "2026-12-31",
  "note": "GPU搭載モデル",
  "register_date": "2024-01-01",
  "update_date": "2024-06-15",
  "inventory_date": "2024-12-01",
  "rental_history": [
    {
      "rental_id": 123,
      "employee_no": "E001",
      "employee_name": "山田太郎",
      "rental_date": "2024-11-01",
      "return_due_date": "2024-11-15",
      "return_date": "2024-11-14"
    }
  ]
}
```

### 3. 機器新規登録

**エンドポイント**: `POST /api/machines`

**リクエストボディ**:
```json
{
  "maker": "Dell",
  "os": "Windows 11",
  "memory": "16GB",
  "capacity": "512GB",
  "has_gpu": true,
  "location": "第1倉庫",
  "lease_start_date": "2024-01-01",
  "lease_end_date": "2026-12-31",
  "note": "GPU搭載モデル"
}
```

**レスポンス**:
```json
{
  "asset_no": "PC-001",
  "maker": "Dell",
  "os": "Windows 11",
  "memory": "16GB",
  "capacity": "512GB",
  "has_gpu": true,
  "location": "第1倉庫",
  "broken_flag": false,
  "lease_start_date": "2024-01-01",
  "lease_end_date": "2026-12-31",
  "note": "GPU搭載モデル",
  "register_date": "2024-11-17"
}
```

### 4. 機器更新

**エンドポイント**: `PUT /api/machines/{asset_no}`

**パスパラメータ**:
- `asset_no` (string, required): 資産番号

**リクエストボディ**:
```json
{
  "maker": "Dell",
  "os": "Windows 11",
  "memory": "32GB",
  "capacity": "1TB",
  "has_gpu": true,
  "location": "第2倉庫",
  "broken_flag": false,
  "lease_start_date": "2024-01-01",
  "lease_end_date": "2026-12-31",
  "note": "メモリ増設済み"
}
```

**レスポンス**:
```json
{
  "asset_no": "PC-001",
  "maker": "Dell",
  "os": "Windows 11",
  "memory": "32GB",
  "capacity": "1TB",
  "has_gpu": true,
  "location": "第2倉庫",
  "broken_flag": false,
  "lease_start_date": "2024-01-01",
  "lease_end_date": "2026-12-31",
  "note": "メモリ増設済み",
  "update_date": "2024-11-17"
}
```

### 5. 機器削除

**エンドポイント**: `DELETE /api/machines/{asset_no}`

**パスパラメータ**:
- `asset_no` (string, required): 資産番号

**レスポンス**:
```json
{
  "message": "機器を削除しました",
  "asset_no": "PC-001"
}
```

---

## フロントエンド実装

### 機器一覧画面 (MachineList.jsx)

```javascript
/**
 * 機器一覧コンポーネント
 * 
 * 機能:
 * 1. 機器一覧の表示（DataGrid または Virtuoso）
 * 2. 検索・フィルター機能
 * 3. ページネーション
 * 4. 新規登録ボタン（管理者のみ）
 * 5. 詳細・編集・削除ボタン
 * 
 * 状態管理:
 * - React Query: データ取得・キャッシュ
 * - useState: 検索キーワード、フィルター条件
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataGrid } from '@mui/x-data-grid';
import { Button, TextField, Select, MenuItem } from '@mui/material';
import { useAuthStore } from '@/lib/stores/authStore';
import Link from 'next/link';

export default function MachineList({ initialData }) {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // データ取得
  const { data: machines, isLoading } = useQuery({
    queryKey: ['machines', searchTerm, filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filter !== 'all') params.append('filter', filter);
      
      const response = await fetch(`/api/machines?${params}`);
      return response.json();
    },
    initialData
  });

  // 削除ミューテーション
  const deleteMutation = useMutation({
    mutationFn: (asset_no) => 
      fetch(`/api/machines/${asset_no}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['machines']);
    }
  });

  const handleDelete = (asset_no) => {
    if (confirm('本当に削除しますか?')) {
      deleteMutation.mutate(asset_no);
    }
  };

  // DataGrid のカラム定義
  const columns = [
    { field: 'asset_no', headerName: '資産番号', width: 120 },
    { field: 'maker', headerName: 'メーカー', width: 150 },
    { field: 'os', headerName: 'OS', width: 150 },
    { field: 'memory', headerName: 'メモリ', width: 100 },
    { field: 'capacity', headerName: 'ストレージ', width: 120 },
    { 
      field: 'has_gpu', 
      headerName: 'GPU', 
      width: 80,
      renderCell: (params) => params.value ? '有' : '無'
    },
    { field: 'location', headerName: '設置場所', width: 150 },
    {
      field: 'rental_flag',
      headerName: 'ステータス',
      width: 100,
      renderCell: (params) => (
        params.row.broken_flag ? '故障中' :
        params.value ? '貸出中' : '利用可能'
      )
    },
    {
      field: 'actions',
      headerName: '操作',
      width: 250,
      renderCell: (params) => (
        <>
          <Link href={`/machines/${params.row.asset_no}`}>
            <Button size="small">詳細</Button>
          </Link>
          {isAdmin() && (
            <>
              <Link href={`/machines/${params.row.asset_no}`}>
                <Button size="small">編集</Button>
              </Link>
              <Button 
                size="small" 
                color="error"
                onClick={() => handleDelete(params.row.asset_no)}
                disabled={params.row.rental_flag}
              >
                削除
              </Button>
            </>
          )}
        </>
      )
    }
  ];

  return (
    <div>
      <h1>機器一覧</h1>

      {/* 検索・フィルター */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <TextField
          label="検索"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="資産番号、メーカー、OS..."
        />
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <MenuItem value="all">すべて</MenuItem>
          <MenuItem value="available">利用可能</MenuItem>
          <MenuItem value="rented">貸出中</MenuItem>
          <MenuItem value="broken">故障中</MenuItem>
        </Select>

        {/* 新規登録ボタン（管理者のみ） */}
        {isAdmin() && (
          <Link href="/machines/new">
            <Button variant="contained">新規登録</Button>
          </Link>
        )}
      </div>

      {/* 機器一覧テーブル */}
      <DataGrid
        rows={machines?.machines || []}
        columns={columns}
        getRowId={(row) => row.asset_no}
        loading={isLoading}
        pageSize={50}
        rowsPerPageOptions={[25, 50, 100]}
        autoHeight
      />
    </div>
  );
}
```

### 機器フォームコンポーネント (MachineForm.jsx)

```javascript
/**
 * 機器登録・編集フォーム
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
import { TextField, Button, Checkbox, FormControlLabel } from '@mui/material';
import { useRouter } from 'next/navigation';

// バリデーションスキーマ
const machineSchema = z.object({
  maker: z.string().min(1, 'メーカーは必須です'),
  os: z.string().min(1, 'OSは必須です'),
  memory: z.string().min(1, 'メモリは必須です'),
  capacity: z.string().min(1, 'ストレージは必須です'),
  has_gpu: z.boolean(),
  location: z.string().optional(),
  lease_start_date: z.string().optional(),
  lease_end_date: z.string().optional(),
  note: z.string().max(100, '備考は100文字以内です').optional()
});

export default function MachineForm({ machine = null }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!machine;

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(machineSchema),
    defaultValues: machine || {
      has_gpu: false
    }
  });

  // 登録・更新ミューテーション
  const mutation = useMutation({
    mutationFn: async (data) => {
      const url = isEdit 
        ? `/api/machines/${machine.asset_no}` 
        : '/api/machines';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['machines']);
      router.push('/machines');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="メーカー"
        {...register('maker')}
        error={!!errors.maker}
        helperText={errors.maker?.message}
        fullWidth
        margin="normal"
      />

      <TextField
        label="OS"
        {...register('os')}
        error={!!errors.os}
        helperText={errors.os?.message}
        fullWidth
        margin="normal"
      />

      <TextField
        label="メモリ"
        {...register('memory')}
        error={!!errors.memory}
        helperText={errors.memory?.message}
        fullWidth
        margin="normal"
      />

      <TextField
        label="ストレージ"
        {...register('capacity')}
        error={!!errors.capacity}
        helperText={errors.capacity?.message}
        fullWidth
        margin="normal"
      />

      <FormControlLabel
        control={<Checkbox {...register('has_gpu')} />}
        label="GPU搭載"
      />

      <TextField
        label="設置場所"
        {...register('location')}
        fullWidth
        margin="normal"
      />

      <TextField
        label="リース開始日"
        type="date"
        {...register('lease_start_date')}
        InputLabelProps={{ shrink: true }}
        fullWidth
        margin="normal"
      />

      <TextField
        label="リース終了日"
        type="date"
        {...register('lease_end_date')}
        InputLabelProps={{ shrink: true }}
        fullWidth
        margin="normal"
      />

      <TextField
        label="備考"
        {...register('note')}
        error={!!errors.note}
        helperText={errors.note?.message}
        multiline
        rows={3}
        fullWidth
        margin="normal"
      />

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

### MachinesController.cs

```csharp
/**
 * 機器管理コントローラー
 * 
 * エンドポイント:
 * - GET /api/machines: 機器一覧取得
 * - GET /api/machines/{asset_no}: 機器詳細取得
 * - POST /api/machines: 機器新規登録
 * - PUT /api/machines/{asset_no}: 機器更新
 * - DELETE /api/machines/{asset_no}: 機器削除
 */

[ApiController]
[Route("api/[controller]")]
public class MachinesController : ControllerBase
{
    private readonly IMachineRepository _machineRepository;
    private readonly MachineService _machineService;

    public MachinesController(
        IMachineRepository machineRepository, 
        MachineService machineService)
    {
        _machineRepository = machineRepository;
        _machineService = machineService;
    }

    // GET: api/machines
    [HttpGet]
    public async Task<IActionResult> GetMachines(
        [FromQuery] string? search,
        [FromQuery] string? filter,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 50)
    {
        var machines = await _machineService.GetMachinesAsync(search, filter, page, limit);
        return Ok(machines);
    }

    // GET: api/machines/{asset_no}
    [HttpGet("{asset_no}")]
    public async Task<IActionResult> GetMachine(string asset_no)
    {
        var machine = await _machineService.GetMachineDetailAsync(asset_no);
        
        if (machine == null)
        {
            return NotFound(new { message = "機器が見つかりません" });
        }

        return Ok(machine);
    }

    // POST: api/machines
    [HttpPost]
    public async Task<IActionResult> CreateMachine([FromBody] MachineDTO dto)
    {
        // 管理者チェック（将来実装）
        // if (!User.IsInRole("Admin")) return Forbid();

        var machine = await _machineService.CreateMachineAsync(dto);
        return CreatedAtAction(nameof(GetMachine), new { asset_no = machine.AssetNo }, machine);
    }

    // PUT: api/machines/{asset_no}
    [HttpPut("{asset_no}")]
    public async Task<IActionResult> UpdateMachine(string asset_no, [FromBody] MachineDTO dto)
    {
        // 管理者チェック（将来実装）
        // if (!User.IsInRole("Admin")) return Forbid();

        var machine = await _machineService.UpdateMachineAsync(asset_no, dto);
        
        if (machine == null)
        {
            return NotFound(new { message = "機器が見つかりません" });
        }

        return Ok(machine);
    }

    // DELETE: api/machines/{asset_no}
    [HttpDelete("{asset_no}")]
    public async Task<IActionResult> DeleteMachine(string asset_no)
    {
        // 管理者チェック（将来実装）
        // if (!User.IsInRole("Admin")) return Forbid();

        var success = await _machineService.DeleteMachineAsync(asset_no);
        
        if (!success)
        {
            return BadRequest(new { message = "貸出中の機器は削除できません" });
        }

        return Ok(new { message = "機器を削除しました", asset_no });
    }
}
```

### MachineService.cs

```csharp
/**
 * 機器管理サービス
 * 
 * ビジネスロジック:
 * - 機器の検索・フィルター
 * - バリデーション
 * - 削除前チェック
 */

public class MachineService
{
    private readonly IMachineRepository _machineRepository;
    private readonly IRentalRepository _rentalRepository;

    public MachineService(IMachineRepository machineRepository, IRentalRepository rentalRepository)
    {
        _machineRepository = machineRepository;
        _rentalRepository = rentalRepository;
    }

    public async Task<MachineListResult> GetMachinesAsync(
        string? search, 
        string? filter, 
        int page, 
        int limit)
    {
        var query = _machineRepository.GetAll()
            .Where(m => !m.DeleteFlag);

        // 検索
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(m => 
                m.AssetNo.Contains(search) ||
                m.Maker.Contains(search) ||
                m.Os.Contains(search));
        }

        // フィルター
        if (filter == "available")
        {
            query = query.Where(m => !m.RentalFlag && !m.BrokenFlag);
        }
        else if (filter == "rented")
        {
            query = query.Where(m => m.RentalFlag);
        }
        else if (filter == "broken")
        {
            query = query.Where(m => m.BrokenFlag);
        }

        var total = await query.CountAsync();
        var machines = await query
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

        return new MachineListResult
        {
            Machines = machines,
            Total = total,
            Page = page,
            TotalPages = (int)Math.Ceiling(total / (double)limit)
        };
    }

    public async Task<MachineDetailDTO> GetMachineDetailAsync(string asset_no)
    {
        var machine = await _machineRepository.GetByAssetNoAsync(asset_no);
        
        if (machine == null || machine.DeleteFlag)
        {
            return null;
        }

        // 貸出履歴を取得
        var rentalHistory = await _rentalRepository.GetHistoryByAssetNoAsync(asset_no);

        return new MachineDetailDTO
        {
            AssetNo = machine.AssetNo,
            Maker = machine.Maker,
            Os = machine.Os,
            Memory = machine.Memory,
            Capacity = machine.Capacity,
            HasGpu = machine.HasGpu,
            Location = machine.Location,
            BrokenFlag = machine.BrokenFlag,
            LeaseStartDate = machine.LeaseStartDate,
            LeaseEndDate = machine.LeaseEndDate,
            Note = machine.Note,
            RegisterDate = machine.RegisterDate,
            UpdateDate = machine.UpdateDate,
            InventoryDate = machine.InventoryDate,
            RentalHistory = rentalHistory
        };
    }

    public async Task<Machine> CreateMachineAsync(MachineDTO dto)
    {
        var machine = new Machine
        {
            Maker = dto.Maker,
            Os = dto.Os,
            Memory = dto.Memory,
            Capacity = dto.Capacity,
            HasGpu = dto.HasGpu,
            Location = dto.Location,
            LeaseStartDate = dto.LeaseStartDate,
            LeaseEndDate = dto.LeaseEndDate,
            Note = dto.Note,
            RegisterDate = DateTime.Today,
            BrokenFlag = false,
            DeleteFlag = false
        };

        await _machineRepository.AddAsync(machine);
        await _machineRepository.SaveChangesAsync();

        return machine;
    }

    public async Task<Machine> UpdateMachineAsync(string asset_no, MachineDTO dto)
    {
        var machine = await _machineRepository.GetByAssetNoAsync(asset_no);
        
        if (machine == null || machine.DeleteFlag)
        {
            return null;
        }

        machine.Maker = dto.Maker;
        machine.Os = dto.Os;
        machine.Memory = dto.Memory;
        machine.Capacity = dto.Capacity;
        machine.HasGpu = dto.HasGpu;
        machine.Location = dto.Location;
        machine.LeaseStartDate = dto.LeaseStartDate;
        machine.LeaseEndDate = dto.LeaseEndDate;
        machine.Note = dto.Note;
        machine.UpdateDate = DateTime.Today;

        await _machineRepository.SaveChangesAsync();

        return machine;
    }

    public async Task<bool> DeleteMachineAsync(string asset_no)
    {
        var machine = await _machineRepository.GetByAssetNoAsync(asset_no);
        
        if (machine == null || machine.DeleteFlag)
        {
            return false;
        }

        // 貸出中チェック
        if (machine.RentalFlag)
        {
            return false;
        }

        machine.DeleteFlag = true;
        await _machineRepository.SaveChangesAsync();

        return true;
    }
}
```

---

## まとめ

機器管理機能は、CRUD操作を中心としたシンプルな設計ですが、権限管理、検索・フィルター、貸出状態の確認など、実用的な機能を備えています。
