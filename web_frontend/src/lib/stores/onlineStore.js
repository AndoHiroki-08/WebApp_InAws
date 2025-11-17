/**
 * オンライン状態管理ストア
 * 
 * アプリケーションのオンライン/オフライン状態を管理し、
 * PWA機能やキャッシュ制御に使用します。
 * - ネットワーク接続状態の監視
 * - オフライン時の動作制御
 * - データ同期状態の管理
 * 
 * @store
 */
import { create } from 'zustand';

const useOnlineStore = create((set, get) => ({
  // 初期状態
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  lastSyncTime: null,
  pendingChanges: [],
  
  // アクション
  setOnline: (status) => set({ isOnline: status }),
  
  updateLastSync: () => set({ lastSyncTime: new Date() }),
  
  addPendingChange: (change) => {
    const current = get().pendingChanges;
    set({ pendingChanges: [...current, change] });
  },
  
  clearPendingChanges: () => set({ pendingChanges: [] }),
  
  // ゲッター
  hasPendingChanges: () => get().pendingChanges.length > 0,
}));

export { useOnlineStore };