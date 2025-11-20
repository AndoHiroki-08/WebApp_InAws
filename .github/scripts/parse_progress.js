#!/usr/bin/env node

/**
 * PROGRESS.mdからタスク情報を抽出し、JSON形式で出力するスクリプト
 */

const fs = require('fs');
const path = require('path');

// PROGRESS.mdのパス
const progressPath = path.join(__dirname, '../docs/PROGRESS.md');

// タスクカテゴリの定義
const categories = {
  '技術スタック実装状況': { section: 1, priority: 'critical', duration: '2週間' },
  'プロジェクト構造実装状況': { section: 2, priority: 'high', duration: '1週間' },
  'コンポーネント実装状況': { section: 3, priority: 'high', duration: '3週間' },
  'ライブラリ・ユーティリティ実装状況': { section: 4, priority: 'medium', duration: '1週間' },
  'バックエンド実装状況': { section: 5, priority: 'critical', duration: '4週間' },
  'データベース実装状況': { section: 6, priority: 'critical', duration: '1週間' },
  '主要機能実装状況': { section: 7, priority: 'high', duration: '6週間' },
  '画面遷移実装状況': { section: 8, priority: 'medium', duration: '2週間' },
  'コーディング規約準拠状況': { section: 9, priority: 'low', duration: '継続' },
  'テスト実装状況': { section: 10, priority: 'medium', duration: '3週間' },
  'デプロイメント・インフラ': { section: 11, priority: 'medium', duration: '1週間' },
  'ドキュメント': { section: 12, priority: 'low', duration: '継続' },
};

/**
 * PROGRESS.mdを読み込んでタスクを抽出
 */
function parseProgress() {
  const content = fs.readFileSync(progressPath, 'utf-8');
  const lines = content.split('\n');
  
  let currentSection = '';
  let currentSubsection = '';
  let currentCategory = null;
  const tasks = [];
  let taskId = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // セクション見出しを検出
    if (line.startsWith('## ') && /^\d+\./.test(line.substring(3))) {
      const sectionTitle = line.substring(3).trim();
      const match = sectionTitle.match(/^\d+\.\s+(.+)$/);
      if (match) {
        currentSection = match[1];
        currentCategory = categories[currentSection] || null;
        currentSubsection = '';
      }
    }
    
    // サブセクション見出しを検出
    else if (line.startsWith('### ')) {
      currentSubsection = line.substring(4).trim();
    }
    
    // チェックリスト項目を検出
    else if (line.trim().startsWith('- [')) {
      const isCompleted = line.includes('[x]');
      const taskName = line.replace(/^[\s-]*\[.\]\s*/, '').trim();
      
      if (taskName && currentSection) {
        const task = {
          id: `TASK-${String(taskId).padStart(3, '0')}`,
          name: taskName,
          section: currentSection,
          subsection: currentSubsection || currentSection,
          category: currentCategory?.section || 0,
          priority: currentCategory?.priority || 'medium',
          duration: currentCategory?.duration || '未定',
          completed: isCompleted,
          dependencies: []
        };
        
        tasks.push(task);
        taskId++;
      }
    }
  }
  
  return tasks;
}

/**
 * タスクの依存関係を設定
 */
function setDependencies(tasks) {
  // 基本的な依存関係のルール
  const rules = [
    // バックエンドの実装順序
    { from: 'Models', to: 'DTOs', section: 'バックエンド実装状況' },
    { from: 'DTOs', to: 'Repositories', section: 'バックエンド実装状況' },
    { from: 'Repositories', to: 'Services', section: 'バックエンド実装状況' },
    { from: 'Services', to: 'Controllers', section: 'バックエンド実装状況' },
    
    // データベースとバックエンド
    { from: 'データベース実装状況', to: 'バックエンド実装状況' },
    
    // 技術スタックとコンポーネント
    { from: '技術スタック実装状況', to: 'コンポーネント実装状況' },
    
    // プロジェクト構造とコンポーネント
    { from: 'プロジェクト構造実装状況', to: 'コンポーネント実装状況' },
    
    // コンポーネントと主要機能
    { from: 'コンポーネント実装状況', to: '主要機能実装状況' },
    
    // バックエンドと主要機能
    { from: 'バックエンド実装状況', to: '主要機能実装状況' },
  ];
  
  // セクション間の依存関係を設定
  rules.forEach(rule => {
    const dependentTasks = tasks.filter(t => 
      t.section === rule.to || (rule.to.includes('実装状況') && t.section === rule.to)
    );
    const prerequisiteTasks = tasks.filter(t => 
      t.section === rule.from || (rule.from.includes('実装状況') && t.section === rule.from)
    );
    
    dependentTasks.forEach(dt => {
      if (prerequisiteTasks.length > 0 && !dt.completed) {
        // 最初の未完了の前提タスクを依存関係として追加
        const uncompletedPrereq = prerequisiteTasks.find(pt => !pt.completed);
        if (uncompletedPrereq && !dt.dependencies.includes(uncompletedPrereq.id)) {
          dt.dependencies.push(uncompletedPrereq.id);
        }
      }
    });
  });
  
  return tasks;
}

/**
 * タスクを優先度別にグループ化
 */
function groupTasksByPriority(tasks) {
  const grouped = {
    critical: tasks.filter(t => t.priority === 'critical'),
    high: tasks.filter(t => t.priority === 'high'),
    medium: tasks.filter(t => t.priority === 'medium'),
    low: tasks.filter(t => t.priority === 'low')
  };
  
  return grouped;
}

/**
 * 統計情報を計算
 */
function calculateStatistics(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const remaining = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const byPriority = {
    critical: { total: 0, completed: 0 },
    high: { total: 0, completed: 0 },
    medium: { total: 0, completed: 0 },
    low: { total: 0, completed: 0 }
  };
  
  tasks.forEach(task => {
    if (byPriority[task.priority]) {
      byPriority[task.priority].total++;
      if (task.completed) {
        byPriority[task.priority].completed++;
      }
    }
  });
  
  return {
    total,
    completed,
    remaining,
    percentage,
    byPriority
  };
}

// メイン処理
function main() {
  console.log('PROGRESS.mdを解析中...');
  
  let tasks = parseProgress();
  console.log(`${tasks.length}個のタスクを抽出しました`);
  
  tasks = setDependencies(tasks);
  console.log('依存関係を設定しました');
  
  const grouped = groupTasksByPriority(tasks);
  const statistics = calculateStatistics(tasks);
  
  const output = {
    generated: new Date().toISOString(),
    statistics,
    tasks,
    grouped
  };
  
  // JSON出力
  console.log('\n=== タスク情報 ===');
  console.log(JSON.stringify(output, null, 2));
  
  return output;
}

if (require.main === module) {
  main();
}

module.exports = { parseProgress, setDependencies, groupTasksByPriority, calculateStatistics };
