# 貸出管理機能 詳細設計書

## 目次
- [機能概要](#機能概要)
- [画面仕様](#画面仕様)
- [API仕様](#api仕様)
- [データフロー](#データフロー)
- [ビジネスルール](#ビジネスルール)
- [バリデーション](#バリデーション)

---

## 機能概要

貸出管理機能は、機器の貸出・返却処理および履歴管理を行います。

### 主な機能
1. **貸出一覧表示**: すべての機器の貸出状況を一覧表示
2. **貸出処理**: 利用可能な機器を選択し、ユーザーに貸出
3. **返却処理**: 貸出中の機器を返却
4. **貸出履歴表示**: 過去の貸出履歴を表示
5. **リマインダー**: 返却期限間近・期限切れの通知

### アクセス権限
- **管理者**: すべての機能にアクセス可能
- **一般ユーザー**: すべての機能にアクセス可能（自分の貸出状況のみ表示）

---

## 画面仕様

### 1. 貸出一覧画面 (`/rentals`)

#### 目的
すべての機器の貸出状況を一覧表示

#### 表示項目
| 項目         | データ型      | 説明                     | 表示条件     |
|--------------|---------------|--------------------------|--------------|
| 資産番号     | VARCHAR(20)   | 機器の資産番号           | 常に表示     |
| メーカー     | VARCHAR(20)   | 機器のメーカー           | 常に表示     |
| OS           | VARCHAR(20)   | 機器のOS                 | 常に表示     |
| 貸出状況     | BOOLEAN       | 貸出中/利用可能          | 常に表示     |
| 貸出者       | VARCHAR(20)   | 貸出中のユーザー名       | 貸出中のみ   |
| 貸出日       | DATE          | 貸出開始日               | 貸出中のみ   |
| 返却予定日   | DATE          | 返却予定日               | 貸出中のみ   |
| ステータス   | -             | 利用可能/貸出中/期限間近/期限切れ | 常に表示     |
| 操作         | -             | 貸出/返却ボタン          | 常に表示     |

#### フィルター機能
- **すべて**: すべての機器を表示
- **利用可能**: 貸出可能な機器のみ
- **貸出中**: 貸出中の機器のみ
- **期限間近**: 返却期限まで3日以内
- **期限切れ**: 返却期限を過ぎている機器

#### 検索機能
- 資産番号、メーカー、OS、貸出者名で検索

#### ソート機能
- 資産番号、貸出日、返却予定日でソート（昇順/降順）

#### 操作
- **貸出ボタン**: 利用可能な機器 → `/rentals/[asset_no]` へ遷移
- **返却ボタン**: 貸出中の機器 → 返却確認ダイアログ → 返却処理

#### コンポーネント構成
```
RentalListPage (RSC)
  └── RentalList (Client)
      ├── SearchBar
      ├── FilterTabs
      └── DataGrid / Virtuoso
          └── RentalCard (Mobile)
```

---

### 2. 貸出・返却画面 (`/rentals/[asset_no]`)

#### 目的
機器の貸出または返却処理

#### 貸出時の表示項目
| 項目 | データ型 | 必須 | 説明 |
|------|---------|------|------|
| 資産番号 | VARCHAR(20) | - | 表示のみ |
| メーカー | VARCHAR(20) | - | 表示のみ |
| OS | VARCHAR(20) | - | 表示のみ |
| メモリ | VARCHAR(10) | - | 表示のみ |
| ストレージ | VARCHAR(10) | - | 表示のみ |
| GPU有無 | BOOLEAN | - | 表示のみ |
| 設置場所 | VARCHAR(30) | - | 表示のみ |
| 貸出者 | VARCHAR(20) | ✓ | ユーザー選択ダイアログ |
| 返却予定日 | DATE | ✓ | 日付ピッカー |
| 備考 | VARCHAR(100) | - | テキストエリア |

#### 返却時の表示項目
| 項目 | データ型 | 説明 |
|------|---------|------|
| 資産番号 | VARCHAR(20) | 表示のみ |
| メーカー | VARCHAR(20) | 表示のみ |
| OS | VARCHAR(20) | 表示のみ |
| 貸出者 | VARCHAR(20) | 表示のみ |
| 貸出日 | DATE | 表示のみ |
| 返却予定日 | DATE | 表示のみ |
| 備考 | VARCHAR(100) | 表示のみ（貸出時の備考） |

#### 処理フロー（貸出）
```
1. ユーザー選択ダイアログを開く
   ↓
2. ユーザーを検索・選択
   ↓
3. 返却予定日を選択
   ↓
4. 備考を入力（任意）
   ↓
5. 貸出ボタンをクリック
   ↓
6. 確認ダイアログ表示
   ↓
7. API POST /api/rentals
   ↓
8. 成功 → /rentals へリダイレクト
   失敗 → エラーメッセージ表示
```

#### 処理フロー（返却）
```
1. 返却ボタンをクリック
   ↓
2. 確認ダイアログ表示
   ↓
3. API PUT /api/rentals/{rental_id}/return
   ↓
4. 成功 → /rentals へリダイレクト
   失敗 → エラーメッセージ表示
```

#### コンポーネント構成
```
RentalPage (RSC)
  └── RentalForm (Client)
      ├── MachineInfo (表示のみ)
      ├── UserSelectDialog
      ├── DatePicker
      ├── TextArea (備考)
      └── ConfirmDialog
```

---

### 3. 貸出履歴画面 (`/rentals/history`)

#### 目的
過去の貸出履歴を表示

#### 表示項目
| 項目 | データ型 | 説明 |
|------|---------|------|
| 貸出ID | INT | 貸出レコードのID |
| 資産番号 | VARCHAR(20) | 機器の資産番号 |
| メーカー | VARCHAR(20) | 機器のメーカー |
| OS | VARCHAR(20) | 機器のOS |
| 貸出者 | VARCHAR(20) | 貸出したユーザー名 |
| 貸出日 | DATE | 貸出開始日 |
| 返却予定日 | DATE | 返却予定日 |
| 返却日 | DATE | 実際の返却日 |
| 延滞日数 | INT | 返却予定日と返却日の差分 |
| 備考 | VARCHAR(100) | 貸出時の備考 |

#### フィルター機能
- **すべて**: すべての履歴
- **延滞あり**: 返却予定日を過ぎて返却
- **期間内返却**: 期間内に返却

#### 検索機能
- 資産番号、貸出者名、貸出日、返却日で検索

#### ソート機能
- 貸出日、返却日、延滞日数でソート（昇順/降順）

#### エクスポート機能
- CSV形式でエクスポート（管理者のみ）

#### コンポーネント構成
```
RentalHistoryPage (RSC)
  └── RentalHistoryList (Client)
      ├── SearchBar
      ├── FilterTabs
      ├── ExportButton (管理者のみ)
      └── DataGrid / Virtuoso
          └── RentalHistoryCard (Mobile)
```

---

## API仕様

### 1. 貸出一覧取得

**エンドポイント**: `GET /api/rentals`

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|-----|------|
| status | string | - | フィルター: `all`, `available`, `rented`, `dueSoon`, `overdue` |
| search | string | - | 検索キーワード |
| sortBy | string | - | ソート項目: `asset_no`, `rental_date`, `return_due_date` |
| sortOrder | string | - | ソート順: `asc`, `desc` |
| page | int | - | ページ番号（ページネーション） |
| pageSize | int | - | 1ページあたりの件数 |

**レスポンス**:
```json
{
  "data": [
    {
      "rental_id": 1,
      "asset_no": "PC-001",
      "maker": "Dell",
      "os": "Windows 11",
      "rental_flag": true,
      "employee_no": "E001",
      "employee_name": "山田太郎",
      "rental_date": "2025-11-10",
      "return_due_date": "2025-11-20",
      "status": "rented",
      "days_until_due": 3,
      "is_overdue": false
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

**ステータス**:
- `available`: 利用可能
- `rented`: 貸出中
- `dueSoon`: 返却期限間近（3日以内）
- `overdue`: 返却期限切れ

---

### 2. 貸出詳細取得

**エンドポイント**: `GET /api/rentals/{asset_no}`

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| asset_no | string | 機器の資産番号 |

**レスポンス**:
```json
{
  "rental_id": 1,
  "asset_no": "PC-001",
  "maker": "Dell",
  "os": "Windows 11",
  "memory": "16GB",
  "capacity": "512GB",
  "has_gpu": true,
  "location": "本社3F",
  "rental_flag": true,
  "employee_no": "E001",
  "employee_name": "山田太郎",
  "rental_date": "2025-11-10",
  "return_due_date": "2025-11-20",
  "note": "プロジェクト用"
}
```

---

### 3. 貸出処理

**エンドポイント**: `POST /api/rentals`

**リクエストボディ**:
```json
{
  "asset_no": "PC-001",
  "employee_no": "E001",
  "return_due_date": "2025-11-20",
  "note": "プロジェクト用"
}
```

**レスポンス**:
```json
{
  "rental_id": 1,
  "asset_no": "PC-001",
  "employee_no": "E001",
  "rental_date": "2025-11-10",
  "return_due_date": "2025-11-20",
  "note": "プロジェクト用",
  "message": "貸出が完了しました"
}
```

**エラーレスポンス**:
```json
{
  "error": "この機器は既に貸出中です",
  "code": "ALREADY_RENTED"
}
```

---

### 4. 返却処理

**エンドポイント**: `PUT /api/rentals/{rental_id}/return`

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| rental_id | int | 貸出レコードのID |

**レスポンス**:
```json
{
  "rental_id": 1,
  "asset_no": "PC-001",
  "return_date": "2025-11-18",
  "is_overdue": false,
  "message": "返却が完了しました"
}
```

**エラーレスポンス**:
```json
{
  "error": "この機器は貸出中ではありません",
  "code": "NOT_RENTED"
}
```

---

### 5. 貸出履歴取得

**エンドポイント**: `GET /api/rentals/history`

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|-----|------|
| employee_no | string | - | 特定ユーザーの履歴のみ |
| asset_no | string | - | 特定機器の履歴のみ |
| start_date | date | - | 貸出日の開始日 |
| end_date | date | - | 貸出日の終了日 |
| overdue_only | boolean | - | 延滞履歴のみ |
| page | int | - | ページ番号 |
| pageSize | int | - | 1ページあたりの件数 |

**レスポンス**:
```json
{
  "data": [
    {
      "rental_id": 1,
      "asset_no": "PC-001",
      "maker": "Dell",
      "os": "Windows 11",
      "employee_no": "E001",
      "employee_name": "山田太郎",
      "rental_date": "2025-11-01",
      "return_due_date": "2025-11-10",
      "return_date": "2025-11-12",
      "days_overdue": 2,
      "note": "プロジェクト用"
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 20
}
```

---

### 6. リマインダー取得

**エンドポイント**: `GET /api/rentals/reminders`

**レスポンス**:
```json
{
  "dueSoon": 5,
  "overdue": 2,
  "details": [
    {
      "asset_no": "PC-001",
      "employee_name": "山田太郎",
      "return_due_date": "2025-11-18",
      "days_until_due": 1,
      "status": "dueSoon"
    },
    {
      "asset_no": "PC-002",
      "employee_name": "佐藤花子",
      "return_due_date": "2025-11-15",
      "days_overdue": 2,
      "status": "overdue"
    }
  ]
}
```

---

## データフロー

### 貸出処理のデータフロー

```
1. ユーザー操作
   RentalForm → handleRent()
   ↓
2. React Query (useMutation)
   rentalsApi.createRental(data)
   ↓
3. Fetch API
   POST /api/rentals
   ↓
4. Backend Controller
   RentalsController.CreateRental()
   ↓
5. Service Layer
   RentalService.CreateRentalAsync()
   - バリデーション
   - 機器の貸出可否チェック
   - ユーザーの存在チェック
   ↓
6. Repository Layer
   RentalRepository.CreateAsync()
   - TRN_RENTAL に INSERT
   - MST_DEVICE の rental_flag を true に UPDATE
   ↓
7. Database
   PostgreSQL トランザクション実行
   ↓
8. Response
   rental_id, message を返却
   ↓
9. UI Update
   React Query がキャッシュを無効化
   一覧画面に遷移
```

### 返却処理のデータフロー

```
1. ユーザー操作
   RentalForm → handleReturn()
   ↓
2. React Query (useMutation)
   rentalsApi.returnRental(rental_id)
   ↓
3. Fetch API
   PUT /api/rentals/{rental_id}/return
   ↓
4. Backend Controller
   RentalsController.ReturnRental()
   ↓
5. Service Layer
   RentalService.ReturnRentalAsync()
   - 貸出レコードの存在チェック
   - 返却日を設定
   ↓
6. Repository Layer
   RentalRepository.UpdateAsync()
   - TRN_RENTAL の return_date を UPDATE
   - MST_DEVICE の rental_flag を false に UPDATE
   ↓
7. Database
   PostgreSQL トランザクション実行
   ↓
8. Response
   return_date, is_overdue を返却
   ↓
9. UI Update
   React Query がキャッシュを無効化
   一覧画面に遷移
```

---

## ビジネスルール

### 貸出時のルール

1. **機器の貸出可否**
   - `rental_flag` が `false` の機器のみ貸出可能
   - `broken_flag` が `true` の機器は貸出不可
   - `delete_flag` が `true` の機器は貸出不可

2. **ユーザーの貸出可否**
   - `delete_flag` が `false` のユーザーのみ貸出可能
   - `retire_date` が設定されていないユーザーのみ貸出可能
   - または `retire_date` が未来の日付のユーザーのみ貸出可能

3. **返却予定日**
   - 貸出日より未来の日付を指定
   - 最大貸出期間: 90日（設定可能）

4. **同時貸出制限**
   - 一般ユーザー: 最大3台まで
   - 管理者: 制限なし

### 返却時のルール

1. **返却可能な貸出**
   - `rental_flag` が `true` の貸出のみ返却可能
   - `return_date` が NULL の貸出のみ返却可能

2. **返却日**
   - 返却日は現在の日付を自動設定
   - 貸出日より前の日付は設定不可

3. **延滞チェック**
   - `return_date` > `return_due_date` の場合、延滞フラグを立てる

---

## バリデーション

### 貸出時のバリデーション

#### フロントエンド (Zod)

```javascript
const rentalSchema = z.object({
  asset_no: z.string()
    .min(1, '資産番号は必須です'),
  
  employee_no: z.string()
    .min(1, '貸出者を選択してください'),
  
  return_due_date: z.string()
    .refine(
      (date) => new Date(date) > new Date(),
      '返却予定日は今日より後の日付を指定してください'
    )
    .refine(
      (date) => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 90);
        return new Date(date) <= maxDate;
      },
      '返却予定日は90日以内を指定してください'
    ),
  
  note: z.string()
    .max(100, '備考は100文字以内で入力してください')
    .optional()
});
```

#### バックエンド (C#)

```csharp
public async Task<Result> ValidateRentalAsync(RentalDTO dto)
{
    // 機器の存在チェック
    var machine = await _machineRepository.GetByAssetNoAsync(dto.AssetNo);
    if (machine == null || machine.DeleteFlag)
    {
        return Result.Fail("機器が見つかりません");
    }

    // 機器の貸出状態チェック
    if (machine.RentalFlag)
    {
        return Result.Fail("この機器は既に貸出中です");
    }

    // 機器の故障状態チェック
    if (machine.BrokenFlag)
    {
        return Result.Fail("この機器は故障中のため貸出できません");
    }

    // ユーザーの存在チェック
    var user = await _userRepository.GetByEmployeeNoAsync(dto.EmployeeNo);
    if (user == null || user.DeleteFlag)
    {
        return Result.Fail("ユーザーが見つかりません");
    }

    // ユーザーの退職状態チェック
    if (user.RetireDate.HasValue && user.RetireDate.Value <= DateTime.Today)
    {
        return Result.Fail("退職済みのユーザーには貸出できません");
    }

    // 返却予定日のチェック
    if (dto.ReturnDueDate <= DateTime.Today)
    {
        return Result.Fail("返却予定日は今日より後の日付を指定してください");
    }

    if (dto.ReturnDueDate > DateTime.Today.AddDays(90))
    {
        return Result.Fail("返却予定日は90日以内を指定してください");
    }

    // 同時貸出制限チェック（一般ユーザーのみ）
    if (!user.AccountLevel)
    {
        var currentRentals = await _rentalRepository
            .GetActiveRentalsByEmployeeNoAsync(dto.EmployeeNo);
        
        if (currentRentals.Count >= 3)
        {
            return Result.Fail("同時に貸出できる機器は3台までです");
        }
    }

    return Result.Ok();
}
```

---

## エラーハンドリング

### エラーコード一覧

| コード | メッセージ | HTTP ステータス |
|--------|-----------|----------------|
| MACHINE_NOT_FOUND | 機器が見つかりません | 404 |
| ALREADY_RENTED | この機器は既に貸出中です | 400 |
| MACHINE_BROKEN | この機器は故障中のため貸出できません | 400 |
| USER_NOT_FOUND | ユーザーが見つかりません | 404 |
| USER_RETIRED | 退職済みのユーザーには貸出できません | 400 |
| INVALID_DUE_DATE | 返却予定日が無効です | 400 |
| RENTAL_LIMIT_EXCEEDED | 同時貸出数の上限を超えています | 400 |
| NOT_RENTED | この機器は貸出中ではありません | 400 |
| RENTAL_NOT_FOUND | 貸出レコードが見つかりません | 404 |

---

## パフォーマンス最適化

### データベースクエリ最適化

1. **インデックス設定**
```sql
-- TRN_RENTAL テーブル
CREATE INDEX idx_rental_asset_no ON TRN_RENTAL(asset_no);
CREATE INDEX idx_rental_employee_no ON TRN_RENTAL(employee_no);
CREATE INDEX idx_rental_flag ON TRN_RENTAL(rental_flag);
CREATE INDEX idx_rental_date ON TRN_RENTAL(rental_date);
CREATE INDEX idx_return_due_date ON TRN_RENTAL(return_due_date);
```

2. **JOIN最適化**
```sql
-- 貸出一覧取得クエリ
SELECT 
    r.rental_id,
    r.asset_no,
    m.maker,
    m.os,
    r.rental_flag,
    u.employee_no,
    u.name AS employee_name,
    r.rental_date,
    r.return_due_date,
    CASE 
        WHEN r.rental_flag = FALSE THEN 'available'
        WHEN r.return_due_date < CURRENT_DATE THEN 'overdue'
        WHEN r.return_due_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'dueSoon'
        ELSE 'rented'
    END AS status
FROM TRN_RENTAL r
INNER JOIN MST_DEVICE m ON r.asset_no = m.asset_no
LEFT JOIN MST_USER u ON r.employee_no = u.employee_no
WHERE r.delete_flag = FALSE
ORDER BY r.rental_date DESC;
```

### フロントエンド最適化

1. **React Query のキャッシュ設定**
```javascript
const { data: rentals } = useQuery({
  queryKey: ['rentals', filters],
  queryFn: () => rentalsApi.getRentals(filters),
  staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  cacheTime: 1000 * 60 * 10, // 10分間保持
  refetchOnWindowFocus: true,
});
```

2. **仮想スクロール（大量データ対応）**
```javascript
import { Virtuoso } from 'react-virtuoso';

<Virtuoso
  data={rentals}
  itemContent={(index, rental) => (
    <RentalCard key={rental.rental_id} rental={rental} />
  )}
/>
```

---

## まとめ

貸出管理機能は、機器の効率的な貸出・返却と履歴管理を実現します。ビジネスルールとバリデーションを適切に実装することで、データの整合性を保ちます。
