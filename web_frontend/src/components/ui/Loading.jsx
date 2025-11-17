/**
 * ローディング・スケルトンUIコンポーネント集
 * 
 * データ取得中やページ遷移時に表示する各種ローディングUIを提供します。
 * - 全画面ローディング
 * - インラインローディング
 * - カード形式のスケルトンUI
 * - テーブル形式のスケルトンUI
 * - シンプルスピナー
 * 
 * @component
 */
'use client';
import { Box, CircularProgress, Typography, Skeleton } from '@mui/material';

// 全画面ローディング
export function FullScreenLoading({ message = '読み込み中...' }) {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 9999,
      }}
    >
      <CircularProgress size={60} sx={{ mb: 2 }} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

// インライン ローディング
export function InlineLoading({ message = '読み込み中...', size = 40 }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <CircularProgress size={size} sx={{ mb: 2 }} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

// カードローディング（スケルトン）
export function CardSkeleton({ count = 1 }) {
  return (
    <Box sx={{ width: '100%' }}>
      {Array.from({ length: count }, (_, index) => (
        <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
          <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 1, width: '80%' }} />
          <Skeleton variant="text" sx={{ fontSize: '0.875rem', width: '60%' }} />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Skeleton variant="rectangular" width={80} height={32} />
            <Skeleton variant="rectangular" width={80} height={32} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// テーブルローディング（スケルトン）
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <Box sx={{ width: '100%' }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, p: 1 }}>
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton key={index} variant="text" sx={{ flex: 1, fontSize: '1rem' }} />
        ))}
      </Box>
      {/* 行 */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <Box key={rowIndex} sx={{ display: 'flex', gap: 2, mb: 1, p: 1 }}>
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton key={colIndex} variant="text" sx={{ flex: 1 }} />
          ))}
        </Box>
      ))}
    </Box>
  );
}

// シンプルスピナー
export function SimpleLoading({ size = 24 }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
      <CircularProgress size={size} />
    </Box>
  );
}