# タスク生成スクリプト

## 概要

このディレクトリには、PROGRESS.mdの実装進捗チェックリストからタスク情報を抽出し、タスク一覧とガントチャートを生成するスクリプトが含まれています。

## ファイル構成

```
.github/scripts/
├── generate_tasks.js      # メインスクリプト（このファイルを実行）
├── parse_progress.js      # PROGRESS.mdをパースしてタスクを抽出
├── generate_gantt.js      # Mermaidガントチャートを生成
├── tasks.json            # 抽出されたタスク情報（自動生成）
└── README.md             # このファイル
```

## 使い方

### 1. スクリプトの実行

```bash
cd .github/scripts
node generate_tasks.js
```

### 2. 生成されるファイル

実行すると、以下のファイルが生成されます：

- **`../docs/TASKS.md`**: タスク一覧（優先度別、セクション別）
- **`../docs/GANTT.md`**: ガントチャート（フェーズ別、優先度別）
- **`tasks.json`**: タスク情報のJSON形式（中間ファイル）

### 3. 生成されたファイルの確認

```bash
# タスク一覧を確認
cat ../docs/TASKS.md

# ガントチャートを確認
cat ../docs/GANTT.md
```

## スクリプトの機能

### parse_progress.js

PROGRESS.mdをパースし、以下の情報を抽出します：

- タスクID（TASK-001形式）
- タスク名
- セクション（技術スタック、バックエンド等）
- サブセクション
- 優先度（critical, high, medium, low）
- 完了状態（✅ または ⬜）
- 推定期間
- 依存関係

### generate_gantt.js

タスク情報から以下の3種類のガントチャートを生成します：

1. **フェーズ別ガントチャート**（推奨）
   - 実装を6つのフェーズに分類
   - 各フェーズのマイルストーンを表示
   - 依存関係を考慮したスケジューリング

2. **優先度別ガントチャート**
   - 未完了タスクを優先度別に表示
   - 高優先度タスクを先に可視化

3. **全タスクガントチャート**
   - すべてのタスクを時系列で表示
   - セクション別にグループ化

### generate_tasks.js

メインスクリプトで、以下の処理を実行します：

1. PROGRESS.mdの解析
2. タスクの依存関係の設定
3. タスクの優先度別グループ化
4. 統計情報の計算
5. タスク一覧Markdownの生成
6. ガントチャートMarkdownの生成

## カスタマイズ

### 優先度の変更

`parse_progress.js`の`categories`オブジェクトで、各セクションの優先度を変更できます：

```javascript
const categories = {
  '技術スタック実装状況': { section: 1, priority: 'critical', duration: '2週間' },
  'プロジェクト構造実装状況': { section: 2, priority: 'high', duration: '1週間' },
  // ...
};
```

### 期間の調整

各セクションの推定期間も同様に変更可能です：

```javascript
'バックエンド実装状況': { section: 5, priority: 'critical', duration: '4週間' },
```

### 依存関係のルール

`parse_progress.js`の`setDependencies`関数で、タスク間の依存関係のルールを変更できます：

```javascript
const rules = [
  { from: 'Models', to: 'DTOs', section: 'バックエンド実装状況' },
  { from: 'DTOs', to: 'Repositories', section: 'バックエンド実装状況' },
  // ...
];
```

## トラブルシューティング

### エラー: `PROGRESS.mdが見つかりません`

- `.github/docs/PROGRESS.md`が存在することを確認してください
- スクリプトは`.github/scripts/`ディレクトリから実行する必要があります

### エラー: `tasks.jsonが見つかりません`

- `generate_tasks.js`を実行してください（このスクリプトがtasks.jsonを生成します）
- 個別スクリプト（parse_progress.js, generate_gantt.js）を直接実行する場合は、先にtasks.jsonを生成する必要があります

### ガントチャートが表示されない

- GitHubのMarkdownレンダラーはMermaid記法をサポートしています
- ローカルで確認する場合は、Mermaid対応のMarkdownビューアーを使用してください

## 更新頻度

以下のタイミングでスクリプトを実行してください：

1. **タスク完了時**: PROGRESS.mdのチェックボックスを更新後
2. **毎週**: 定期的な進捗報告の前
3. **新機能追加時**: 新しいタスクをPROGRESS.mdに追加後
4. **マイルストーン達成時**: フェーズ完了時

## 自動化（オプション）

GitHub Actionsでスクリプトを自動実行することも可能です：

```yaml
# .github/workflows/update-tasks.yml
name: Update Tasks and Gantt Chart

on:
  push:
    paths:
      - '.github/docs/PROGRESS.md'

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Generate tasks and gantt
        run: |
          cd .github/scripts
          node generate_tasks.js
      - name: Commit changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add .github/docs/TASKS.md .github/docs/GANTT.md
          git commit -m "Auto-update tasks and gantt chart" || exit 0
          git push
```

## ライセンス

このスクリプトはプロジェクトの一部として、プロジェクトと同じライセンスで提供されます。

## 貢献

スクリプトの改善提案やバグ報告は、GitHubのIssuesまたはPull Requestsで受け付けています。

---

最終更新: 2025-11-20
