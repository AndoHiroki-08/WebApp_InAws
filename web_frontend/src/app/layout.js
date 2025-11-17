/**
 * アプリケーションルートレイアウト
 * 
 * Next.js App Routerのルートレイアウトコンポーネントです。
 * - 全ページ共通のHTML構造を定義
 * - MUIテーマシステムの適用
 * - メタデータの設定
 * - グローバルスタイルの読み込み
 * 
 * @component
 */
import * as React from 'react';
import ThemeRegistry from '../components/ThemeRegistry/ThemeRegistry';

export const metadata = {
  title: 'レンタル機器管理システム',
  description: 'IT機器のレンタル管理を効率化するWebアプリケーション',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry options={{ key: 'mui' }}>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}