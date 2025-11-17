# データベース設計書

## 目次
- [データベース概要](#データベース概要)
- [テーブル設計](#テーブル設計)
- [ER図](#er図)
- [インデックス設計](#インデックス設計)
- [制約・トリガー](#制約トリガー)

---

## データベース概要

### DBMS
**PostgreSQL** (最新版)

### データベース名
`rental_machine_db`

### 文字コード
`UTF-8`

### タイムゾーン
`Asia/Tokyo` (JST)

---

## テーブル設計

### 1. MST_DEVICE (機器マスタ)

機器の基本情報を管理するマスタテーブル。

#### テーブル定義

```sql
CREATE TABLE MST_DEVICE (
    asset_no VARCHAR(20) PRIMARY KEY DEFAULT ('PC-' || LPAD(nextval('device_asset_sequence')::TEXT, 3, '0')),
    maker VARCHAR(20),
    os VARCHAR(20),
    memory VARCHAR(10),
    capacity VARCHAR(10),
    has_gpu BOOLEAN DEFAULT FALSE,
    location VARCHAR(30),
    broken_flag BOOLEAN DEFAULT FALSE,
    lease_start_date DATE,
    lease_end_date DATE,
    note VARCHAR(100),
    register_date DATE DEFAULT CURRENT_DATE,
    update_date DATE,
    inventory_date DATE,
    delete_flag BOOLEAN DEFAULT FALSE
);
```

#### カラム定義

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|-----------|------|
| asset_no | VARCHAR(20) | NOT NULL | 自動採番 | 資産番号（主キー） |
| maker | VARCHAR(20) | NULL | - | メーカー名 |
| os | VARCHAR(20) | NULL | - | OS名 |
| memory | VARCHAR(10) | NULL | - | メモリ容量 |
| capacity | VARCHAR(10) | NULL | - | ストレージ容量 |
| has_gpu | BOOLEAN | NULL | FALSE | GPU有無 |
| location | VARCHAR(30) | NULL | - | 設置場所 |
| broken_flag | BOOLEAN | NULL | FALSE | 故障フラグ |
| lease_start_date | DATE | NULL | - | リース開始日 |
| lease_end_date | DATE | NULL | - | リース終了日 |
| note | VARCHAR(100) | NULL | - | 備考 |
| register_date | DATE | NULL | CURRENT_DATE | 登録日 |
| update_date | DATE | NULL | - | 更新日 |
| inventory_date | DATE | NULL | - | 棚卸日 |
| delete_flag | BOOLEAN | NULL | FALSE | 削除フラグ |

#### シーケンス定義

```sql
CREATE SEQUENCE device_asset_sequence
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 999999
    CACHE 1;
```

#### サンプルデータ

```sql
INSERT INTO MST_DEVICE (maker, os, memory, capacity, has_gpu, location, lease_start_date, lease_end_date, note)
VALUES 
    ('Dell', 'Windows 11', '16GB', '512GB', TRUE, '本社3F', '2024-01-01', '2027-01-01', 'プロジェクト専用機'),
    ('HP', 'Windows 10', '8GB', '256GB', FALSE, '本社2F', '2023-06-01', '2026-06-01', NULL),
    ('Lenovo', 'Windows 11', '32GB', '1TB', TRUE, '本社4F', '2024-03-01', '2027-03-01', 'AI開発用');
```

---

### 2. MST_USER (ユーザーマスタ)

ユーザー（社員）の基本情報を管理するマスタテーブル。

#### テーブル定義

```sql
CREATE TABLE MST_USER (
    employee_no VARCHAR(20) PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    name_kana VARCHAR(20),
    department VARCHAR(20),
    tel_no VARCHAR(20),
    mail_address VARCHAR(50),
    age INT,
    gender INT,
    position VARCHAR(20),
    account_level BOOLEAN DEFAULT FALSE NOT NULL,
    retire_date DATE,
    register_date DATE NOT NULL DEFAULT CURRENT_DATE,
    update_date DATE,
    delete_flag BOOLEAN DEFAULT FALSE NOT NULL
);

-- メールアドレスの一意制約
ALTER TABLE MST_USER ADD CONSTRAINT employees_mail_address_uk UNIQUE (mail_address);
```

#### カラム定義

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|-----------|------|
| employee_no | VARCHAR(20) | NOT NULL | - | 社員番号（主キー） |
| name | VARCHAR(20) | NOT NULL | - | 名前 |
| name_kana | VARCHAR(20) | NULL | - | 名前（カナ） |
| department | VARCHAR(20) | NULL | - | 部署 |
| tel_no | VARCHAR(20) | NULL | - | 電話番号 |
| mail_address | VARCHAR(50) | NULL | - | メールアドレス（ユニーク） |
| age | INT | NULL | - | 年齢 |
| gender | INT | NULL | - | 性別（1: 男性, 2: 女性, 0: その他） |
| position | VARCHAR(20) | NULL | - | 役職 |
| account_level | BOOLEAN | NOT NULL | FALSE | アカウントレベル（TRUE: 管理者, FALSE: 一般） |
| retire_date | DATE | NULL | - | 退職日 |
| register_date | DATE | NOT NULL | CURRENT_DATE | 登録日 |
| update_date | DATE | NULL | - | 更新日 |
| delete_flag | BOOLEAN | NOT NULL | FALSE | 削除フラグ |

#### サンプルデータ

```sql
INSERT INTO MST_USER (employee_no, name, name_kana, department, tel_no, mail_address, age, gender, position, account_level)
VALUES 
    ('E001', '山田太郎', 'ヤマダタロウ', '開発部', '03-1234-5678', 'yamada@example.com', 30, 1, 'エンジニア', TRUE),
    ('E002', '佐藤花子', 'サトウハナコ', '営業部', '03-9876-5432', 'sato@example.com', 28, 2, '営業', FALSE),
    ('E003', '鈴木一郎', 'スズキイチロウ', '開発部', '03-5555-1234', 'suzuki@example.com', 35, 1, 'マネージャー', TRUE);
```

---

### 3. TRN_RENTAL (貸出トランザクション)

機器の貸出・返却履歴を記録するトランザクションテーブル。

#### テーブル定義

```sql
CREATE TABLE TRN_RENTAL (
    rental_id SERIAL PRIMARY KEY,
    asset_no VARCHAR(20) NOT NULL,
    employee_no VARCHAR(20) NOT NULL,
    rental_flag BOOLEAN DEFAULT FALSE NOT NULL,
    rental_date DATE NOT NULL DEFAULT CURRENT_DATE,
    return_due_date DATE,
    return_date DATE,
    note VARCHAR(100),
    delete_flag BOOLEAN DEFAULT FALSE NOT NULL,
    FOREIGN KEY (asset_no) REFERENCES MST_DEVICE(asset_no) ON DELETE CASCADE,
    FOREIGN KEY (employee_no) REFERENCES MST_USER(employee_no) ON DELETE CASCADE
);
```

#### カラム定義

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|-----------|------|
| rental_id | SERIAL | NOT NULL | 自動採番 | 貸出ID（主キー） |
| asset_no | VARCHAR(20) | NOT NULL | - | 資産番号（外部キー: MST_DEVICE） |
| employee_no | VARCHAR(20) | NOT NULL | - | 社員番号（外部キー: MST_USER） |
| rental_flag | BOOLEAN | NOT NULL | FALSE | 貸出フラグ（TRUE: 貸出中, FALSE: 返却済み） |
| rental_date | DATE | NOT NULL | CURRENT_DATE | 貸出日 |
| return_due_date | DATE | NULL | - | 返却予定日 |
| return_date | DATE | NULL | - | 返却日 |
| note | VARCHAR(100) | NULL | - | 備考 |
| delete_flag | BOOLEAN | NOT NULL | FALSE | 削除フラグ |

#### サンプルデータ

```sql
INSERT INTO TRN_RENTAL (asset_no, employee_no, rental_flag, rental_date, return_due_date, return_date, note)
VALUES 
    ('PC-001', 'E001', TRUE, '2025-11-10', '2025-11-20', NULL, 'プロジェクト用'),
    ('PC-002', 'E002', FALSE, '2025-11-01', '2025-11-10', '2025-11-09', '営業活動用'),
    ('PC-003', 'E003', TRUE, '2025-11-05', '2025-11-25', NULL, '開発用');
```

---

## ER図

```
┌─────────────────────┐
│     MST_DEVICE      │
├─────────────────────┤
│ asset_no (PK)       │───┐
│ maker               │   │
│ os                  │   │
│ memory              │   │
│ capacity            │   │
│ has_gpu             │   │
│ location            │   │
│ broken_flag         │   │
│ lease_start_date    │   │
│ lease_end_date      │   │
│ note                │   │
│ register_date       │   │
│ update_date         │   │
│ inventory_date      │   │
│ delete_flag         │   │
└─────────────────────┘   │
                          │
                          │
                          ↓
                    ┌─────────────────────┐
                    │     TRN_RENTAL      │
                    ├─────────────────────┤
                    │ rental_id (PK)      │
                    │ asset_no (FK)       │
                    │ employee_no (FK)    │
                    │ rental_flag         │
                    │ rental_date         │
                    │ return_due_date     │
                    │ return_date         │
                    │ note                │
                    │ delete_flag         │
                    └─────────────────────┘
                          ↑
                          │
                          │
┌─────────────────────┐   │
│     MST_USER        │   │
├─────────────────────┤   │
│ employee_no (PK)    │───┘
│ name                │
│ name_kana           │
│ department          │
│ tel_no              │
│ mail_address (UK)   │
│ age                 │
│ gender              │
│ position            │
│ account_level       │
│ retire_date         │
│ register_date       │
│ update_date         │
│ delete_flag         │
└─────────────────────┘
```

### リレーション

- **TRN_RENTAL.asset_no** → **MST_DEVICE.asset_no** (多対一)
- **TRN_RENTAL.employee_no** → **MST_USER.employee_no** (多対一)

---

## インデックス設計

### MST_DEVICE テーブル

```sql
-- プライマリキー（自動生成）
CREATE UNIQUE INDEX idx_device_pk ON MST_DEVICE(asset_no);

-- 検索用複合インデックス
CREATE INDEX idx_device_search ON MST_DEVICE(maker, os, delete_flag);

-- 貸出可能機器の検索用
CREATE INDEX idx_device_available ON MST_DEVICE(broken_flag, delete_flag) WHERE broken_flag = FALSE AND delete_flag = FALSE;

-- リース期限管理用
CREATE INDEX idx_device_lease_end ON MST_DEVICE(lease_end_date) WHERE delete_flag = FALSE;
```

### MST_USER テーブル

```sql
-- プライマリキー（自動生成）
CREATE UNIQUE INDEX idx_user_pk ON MST_USER(employee_no);

-- メールアドレスのユニークインデックス（自動生成）
CREATE UNIQUE INDEX employees_mail_address_uk ON MST_USER(mail_address);

-- 検索用複合インデックス
CREATE INDEX idx_user_search ON MST_USER(name, department, delete_flag);

-- 退職者除外検索用
CREATE INDEX idx_user_active ON MST_USER(delete_flag, retire_date) WHERE delete_flag = FALSE;
```

### TRN_RENTAL テーブル

```sql
-- プライマリキー（自動生成）
CREATE UNIQUE INDEX idx_rental_pk ON TRN_RENTAL(rental_id);

-- 外部キーインデックス
CREATE INDEX idx_rental_asset_no ON TRN_RENTAL(asset_no);
CREATE INDEX idx_rental_employee_no ON TRN_RENTAL(employee_no);

-- 貸出状況検索用
CREATE INDEX idx_rental_flag ON TRN_RENTAL(rental_flag, delete_flag);

-- 返却期限検索用
CREATE INDEX idx_rental_due_date ON TRN_RENTAL(return_due_date) WHERE rental_flag = TRUE AND delete_flag = FALSE;

-- 貸出日検索用
CREATE INDEX idx_rental_date ON TRN_RENTAL(rental_date);

-- 返却日検索用
CREATE INDEX idx_rental_return_date ON TRN_RENTAL(return_date);
```

---

## 制約・トリガー

### 制約

#### 外部キー制約

```sql
-- TRN_RENTAL → MST_DEVICE
ALTER TABLE TRN_RENTAL 
    ADD CONSTRAINT fk_rental_device 
    FOREIGN KEY (asset_no) 
    REFERENCES MST_DEVICE(asset_no) 
    ON DELETE CASCADE;

-- TRN_RENTAL → MST_USER
ALTER TABLE TRN_RENTAL 
    ADD CONSTRAINT fk_rental_user 
    FOREIGN KEY (employee_no) 
    REFERENCES MST_USER(employee_no) 
    ON DELETE CASCADE;
```

#### チェック制約

```sql
-- MST_DEVICE: リース期間の妥当性チェック
ALTER TABLE MST_DEVICE 
    ADD CONSTRAINT chk_device_lease_period 
    CHECK (lease_start_date IS NULL OR lease_end_date IS NULL OR lease_start_date <= lease_end_date);

-- MST_USER: 年齢の妥当性チェック
ALTER TABLE MST_USER 
    ADD CONSTRAINT chk_user_age 
    CHECK (age IS NULL OR (age >= 18 AND age <= 100));

-- TRN_RENTAL: 返却予定日の妥当性チェック
ALTER TABLE TRN_RENTAL 
    ADD CONSTRAINT chk_rental_due_date 
    CHECK (return_due_date IS NULL OR rental_date <= return_due_date);

-- TRN_RENTAL: 返却日の妥当性チェック
ALTER TABLE TRN_RENTAL 
    ADD CONSTRAINT chk_rental_return_date 
    CHECK (return_date IS NULL OR rental_date <= return_date);
```

---

### トリガー

#### 更新日時の自動設定

```sql
-- MST_DEVICE の更新日自動設定
CREATE OR REPLACE FUNCTION update_device_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_date = CURRENT_DATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_device_update
BEFORE UPDATE ON MST_DEVICE
FOR EACH ROW
EXECUTE FUNCTION update_device_timestamp();

-- MST_USER の更新日自動設定
CREATE OR REPLACE FUNCTION update_user_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_date = CURRENT_DATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_update
BEFORE UPDATE ON MST_USER
FOR EACH ROW
EXECUTE FUNCTION update_user_timestamp();
```

#### 貸出・返却時の機器ステータス同期

```sql
-- 貸出時: MST_DEVICE の rental_flag を TRUE に更新
-- 返却時: MST_DEVICE の rental_flag を FALSE に更新
-- ※この処理はアプリケーションロジックで実装（トランザクション内で実行）
```

---

## データ移行・初期化スクリプト

### テーブル作成スクリプト

```sql
-- データベース作成
CREATE DATABASE rental_machine_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'ja_JP.UTF-8'
    LC_CTYPE = 'ja_JP.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- シーケンス作成
CREATE SEQUENCE device_asset_sequence
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 999999
    CACHE 1;

-- MST_DEVICE テーブル作成
CREATE TABLE MST_DEVICE (
    asset_no VARCHAR(20) PRIMARY KEY DEFAULT ('PC-' || LPAD(nextval('device_asset_sequence')::TEXT, 3, '0')),
    maker VARCHAR(20),
    os VARCHAR(20),
    memory VARCHAR(10),
    capacity VARCHAR(10),
    has_gpu BOOLEAN DEFAULT FALSE,
    location VARCHAR(30),
    broken_flag BOOLEAN DEFAULT FALSE,
    lease_start_date DATE,
    lease_end_date DATE,
    note VARCHAR(100),
    register_date DATE DEFAULT CURRENT_DATE,
    update_date DATE,
    inventory_date DATE,
    delete_flag BOOLEAN DEFAULT FALSE
);

-- MST_USER テーブル作成
CREATE TABLE MST_USER (
    employee_no VARCHAR(20) PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    name_kana VARCHAR(20),
    department VARCHAR(20),
    tel_no VARCHAR(20),
    mail_address VARCHAR(50),
    age INT,
    gender INT,
    position VARCHAR(20),
    account_level BOOLEAN DEFAULT FALSE NOT NULL,
    retire_date DATE,
    register_date DATE NOT NULL DEFAULT CURRENT_DATE,
    update_date DATE,
    delete_flag BOOLEAN DEFAULT FALSE NOT NULL
);

-- メールアドレスの一意制約
ALTER TABLE MST_USER ADD CONSTRAINT employees_mail_address_uk UNIQUE (mail_address);

-- TRN_RENTAL テーブル作成
CREATE TABLE TRN_RENTAL (
    rental_id SERIAL PRIMARY KEY,
    asset_no VARCHAR(20) NOT NULL,
    employee_no VARCHAR(20) NOT NULL,
    rental_flag BOOLEAN DEFAULT FALSE NOT NULL,
    rental_date DATE NOT NULL DEFAULT CURRENT_DATE,
    return_due_date DATE,
    return_date DATE,
    note VARCHAR(100),
    delete_flag BOOLEAN DEFAULT FALSE NOT NULL,
    FOREIGN KEY (asset_no) REFERENCES MST_DEVICE(asset_no) ON DELETE CASCADE,
    FOREIGN KEY (employee_no) REFERENCES MST_USER(employee_no) ON DELETE CASCADE
);

-- インデックス作成（上記参照）
-- トリガー作成（上記参照）
-- 制約追加（上記参照）
```

### サンプルデータ投入スクリプト

```sql
-- MST_USER サンプルデータ
INSERT INTO MST_USER (employee_no, name, name_kana, department, tel_no, mail_address, age, gender, position, account_level)
VALUES 
    ('E001', '山田太郎', 'ヤマダタロウ', '開発部', '03-1234-5678', 'yamada@example.com', 30, 1, 'エンジニア', TRUE),
    ('E002', '佐藤花子', 'サトウハナコ', '営業部', '03-9876-5432', 'sato@example.com', 28, 2, '営業', FALSE),
    ('E003', '鈴木一郎', 'スズキイチロウ', '開発部', '03-5555-1234', 'suzuki@example.com', 35, 1, 'マネージャー', TRUE);

-- MST_DEVICE サンプルデータ
INSERT INTO MST_DEVICE (maker, os, memory, capacity, has_gpu, location, lease_start_date, lease_end_date, note)
VALUES 
    ('Dell', 'Windows 11', '16GB', '512GB', TRUE, '本社3F', '2024-01-01', '2027-01-01', 'プロジェクト専用機'),
    ('HP', 'Windows 10', '8GB', '256GB', FALSE, '本社2F', '2023-06-01', '2026-06-01', NULL),
    ('Lenovo', 'Windows 11', '32GB', '1TB', TRUE, '本社4F', '2024-03-01', '2027-03-01', 'AI開発用');

-- TRN_RENTAL サンプルデータ
INSERT INTO TRN_RENTAL (asset_no, employee_no, rental_flag, rental_date, return_due_date, return_date, note)
VALUES 
    ('PC-001', 'E001', TRUE, '2025-11-10', '2025-11-20', NULL, 'プロジェクト用'),
    ('PC-002', 'E002', FALSE, '2025-11-01', '2025-11-10', '2025-11-09', '営業活動用');
```

---

## バックアップ・リストア

### バックアップ

```bash
# 全データベースのバックアップ
pg_dump -U postgres -d rental_machine_db -F c -b -v -f backup_$(date +%Y%m%d).dump

# スキーマのみのバックアップ
pg_dump -U postgres -d rental_machine_db -s -F p -f schema_$(date +%Y%m%d).sql
```

### リストア

```bash
# カスタム形式からのリストア
pg_restore -U postgres -d rental_machine_db -v backup_20251117.dump

# SQL形式からのリストア
psql -U postgres -d rental_machine_db -f backup_20251117.sql
```

---

## まとめ

このデータベース設計は、機器・ユーザー・貸出の3つの主要エンティティを中心に構成されています。適切なインデックスと制約により、データの整合性とパフォーマンスを両立しています。
