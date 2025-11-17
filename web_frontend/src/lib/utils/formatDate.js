/**
 * 日付ユーティリティ関数
 * 
 * アプリケーション全体で使用する日付関連のヘルパー関数を提供します。
 * - 日付のフォーマット変換
 * - 日付の差分計算
 * - 返却期限の判定
 * - 日本語形式での日付表示
 * 
 * @module DateUtils
 */

/**
 * 日付をフォーマットする
 * @param {Date|string} date - フォーマットする日付
 * @param {string} format - フォーマット形式 ('YYYY-MM-DD', 'YYYY/MM/DD', 'MM/DD')
 * @returns {string} フォーマットされた日付文字列
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  switch (format) {
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`;
    case 'MM/DD':
      return `${month}/${day}`;
    case 'YYYY-MM-DD':
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * 日付の差分を計算する
 * @param {Date|string} date1 - 開始日
 * @param {Date|string} date2 - 終了日
 * @returns {number} 日数の差分
 */
export function dateDiff(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}