-- =====================================================
-- データベース作成スクリプト
-- Rental Machine App Database
-- Docker環境用: データベースは既に作成されているため、この部分はスキップ
-- =====================================================

-- =====================================================
-- シーケンス作成
-- =====================================================

-- 機器資産番号用シーケンス
CREATE SEQUENCE device_asset_sequence
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 999999
    CACHE 1;

-- =====================================================
-- テーブル作成
-- =====================================================

-- 1. MST_DEVICE (機器マスタ)
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

-- 2. MST_USER (ユーザーマスタ)
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

-- 3. TRN_RENTAL (貸出トランザクション)
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

-- =====================================================
-- インデックス作成
-- =====================================================

-- MST_DEVICE インデックス
CREATE INDEX idx_device_search ON MST_DEVICE(maker, os, delete_flag);
CREATE INDEX idx_device_available ON MST_DEVICE(broken_flag, delete_flag) WHERE broken_flag = FALSE AND delete_flag = FALSE;
CREATE INDEX idx_device_lease_end ON MST_DEVICE(lease_end_date) WHERE delete_flag = FALSE;

-- MST_USER インデックス
CREATE INDEX idx_user_search ON MST_USER(name, department, delete_flag);
CREATE INDEX idx_user_active ON MST_USER(delete_flag, retire_date) WHERE delete_flag = FALSE;

-- TRN_RENTAL インデックス
CREATE INDEX idx_rental_asset_no ON TRN_RENTAL(asset_no);
CREATE INDEX idx_rental_employee_no ON TRN_RENTAL(employee_no);
CREATE INDEX idx_rental_flag ON TRN_RENTAL(rental_flag, delete_flag);
CREATE INDEX idx_rental_due_date ON TRN_RENTAL(return_due_date) WHERE rental_flag = TRUE AND delete_flag = FALSE;
CREATE INDEX idx_rental_date ON TRN_RENTAL(rental_date);
CREATE INDEX idx_rental_return_date ON TRN_RENTAL(return_date);

-- =====================================================
-- チェック制約
-- =====================================================

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

-- =====================================================
-- トリガー作成
-- =====================================================

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

-- =====================================================
-- 完了メッセージ
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'テーブル作成が完了しました';
    RAISE NOTICE 'MST_DEVICE, MST_USER, TRN_RENTAL テーブルが正常に作成されました';
END $$;
