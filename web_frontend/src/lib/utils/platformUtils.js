/**
 * プラットフォーム判定ユーティリティ
 * 
 * ブラウザかPWAアプリかを判定し、サーバー接続性を確認するためのヘルパー関数を提供します。
 * オンライン/オフライン状態の管理はonlineStoreで行います。
 * 画面サイズに関するレスポンシブ対応はMUIのcssプロパティで行います。
 * 
 * @module PlatformUtils
 */

/**
 * 現在の環境がPWAアプリ(インストール済み)かどうかを判定
 * @returns {boolean} PWAアプリの場合true
 */
export function isApp() {
  if (typeof window === 'undefined') return false;
  
  // PWAとしてインストール済みかどうかをチェック
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

/**
 * 現在の環境がブラウザかどうかを判定
 * @returns {boolean} ブラウザの場合true
 */
export function isBrowser() {
  return !isApp();
}

/**
 * サーバーへの接続性を確認
 * @param {string} url - 確認するサーバーのURL (デフォルト: /api/health)
 * @param {number} timeout - タイムアウト時間(ms) (デフォルト: 5000)
 * @returns {Promise<boolean>} サーバーに接続可能な場合true
 */
export async function checkServerConnectivity(url = '/api/health', timeout = 5000) {
  if (typeof window === 'undefined') return true;
  
  // まずNavigator.onLineをチェック
  if (!navigator.onLine) return false;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache'
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}