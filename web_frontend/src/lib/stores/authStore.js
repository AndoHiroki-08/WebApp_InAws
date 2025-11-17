/**
 * 認証状態管理ストア
 * 
 * Zustandを使用してユーザーの認証状態とユーザー情報を管理します。
 * - ログイン/ログアウト状態の管理
 * - ユーザー情報の永続化（localStorage使用）
 * - 管理者権限の判定機能
 * - 認証状態に基づく画面制御のサポート
 * 
 * @store
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // 初期状態
      user: null,
      isAuthenticated: false,
      
      // アクション
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user
        });
      },
      
      logout: () => {
        set({
          user: null,
          isAuthenticated: false
        });
      },
      
      // ユーザー情報の取得
      getUser: () => get().user,
      
      // 管理者権限の確認
      isAdmin: () => {
        const user = get().user;
        return user && user.accountLevel === true;
      }
    }),
    {
      name: 'auth-store', // localStorage のキー名
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export { useAuthStore };