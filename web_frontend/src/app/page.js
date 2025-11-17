/**
 * ルートページコンポーネント
 * 
 * アプリケーションのエントリーポイントで、プラットフォームと認証状態に基づいてルーティングを制御します。
 * - Web環境: ホーム画面を表示（未認証時）、メニューページへリダイレクト（認証済み時）
 * - アプリ環境: ログイン画面を表示（未認証時）、メニューページへリダイレクト（認証済み時）
 * 
 * @component
 */
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../lib/stores/authStore';
import { isWebPlatform, isMobileApp } from '../lib/utils/platformUtils';
import HomePage from './(public)/page';
import LoginPage from './(auth)/login/page';
import { FullScreenLoading } from '../components/ui/Loading';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [platformInfo, setPlatformInfo] = useState({
    isWeb: true,
    isMobileApp: false
  });

  useEffect(() => {
    // プラットフォーム判定（クライアントサイドでのみ実行）
    const webPlatform = isWebPlatform();
    const mobileApp = isMobileApp();
    
    setPlatformInfo({
      isWeb: webPlatform,
      isMobileApp: mobileApp
    });
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // すでにログイン済みの場合はメニューページにリダイレクト
    if (isAuthenticated && !isLoading) {
      router.push('/menu');
    }
  }, [isAuthenticated, isLoading, router]);

  // ローディング中は何も表示しない
  if (isLoading) {
    return <FullScreenLoading message="読み込み中..." />;
  }

  // ログイン済みの場合は何も表示しない（リダイレクト処理中）
  if (isAuthenticated) {
    return null;
  }

  // 未認証時の表示制御
  // Web環境: ホーム画面を表示
  // アプリ環境: ログイン画面を直接表示
  if (platformInfo.isWeb && !platformInfo.isMobileApp) {
    return <HomePage />;
  } else {
    return <LoginPage />;
  }
}