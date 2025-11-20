#!/usr/bin/env node

/**
 * タスク情報からMermaid形式のガントチャートを生成するスクリプト
 */

const fs = require('fs');
const path = require('path');

/**
 * Mermaidガントチャートのヘッダーを生成
 */
function generateHeader() {
  return `\`\`\`mermaid
gantt
    title Rental Machine App 実装ガントチャート
    dateFormat YYYY-MM-DD
    axisFormat %m/%d
    todayMarker off
`;
}

/**
 * タスクをガントチャート形式に変換
 */
function taskToGanttLine(task, sectionName, startDate) {
  const status = task.completed ? 'done' : 'active';
  const duration = parseDuration(task.duration);
  const deps = task.dependencies.length > 0 ? `, after ${task.dependencies.join(' ')}` : '';
  
  // タスク名をエスケープ
  const taskName = task.name.replace(/:/g, '：').substring(0, 50);
  
  return `    ${taskName} :${status}, ${task.id}, ${startDate}, ${duration}${deps}`;
}

/**
 * 期間文字列をガントチャート用の日数に変換
 */
function parseDuration(durationStr) {
  if (durationStr === '継続' || durationStr === '未定') {
    return '7d'; // デフォルト1週間
  }
  
  const match = durationStr.match(/(\d+)週間/);
  if (match) {
    const weeks = parseInt(match[1]);
    return `${weeks * 7}d`;
  }
  
  return '7d';
}

/**
 * セクションごとにタスクをグループ化してガントチャートを生成
 */
function generateGanttChart(tasks) {
  let gantt = generateHeader();
  
  // 開始日を設定（今日から）
  const baseDate = new Date();
  const dateStr = baseDate.toISOString().split('T')[0];
  
  // セクションでグループ化
  const sections = {};
  tasks.forEach(task => {
    if (!sections[task.section]) {
      sections[task.section] = [];
    }
    sections[task.section].push(task);
  });
  
  // 各セクションのタスクを追加
  let cumulativeDays = 0;
  Object.entries(sections).forEach(([sectionName, sectionTasks]) => {
    gantt += `\n    section ${sectionName}\n`;
    
    sectionTasks.forEach(task => {
      const taskDate = new Date(baseDate);
      taskDate.setDate(taskDate.getDate() + cumulativeDays);
      const taskDateStr = taskDate.toISOString().split('T')[0];
      
      gantt += taskToGanttLine(task, sectionName, taskDateStr) + '\n';
      
      // 次のタスクのために日数を累積
      if (!task.completed) {
        const duration = parseDuration(task.duration);
        const days = parseInt(duration.replace('d', ''));
        cumulativeDays += Math.floor(days / sectionTasks.length);
      }
    });
  });
  
  gantt += '```\n';
  return gantt;
}

/**
 * 簡略版ガントチャート（優先度別）を生成
 */
function generateSimplifiedGanttChart(tasks, priorityFilter = null) {
  let gantt = generateHeader();
  
  const baseDate = new Date();
  
  // 優先度でフィルタリング
  let filteredTasks = tasks;
  if (priorityFilter) {
    filteredTasks = tasks.filter(t => t.priority === priorityFilter);
  }
  
  // 優先度でグループ化
  const priorities = ['critical', 'high', 'medium', 'low'];
  const grouped = {};
  
  priorities.forEach(priority => {
    grouped[priority] = filteredTasks.filter(t => t.priority === priority);
  });
  
  let cumulativeDays = 0;
  
  priorities.forEach(priority => {
    const priorityTasks = grouped[priority];
    if (priorityTasks.length === 0) return;
    
    const priorityLabel = {
      critical: '最優先',
      high: '高優先度',
      medium: '中優先度',
      low: '低優先度'
    }[priority];
    
    gantt += `\n    section ${priorityLabel}\n`;
    
    // 未完了タスクのみ表示（完了タスクは除外して簡潔に）
    const incompleteTasks = priorityTasks.filter(t => !t.completed).slice(0, 10); // 最大10個
    
    incompleteTasks.forEach((task, index) => {
      const taskDate = new Date(baseDate);
      taskDate.setDate(taskDate.getDate() + cumulativeDays);
      const taskDateStr = taskDate.toISOString().split('T')[0];
      
      gantt += taskToGanttLine(task, priorityLabel, taskDateStr) + '\n';
      
      // 次のタスクのために日数を累積
      const duration = parseDuration(task.duration);
      const days = parseInt(duration.replace('d', ''));
      cumulativeDays += 1; // タスク間は1日ずつずらす
    });
  });
  
  gantt += '```\n';
  return gantt;
}

