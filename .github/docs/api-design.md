# API設計書

## 目次
- [API概要](#api概要)
- [共通仕様](#共通仕様)
- [エンドポイント一覧](#エンドポイント一覧)
- [認証API](#認証api)
- [機器管理API](#機器管理api)
- [ユーザー管理API](#ユーザー管理api)
- [貸出管理API](#貸出管理api)

---

## API概要

### ベースURL
- **開発環境**: `http://localhost:5000/api`
- **本番環境**: `https://api.rental-machine.example.com/api`

### プロトコル
- HTTP/HTTPS

### データフォーマット
- **リクエスト**: JSON
- **レスポンス**: JSON

---

## 共通仕様

### リクエストヘッダー

```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token} (将来実装)
```

### レスポンスフォーマット

#### 成功時
```json
{
  "data": { /* レスポンスデータ */ },
  "message": "成功メッセージ（任意）"
}
```

#### エラー時
```json
{
  "error": "エラーメッセージ",
  "code": "ERROR_CODE",
  "details": { /* エラー詳細（任意） */ }
}
```

### HTTPステータスコード

| ステータスコード | 説明 |
|----------------|------|
| 200 OK | リクエスト成功 |
| 201 Created | リソース作成成功 |
| 204 No Content | 削除成功（レスポンスボディなし） |
| 400 Bad Request | リクエストが不正 |
| 401 Unauthorized | 認証が必要 |
| 403 Forbidden | アクセス権限なし |
| 404 Not Found | リソースが見つからない |
| 409 Conflict | リソースの競合 |
| 500 Internal Server Error | サーバーエラー |

### ページネーション

リスト取得APIでは、ページネーションパラメータをサポートします。

**クエリパラメータ**:
- `page`: ページ番号（デフォルト: 1）
- `pageSize`: 1ページあたりの件数（デフォルト: 20、最大: 100）

**レスポンス**:
```json
{
  "data": [ /* データ配列 */ ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## エンドポイント一覧

### 認証
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| POST | `/auth/login` | ログイン | なし |
| POST | `/auth/logout` | ログアウト | 認証済み |
| GET | `/auth/me` | 現在のユーザー情報取得 | 認証済み |

### 機器管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/machines` | 機器一覧取得 | 認証済み |
| GET | `/machines/{asset_no}` | 機器詳細取得 | 認証済み |
| POST | `/machines` | 機器新規登録 | 管理者 |
| PUT | `/machines/{asset_no}` | 機器更新 | 管理者 |
| DELETE | `/machines/{asset_no}` | 機器削除 | 管理者 |
| GET | `/machines/{asset_no}/history` | 機器の貸出履歴 | 認証済み |

### ユーザー管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/users` | ユーザー一覧取得 | 管理者 |
| GET | `/users/{employee_no}` | ユーザー詳細取得 | 管理者 |
| POST | `/users` | ユーザー新規登録 | 管理者 |
| PUT | `/users/{employee_no}` | ユーザー更新 | 管理者 |
| DELETE | `/users/{employee_no}` | ユーザー削除 | 管理者 |
| GET | `/users/{employee_no}/rentals` | ユーザーの貸出履歴 | 管理者 |

### 貸出管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/rentals` | 貸出一覧取得 | 認証済み |
| GET | `/rentals/{rental_id}` | 貸出詳細取得 | 認証済み |
| POST | `/rentals` | 貸出処理 | 認証済み |
| PUT | `/rentals/{rental_id}/return` | 返却処理 | 認証済み |
| GET | `/rentals/history` | 貸出履歴取得 | 認証済み |
| GET | `/rentals/reminders` | リマインダー取得 | 認証済み |

---

## 認証API

### 1. ログイン

**エンドポイント**: `POST /api/auth/login`

**リクエスト**:
```json
{
  "employee_no": "E001",
  "password": "password123" // 将来実装
}
```

**レスポンス (200 OK)**:
```json
{
  "data": {
    "employee_no": "E001",
    "name": "山田太郎",
    "department": "開発部",
    "account_level": true,
    "mail_address": "yamada@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // 将来実装
  },
  "message": "ログインに成功しました"
}
```

**エラーレスポンス (401 Unauthorized)**:
```json
{
  "error": "社員番号またはパスワードが正しくありません",
  "code": "INVALID_CREDENTIALS"
}
```

---

### 2. ログアウト

**エンドポイント**: `POST /api/auth/logout`

**リクエスト**: なし

**レスポンス (200 OK)**:
```json
{
  "message": "ログアウトしました"
}
```

---

### 3. 現在のユーザー情報取得

**エンドポイント**: `GET /api/auth/me`

**リクエスト**: なし

**レスポンス (200 OK)**:
```json
{
  "data": {
    "employee_no": "E001",
    "name": "山田太郎",
    "department": "開発部",
    "account_level": true,
    "mail_address": "yamada@example.com"
  }
}
```

---

## 機器管理API

### 1. 機器一覧取得

**エンドポイント**: `GET /api/machines`

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|-----|------|
| search | string | - | 検索キーワード（資産番号、メーカー、OS） |
| rental_flag | boolean | - | 貸出状況フィルター |
| broken_flag | boolean | - | 故障状況フィルター |
| has_gpu | boolean | - | GPU有無フィルター |
| sortBy | string | - | ソート項目: `asset_no`, `maker`, `os`, `register_date` |
| sortOrder | string | - | ソート順: `asc`, `desc` |
| page | int | - | ページ番号 |
| pageSize | int | - | 1ページあたりの件数 |

**レスポンス (200 OK)**:
```json
{
  "data": [
    {
      "asset_no": "PC-001",
      "maker": "Dell",
      "os": "Windows 11",
      "memory": "16GB",
      "capacity": "512GB",
      "has_gpu": true,
      "location": "本社3F",
      "rental_flag": false,
      "broken_flag": false,
      "register_date": "2025-01-10"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

### 2. 機器詳細取得

**エンドポイント**: `GET /api/machines/{asset_no}`

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| asset_no | string | 機器の資産番号 |

**レスポンス (200 OK)**:
```json
{
  "data": {
    "asset_no": "PC-001",
    "maker": "Dell",
    "os": "Windows 11",
    "memory": "16GB",
    "capacity": "512GB",
    "has_gpu": true,
    "location": "本社3F",
    "rental_flag": false,
    "broken_flag": false,
    "lease_start_date": "2024-01-01",
    "lease_end_date": "2027-01-01",
    "note": "プロジェクト専用機",
    "register_date": "2025-01-10",
    "update_date": "2025-11-15",
    "inventory_date": "2025-11-01"
  }
}
```

**エラーレスポンス (404 Not Found)**:
```json
{
  "error": "機器が見つかりません",
  "code": "MACHINE_NOT_FOUND"
}
```

---

### 3. 機器新規登録

**エンドポイント**: `POST /api/machines`

**リクエスト**:
```json
{
  "maker": "Dell",
  "os": "Windows 11",
  "memory": "16GB",
  "capacity": "512GB",
  "has_gpu": true,
  "location": "本社3F",
  "lease_start_date": "2024-01-01",
  "lease_end_date": "2027-01-01",
  "note": "プロジェクト専用機"
}
```

**レスポンス (201 Created)**:
```json
{
  "data": {
    "asset_no": "PC-100",
    "maker": "Dell",
    "os": "Windows 11",
    "memory": "16GB",
    "capacity": "512GB",
    "has_gpu": true,
    "location": "本社3F",
    "rental_flag": false,
    "broken_flag": false,
    "lease_start_date": "2024-01-01",
    "lease_end_date": "2027-01-01",
    "note": "プロジェクト専用機",
    "register_date": "2025-11-17"
  },
  "message": "機器を登録しました"
}
```

**エラーレスポンス (400 Bad Request)**:
```json
{
  "error": "入力データが不正です",
  "code": "INVALID_INPUT",
  "details": {
    "maker": "メーカーは必須です",
    "os": "OSは必須です"
  }
}
```

---

### 4. 機器更新

**エンドポイント**: `PUT /api/machines/{asset_no}`

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| asset_no | string | 機器の資産番号 |

**リクエスト**:
```json
{
  "maker": "Dell",
  "os": "Windows 11 Pro",
  "memory": "32GB",
  "capacity": "1TB",
  "has_gpu": true,
  "location": "本社4F",
  "broken_flag": false,
  "lease_start_date": "2024-01-01",
  "lease_end_date": "2027-01-01",
  "note": "メモリ増設済み"
}
```

**レスポンス (200 OK)**:
```json
{
  "data": {
    "asset_no": "PC-001",
    "maker": "Dell",
    "os": "Windows 11 Pro",
    "memory": "32GB",
    "capacity": "1TB",
    "has_gpu": true,
    "location": "本社4F",
    "rental_flag": false,
    "broken_flag": false,
    "lease_start_date": "2024-01-01",
    "lease_end_date": "2027-01-01",
    "note": "メモリ増設済み",
    "update_date": "2025-11-17"
  },
  "message": "機器を更新しました"
}
```

---

### 5. 機器削除

**エンドポイント**: `DELETE /api/machines/{asset_no}`

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| asset_no | string | 機器の資産番号 |

**レスポンス (204 No Content)**: なし

**エラーレスポンス (400 Bad Request)**:
```json
{
  "error": "貸出中の機器は削除できません",
  "code": "MACHINE_IN_USE"
}
```

---

### 6. 機器の貸出履歴取得

**エンドポイント**: `GET /api/machines/{asset_no}/history`

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| asset_no | string | 機器の資産番号 |

**レスポンス (200 OK)**:
```json
{
  "data": [
    {
      "rental_id": 1,
      "employee_no": "E001",
      "employee_name": "山田太郎",
      "rental_date": "2025-11-01",
      "return_due_date": "2025-11-10",
      "return_date": "2025-11-09",
      "note": "プロジェクト用"
    }
  ]
}
```

---

## ユーザー管理API

### 1. ユーザー一覧取得

**エンドポイント**: `GET /api/users`

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|-----|------|
| search | string | - | 検索キーワード（社員番号、名前、部署） |
| department | string | - | 部署フィルター |
| account_level | boolean | - | 権限フィルター |
| retired | boolean | - | 退職者を含むか |
| sortBy | string | - | ソート項目: `employee_no`, `name`, `department` |
| sortOrder | string | - | ソート順: `asc`, `desc` |
| page | int | - | ページ番号 |
| pageSize | int | - | 1ページあたりの件数 |

**レスポンス (200 OK)**:
```json
{
  "data": [
    {
      "employee_no": "E001",
      "name": "山田太郎",
      "department": "開発部",
      "position": "エンジニア",
      "account_level": true,
      "mail_address": "yamada@example.com"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

### 2. ユーザー詳細取得

**エンドポイント**: `GET /api/users/{employee_no}`

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| employee_no | string | ユーザーの社員番号 |

**レスポンス (200 OK)**:
```json
{
  "data": {
    "employee_no": "E001",
    "name": "山田太郎",
    "name_kana": "ヤマダタロウ",
    "department": "開発部",
    "tel_no": "03-1234-5678",
    "mail_address": "yamada@example.com",
    "age": 30,
    "gender": 1,
    "position": "エンジニア",
    "account_level": true,
    "retire_date": null,
    "register_date": "2025-01-10",
    "update_date": "2025-11-15"
  }
}
```

---

### 3. ユーザー新規登録

**エンドポイント**: `POST /api/users`

**リクエスト**:
```json
{
  "employee_no": "E100",
  "name": "鈴木一郎",
  "name_kana": "スズキイチロウ",
  "department": "営業部",
  "tel_no": "03-9876-5432",
  "mail_address": "suzuki@example.com",
  "age": 28,
  "gender": 1,
  "position": "営業",
  "account_level": false
}
```

**レスポンス (201 Created)**:
```json
{
  "data": {
    "employee_no": "E100",
    "name": "鈴木一郎",
    "name_kana": "スズキイチロウ",
    "department": "営業部",
    "tel_no": "03-9876-5432",
    "mail_address": "suzuki@example.com",
    "age": 28,
    "gender": 1,
    "position": "営業",
    "account_level": false,
    "register_date": "2025-11-17"
  },
  "message": "ユーザーを登録しました"
}
```

**エラーレスポンス (409 Conflict)**:
```json
{
  "error": "この社員番号は既に登録されています",
  "code": "EMPLOYEE_NO_ALREADY_EXISTS"
}
```

---

### 4. ユーザー更新

**エンドポイント**: `PUT /api/users/{employee_no}`

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| employee_no | string | ユーザーの社員番号 |

**リクエスト**:
```json
{
  "name": "山田太郎",
  "name_kana": "ヤマダタロウ",
  "department": "開発部",
  "tel_no": "03-1234-5678",
  "mail_address": "yamada@example.com",
  "age": 31,
  "gender": 1,
  "position": "シニアエンジニア",
  "account_level": true
}
```

**レスポンス (200 OK)**:
```json
{
  "data": {
    "employee_no": "E001",
    "name": "山田太郎",
    "name_kana": "ヤマダタロウ",
    "department": "開発部",
    "tel_no": "03-1234-5678",
    "mail_address": "yamada@example.com",
    "age": 31,
    "gender": 1,
    "position": "シニアエンジニア",
    "account_level": true,
    "update_date": "2025-11-17"
  },
  "message": "ユーザーを更新しました"
}
```

---

### 5. ユーザー削除

**エンドポイント**: `DELETE /api/users/{employee_no}`

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| employee_no | string | ユーザーの社員番号 |

**レスポンス (204 No Content)**: なし

**エラーレスポンス (400 Bad Request)**:
```json
{
  "error": "貸出中の機器があるユーザーは削除できません",
  "code": "USER_HAS_ACTIVE_RENTALS"
}
```

---

### 6. ユーザーの貸出履歴取得

**エンドポイント**: `GET /api/users/{employee_no}/rentals`

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| employee_no | string | ユーザーの社員番号 |

**レスポンス (200 OK)**:
```json
{
  "data": [
    {
      "rental_id": 1,
      "asset_no": "PC-001",
      "maker": "Dell",
      "os": "Windows 11",
      "rental_date": "2025-11-01",
      "return_due_date": "2025-11-10",
      "return_date": "2025-11-09",
      "note": "プロジェクト用"
    }
  ]
}
```

---

## 貸出管理API

### 1. 貸出一覧取得

**エンドポイント**: `GET /api/rentals`

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|-----|------|
| status | string | - | フィルター: `all`, `available`, `rented`, `dueSoon`, `overdue` |
| search | string | - | 検索キーワード |
| sortBy | string | - | ソート項目: `asset_no`, `rental_date`, `return_due_date` |
| sortOrder | string | - | ソート順: `asc`, `desc` |
| page | int | - | ページ番号 |
| pageSize | int | - | 1ページあたりの件数 |

**レスポンス (200 OK)**:
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
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

### 2. 貸出処理

**エンドポイント**: `POST /api/rentals`

**リクエスト**:
```json
{
  "asset_no": "PC-001",
  "employee_no": "E001",
  "return_due_date": "2025-11-20",
  "note": "プロジェクト用"
}
```

**レスポンス (201 Created)**:
```json
{
  "data": {
    "rental_id": 1,
    "asset_no": "PC-001",
    "employee_no": "E001",
    "rental_date": "2025-11-10",
    "return_due_date": "2025-11-20",
    "note": "プロジェクト用"
  },
  "message": "貸出が完了しました"
}
```

---

### 3. 返却処理

**エンドポイント**: `PUT /api/rentals/{rental_id}/return`

**パスパラメータ**:
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| rental_id | int | 貸出レコードのID |

**レスポンス (200 OK)**:
```json
{
  "data": {
    "rental_id": 1,
    "asset_no": "PC-001",
    "return_date": "2025-11-18",
    "is_overdue": false
  },
  "message": "返却が完了しました"
}
```

---

### 4. 貸出履歴取得

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

**レスポンス (200 OK)**:
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
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

### 5. リマインダー取得

**エンドポイント**: `GET /api/rentals/reminders`

**レスポンス (200 OK)**:
```json
{
  "data": {
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
}
```

---

## まとめ

このAPI設計書は、Rental Machine Appのバックエンドとフロントエンドの通信仕様を定義しています。RESTful APIの原則に従い、明確で一貫性のあるインターフェースを提供します。
