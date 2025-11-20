#!/usr/bin/env node

/**
 * PROGRESS.mdからタスクとガントチャートを生成するメインスクリプト
 */

const fs = require('fs');
const path = require('path');
const { parseProgress, setDependencies, groupTasksByPriority, calculateStatistics } = require('./parse_progress');
const { generateGanttChart, generateSimplifiedGanttChart, generateMilestoneGanttChart } = require('./generate_gantt');

/**
 * タスク一覧のMarkdownを生成
 */
function generateTasksMarkdown(data) {
  const { statistics, tasks, grouped } = data;
  
  let md = `# タスク一覧

最終更新: ${new Date().toISOString().split('T')[0]}

## 概要

PROGRESS.mdから抽出した全タスクの一覧です。

### 統計情報

- **総タスク数**: ${statistics.total}
- **完了**: ${statistics.completed} (${statistics.percentage}%)
- **残り**: ${statistics.remaining}

### 優先度別統計

| 優先度 | 総数 | 完了 | 残り | 進捗率 |
|--------|------|------|------|--------|
| 最優先 (Critical) | ${statistics.byPriority.critical.total} | ${statistics.byPriority.critical.completed} | ${statistics.byPriority.critical.total - statistics.byPriority.critical.completed} | ${Math.round((statistics.byPriority.critical.completed / statistics.byPriority.critical.total) * 100) || 0}% |
| 高 (High) | ${statistics.byPriority.high.total} | ${statistics.byPriority.high.completed} | ${statistics.byPriority.high.total - statistics.byPriority.high.completed} | ${Math.round((statistics.byPriority.high.completed / statistics.byPriority.high.total) * 100) || 0}% |
| 中 (Medium) | ${statistics.byPriority.medium.total} | ${statistics.byPriority.medium.completed} | ${statistics.byPriority.medium.total - statistics.byPriority.medium.completed} | ${Math.round((statistics.byPriority.medium.completed / statistics.byPriority.medium.total) * 100) || 0}% |
| 低 (Low) | ${statistics.byPriority.low.total} | ${statistics.byPriority.low.completed} | ${statistics.byPriority.low.total - statistics.byPriority.low.completed} | ${Math.round((statistics.byPriority.low.completed / statistics.byPriority.low.total) * 100) || 0}% |

---

## 優先度別タスク一覧

`;

  // 優先度別にタスクを出力
  const priorityLabels = {
    critical: '最優先 (Critical)',
    high: '高優先度 (High)',
    medium: '中優先度 (Medium)',
    low: '低優先度 (Low)'
  };
  
  Object.entries(grouped).forEach(([priority, priorityTasks]) => {
    if (priorityTasks.length === 0) return;
    
    md += `### ${priorityLabels[priority]}\n\n`;
    
    // セクション別にグループ化
    const sections = {};
    priorityTasks.forEach(task => {
      if (!sections[task.section]) {
        sections[task.section] = [];
      }
      sections[task.section].push(task);
    });
    
    Object.entries(sections).forEach(([section, sectionTasks]) => {
      md += `#### ${section}\n\n`;
      md += `| タスクID | タスク名 | サブセクション | 状態 | 期間 | 依存関係 |\n`;
      md += `|----------|----------|----------------|------|------|----------|\n`;
      
      sectionTasks.forEach(task => {
        const status = task.completed ? '✅ 完了' : '⬜ 未完了';
        const deps = task.dependencies.length > 0 ? task.dependencies.join(', ') : '-';
        md += `| ${task.id} | ${task.name} | ${task.subsection} | ${status} | ${task.duration} | ${deps} |\n`;
      });
      
      md += `\n`;
    });
  });
  
  md += `---

## セクション別タスク一覧

`;

  // セクション別に全タスクを出力
  const allSections = {};
  tasks.forEach(task => {
    if (!allSections[task.section]) {
      allSections[task.section] = [];
    }
    allSections[task.section].push(task);
  });
  
  Object.entries(allSections).forEach(([section, sectionTasks]) => {
    const completed = sectionTasks.filter(t => t.completed).length;
    const total = sectionTasks.length;
    const percentage = Math.round((completed / total) * 100);
    
    md += `### ${section} (${completed}/${total} = ${percentage}%)\n\n`;
    md += `| タスクID | タスク名 | 優先度 | 状態 | 期間 |\n`;
    md += `|----------|----------|--------|------|------|\n`;
    
    sectionTasks.forEach(task => {
      const status = task.completed ? '✅' : '⬜';
      const priorityEmoji = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢'
      }[task.priority];
      md += `| ${task.id} | ${task.name} | ${priorityEmoji} ${task.priority} | ${status} | ${task.duration} |\n`;
    });
    
    md += `\n`;
  });
  
  md += `---

## 使い方

### タスクの確認

1. **優先度別**: 上記の優先度別セクションで、実装すべきタスクの優先順位を確認
2. **セクション別**: 機能領域ごとのタスク進捗を確認
3. **依存関係**: 各タスクの依存関係列を確認し、実装順序を決定

### ガントチャート

タスクのスケジュールと全体像は[GANTT.md](./GANTT.md)を参照してください。

### 進捗の更新

タスクを完了したら、[PROGRESS.md](./PROGRESS.md)のチェックボックスを更新し、
このスクリプトを再実行してタスク一覧とガントチャートを更新してください:

\`\`\`bash
cd .github/scripts
node generate_tasks.js
\`\`\`

---

*このファイルは自動生成されました。手動で編集しないでください。*
*更新する場合は、PROGRESS.mdを編集してからスクリプトを実行してください。*
`;
  
  return md;
}

/**
 * ガントチャートのMarkdownを生成
 */
