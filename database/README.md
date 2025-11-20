# データベースセットアップガイド

## 概要
このディレクトリには、Rental Machine Appのデータベースをセットアップするための SQLスクリプトが含まれています。

## ファイル一覧

| ファイル名 | 説明 |
|-----------|------|
| `01_create_tables.sql` | データベース、テーブル、インデックス、制約、トリガーの作成 |
| `02_insert_sample_data.sql` | サンプルデータの挿入 (30件ずつ) |

## セットアップ手順

### 前提条件
- PostgreSQL がインストールされていること
- PostgreSQL のスーパーユーザー権限があること

### 1. データベースとテーブルの作成

```bash
# PostgreSQL に接続してスクリプトを実行
psql -U postgres -f 01_create_tables.sql
```

### 2. サンプルデータの挿入

```bash
# サンプルデータを挿入
psql -U postgres -f 02_insert_sample_data.sql
```

### 一括実行

```bash
# 両方のスクリプトを一度に実行
psql -U postgres -f 01_create_tables.sql && psql -U postgres -f 02_insert_sample_data.sql
```

## サンプルデータ詳細

### MST_USER (30件)
- 社員番号: E001 ~ E030
- 部署: 開発部、営業部、人事部、総務部、経理部、マーケティング部、IT推進部、広報部
- 管理者権限: 6名 (E001, E003, E007, E013, E017, E024, E030)
- 一般ユーザー: 24名

### MST_DEVICE (30件)
- 資産番号: PC-001 ~ PC-030 (自動採番)
- メーカー: Dell, HP, Lenovo, Apple, ASUS, MSI
- OS: Windows 10 Pro, Windows 11 Pro, Windows 11 Home, macOS
- メモリ: 8GB ~ 32GB
- ストレージ: 256GB ~ 2TB
- GPU搭載: 15台 (TRUE), GPU非搭載: 15台 (FALSE)
- 設置場所: 本社各階 (1F ~ 6F)

### TRN_RENTAL (30件)
- 現在貸出中: 15件
  - 貸出期限が近い機器あり (テスト用)
- 返却済み: 15件
  - 過去の貸出履歴

## データベース構造

```
rental_machine_db
├── MST_DEVICE (機器マスタ)
│   ├── asset_no (PK) - 資産番号
│   ├── maker - メーカー
│   ├── os - OS
│   ├── memory - メモリ
│   ├── capacity - ストレージ容量
│   ├── has_gpu - GPU有無
│   └── ... (その他のカラム)
│
├── MST_USER (ユーザーマスタ)
│   ├── employee_no (PK) - 社員番号
│   ├── name - 名前
│   ├── department - 部署
│   ├── mail_address (UNIQUE) - メールアドレス
│   ├── account_level - 管理者権限
│   └── ... (その他のカラム)
│
└── TRN_RENTAL (貸出トランザクション)
    ├── rental_id (PK) - 貸出ID
    ├── asset_no (FK) - 資産番号
    ├── employee_no (FK) - 社員番号
    ├── rental_flag - 貸出フラグ
    ├── rental_date - 貸出日
    ├── return_due_date - 返却予定日
    └── return_date - 返却日
```

## 主要な制約

- **外部キー制約**: TRN_RENTAL → MST_DEVICE, MST_USER
- **ユニーク制約**: MST_USER.mail_address
- **チェック制約**: 
  - リース期間の妥当性 (開始日 ≤ 終了日)
  - 年齢の妥当性 (18 ≤ age ≤ 100)
  - 返却予定日の妥当性 (貸出日 ≤ 返却予定日)
  - 返却日の妥当性 (貸出日 ≤ 返却日)

## トリガー

- **MST_DEVICE**: 更新時に `update_date` を自動設定
- **MST_USER**: 更新時に `update_date` を自動設定

## インデックス

各テーブルには、検索パフォーマンスを最適化するための複数のインデックスが設定されています。

- 検索用複合インデックス
- 貸出可能機器の検索用部分インデックス
- 外部キーインデックス
- 返却期限検索用部分インデックス

## データの確認

```sql
-- ユーザー数の確認
SELECT COUNT(*) FROM MST_USER WHERE delete_flag = FALSE;

-- 機器数の確認
SELECT COUNT(*) FROM MST_DEVICE WHERE delete_flag = FALSE;

-- 貸出状況の確認
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN rental_flag = TRUE THEN 1 ELSE 0 END) as renting,
    SUM(CASE WHEN rental_flag = FALSE THEN 1 ELSE 0 END) as returned
FROM TRN_RENTAL 
WHERE delete_flag = FALSE;

-- 期限切れの貸出を確認
SELECT 
    r.rental_id,
    d.asset_no,
    u.name,
    r.rental_date,
    r.return_due_date,
    CURRENT_DATE - r.return_due_date as days_overdue
FROM TRN_RENTAL r
JOIN MST_DEVICE d ON r.asset_no = d.asset_no
JOIN MST_USER u ON r.employee_no = u.employee_no
WHERE r.rental_flag = TRUE 
  AND r.return_due_date < CURRENT_DATE
  AND r.delete_flag = FALSE;
```

## トラブルシューティング

### データベースが既に存在する場合

```sql
-- データベースを削除して再作成
DROP DATABASE IF EXISTS rental_machine_db;
```

### テーブルを再作成する場合

```sql
-- 接続
\c rental_machine_db;

-- テーブルを削除 (外部キー制約があるため順番に注意)
DROP TABLE IF EXISTS TRN_RENTAL CASCADE;
DROP TABLE IF EXISTS MST_USER CASCADE;
DROP TABLE IF EXISTS MST_DEVICE CASCADE;
DROP SEQUENCE IF EXISTS device_asset_sequence CASCADE;
```

## バックアップとリストア

### バックアップ

```bash
# データベース全体のバックアップ
pg_dump -U postgres -d rental_machine_db -F c -f backup_$(date +%Y%m%d).dump

# スキーマのみのバックアップ
pg_dump -U postgres -d rental_machine_db -s -f schema_$(date +%Y%m%d).sql
```

### リストア

```bash
# カスタム形式からのリストア
pg_restore -U postgres -d rental_machine_db -v backup_20251118.dump

# SQL形式からのリストア
psql -U postgres -d rental_machine_db -f backup_20251118.sql
```

## 注意事項

1. **本番環境での使用について**: このスクリプトは開発・テスト環境用です。本番環境では適切なセキュリティ設定を行ってください。

2. **パスワード設定**: PostgreSQL のユーザーパスワードは適切に設定してください。

3. **バックアップ**: データを投入する前に必ずバックアップを取得してください。

4. **文字コード**: UTF-8 を使用しています。日本語データが正しく表示されない場合は、クライアントの文字コード設定を確認してください。

## ライセンス

このプロジェクトのライセンスに従います。