/**
 * マイルストーン付きガントチャートを生成
 */
function generateMilestoneGanttChart(tasks) {
  let gantt = generateHeader();
  
  const baseDate = new Date();
  
  // マイルストーンの定義
  const milestones = [
    { name: 'フェーズ1: 基盤構築', sections: ['技術スタック実装状況', 'プロジェクト構造実装状況', 'データベース実装状況'], duration: '4週間' },
    { name: 'フェーズ2: バックエンド開発', sections: ['バックエンド実装状況'], duration: '4週間' },
    { name: 'フェーズ3: フロントエンド開発', sections: ['コンポーネント実装状況', 'ライブラリ・ユーティリティ実装状況'], duration: '4週間' },
    { name: 'フェーズ4: 機能実装', sections: ['主要機能実装状況', '画面遷移実装状況'], duration: '8週間' },
    { name: 'フェーズ5: 品質向上', sections: ['テスト実装状況', 'コーディング規約準拠状況'], duration: '3週間' },
    { name: 'フェーズ6: デプロイ準備', sections: ['デプロイメント・インフラ', 'ドキュメント'], duration: '2週間' },
  ];
  
  let cumulativeDays = 0;
  
  milestones.forEach((milestone, index) => {
    gantt += `\n    section ${milestone.name}\n`;
    
    const milestoneTasks = tasks.filter(t => milestone.sections.includes(t.section));
    const incompleteTasks = milestoneTasks.filter(t => !t.completed).slice(0, 5); // 各マイルストーンで最大5個
    
    if (incompleteTasks.length === 0) {
      // タスクがない場合はマイルストーンマーカーのみ
      const milestoneDate = new Date(baseDate);
      milestoneDate.setDate(milestoneDate.getDate() + cumulativeDays);
      const milestoneDateStr = milestoneDate.toISOString().split('T')[0];
      gantt += `    ${milestone.name}完了 :milestone, M${index + 1}, ${milestoneDateStr}, 1d\n`;
    } else {
      incompleteTasks.forEach(task => {
        const taskDate = new Date(baseDate);
        taskDate.setDate(taskDate.getDate() + cumulativeDays);
        const taskDateStr = taskDate.toISOString().split('T')[0];
        
        gantt += taskToGanttLine(task, milestone.name, taskDateStr) + '\n';
        
        const duration = parseDuration(task.duration);
        const days = parseInt(duration.replace('d', ''));
        cumulativeDays += Math.ceil(days / incompleteTasks.length);
      });
      
      // マイルストーンマーカー
      const milestoneDate = new Date(baseDate);
      milestoneDate.setDate(milestoneDate.getDate() + cumulativeDays);
      const milestoneDateStr = milestoneDate.toISOString().split('T')[0];
      gantt += `    ${milestone.name}完了 :milestone, M${index + 1}, ${milestoneDateStr}, 1d\n`;
    }
    
    // フェーズ間に余裕を持たせる
    cumulativeDays += 7;
  });
  
  gantt += '```\n';
  return gantt;
}

// メイン処理
function main() {
  const tasksPath = path.join(__dirname, 'tasks.json');
  
  if (!fs.existsSync(tasksPath)) {
    console.error('tasks.jsonが見つかりません。先にparse_progress.jsを実行してください。');
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
  const tasks = data.tasks;
  
  console.log('ガントチャートを生成中...');
  
  // 3種類のガントチャートを生成
  const fullGantt = generateGanttChart(tasks);
  const simplifiedGantt = generateSimplifiedGanttChart(tasks);
  const milestoneGantt = generateMilestoneGanttChart(tasks);
  
  return {
    full: fullGantt,
    simplified: simplifiedGantt,
    milestone: milestoneGantt
  };
}

if (require.main === module) {
  const charts = main();
  console.log('\n=== 簡略版ガントチャート（優先度別） ===');
  console.log(charts.simplified);
}

module.exports = { generateGanttChart, generateSimplifiedGanttChart, generateMilestoneGanttChart };