function generateGanttMarkdown(data) {
  const { statistics, tasks } = data;
  
  const simplifiedGantt = generateSimplifiedGanttChart(tasks);
  const milestoneGantt = generateMilestoneGanttChart(tasks);
  
  let md = `# 実装ガントチャート

最終更新: ${new Date().toISOString().split('T')[0]}

## 概要

PROGRESS.mdから抽出したタスクをガントチャート形式で可視化しています。

### 統計情報

- **総タスク数**: ${statistics.total}
- **完了**: ${statistics.completed} (${statistics.percentage}%)
- **残り**: ${statistics.remaining}

---

## フェーズ別ガントチャート（推奨）

実装をフェーズに分けて可視化しています。各フェーズの完了マイルストーンも表示されます。

${milestoneGantt}

---

## 優先度別ガントチャート

未完了タスクを優先度別に並べています。

${simplifiedGantt}

---

## ガントチャートの見方

### 凡例

- **緑色のバー**: 完了済みタスク
- **青色のバー**: 未完了タスク（進行中）
- **マイルストーン**: 各フェーズの完了地点

### フェーズの説明

1. **フェーズ1: 基盤構築**
   - 技術スタックのセットアップ
   - プロジェクト構造の整備
   - データベース設計

2. **フェーズ2: バックエンド開発**
   - Models, DTOs, Repositories, Services, Controllers の実装

3. **フェーズ3: フロントエンド開発**
   - コンポーネントの実装
   - ライブラリ・ユーティリティの整備

4. **フェーズ4: 機能実装**
   - 主要機能（機器管理、ユーザー管理、貸出管理）の実装
   - 画面遷移の実装

5. **フェーズ5: 品質向上**
   - テストの実装
   - コーディング規約の適用

6. **フェーズ6: デプロイ準備**
   - インフラ設定
   - ドキュメント整備

---

## タスクの詳細

各タスクの詳細情報は[TASKS.md](./TASKS.md)を参照してください。

---

## 更新方法

PROGRESS.mdのチェックリストを更新した後、以下のコマンドで再生成:

\`\`\`bash
cd .github/scripts
node generate_tasks.js
\`\`\`

---

*このファイルは自動生成されました。手動で編集しないでください。*
*更新する場合は、PROGRESS.mdを編集してからスクリプトを実行してください。*
`;
  
  return md;
}

/**
 * メイン処理
 */
function main() {
  console.log('=== タスクとガントチャート生成ツール ===\n');
  
  // ステップ1: PROGRESS.mdをパース
  console.log('1. PROGRESS.mdを解析中...');
  let tasks = parseProgress();
  console.log(`   ✓ ${tasks.length}個のタスクを抽出しました\n`);
  
  // ステップ2: 依存関係を設定
  console.log('2. タスクの依存関係を設定中...');
  tasks = setDependencies(tasks);
  console.log('   ✓ 依存関係を設定しました\n');
  
  // ステップ3: タスクをグループ化
  console.log('3. タスクを優先度別にグループ化中...');
  const grouped = groupTasksByPriority(tasks);
  console.log('   ✓ グループ化完了\n');
  
  // ステップ4: 統計情報を計算
  console.log('4. 統計情報を計算中...');
  const statistics = calculateStatistics(tasks);
  console.log('   ✓ 統計情報を計算しました\n');
  
  const data = {
    generated: new Date().toISOString(),
    statistics,
    tasks,
    grouped
  };
  
  // ステップ5: JSONファイルを保存
  console.log('5. タスク情報をJSONファイルに保存中...');
  const tasksJsonPath = path.join(__dirname, 'tasks.json');
  fs.writeFileSync(tasksJsonPath, JSON.stringify(data, null, 2));
  console.log(`   ✓ ${tasksJsonPath} に保存しました\n`);
  
  // ステップ6: タスク一覧Markdownを生成
  console.log('6. タスク一覧（TASKS.md）を生成中...');
  const tasksMarkdown = generateTasksMarkdown(data);
  const tasksPath = path.join(__dirname, '../docs/TASKS.md');
  fs.writeFileSync(tasksPath, tasksMarkdown);
  console.log(`   ✓ ${tasksPath} を生成しました\n`);
  
  // ステップ7: ガントチャートMarkdownを生成
  console.log('7. ガントチャート（GANTT.md）を生成中...');
  const ganttMarkdown = generateGanttMarkdown(data);
  const ganttPath = path.join(__dirname, '../docs/GANTT.md');
  fs.writeFileSync(ganttPath, ganttMarkdown);
  console.log(`   ✓ ${ganttPath} を生成しました\n`);
  
  // サマリー
  console.log('=== 完了 ===\n');
  console.log('生成されたファイル:');
  console.log(`  - ${tasksPath}`);
  console.log(`  - ${ganttPath}`);
  console.log(`  - ${tasksJsonPath}`);
  console.log('\n統計情報:');
  console.log(`  総タスク数: ${statistics.total}`);
  console.log(`  完了: ${statistics.completed} (${statistics.percentage}%)`);
  console.log(`  残り: ${statistics.remaining}`);
  console.log('\n優先度別:');
  console.log(`  最優先: ${statistics.byPriority.critical.total}個 (完了: ${statistics.byPriority.critical.completed})`);
  console.log(`  高: ${statistics.byPriority.high.total}個 (完了: ${statistics.byPriority.high.completed})`);
  console.log(`  中: ${statistics.byPriority.medium.total}個 (完了: ${statistics.byPriority.medium.completed})`);
  console.log(`  低: ${statistics.byPriority.low.total}個 (完了: ${statistics.byPriority.low.completed})`);
}

if (require.main === module) {
  main();
}

module.exports = { generateTasksMarkdown, generateGanttMarkdown };
