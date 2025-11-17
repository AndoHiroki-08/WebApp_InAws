/**
 * スタイル付きボタンコンポーネント
 * 
 * MUIのButtonコンポーネントをベースにカスタムスタイルを適用したボタンです。
 * - ローディング状態の表示
 * - ホバーエフェクトとアニメーション
 * - 統一されたデザインシステム
 * - 複数のバリアント・サイズ対応
 * 
 * @component
 * @param {boolean} loading - ローディング状態
 * @param {ReactNode} startIcon - 開始アイコン
 * @param {ReactNode} endIcon - 終了アイコン
 */
'use client';
import { Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const CustomButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 3),
  minHeight: '40px',
  position: 'relative',
  
  // バリアント別スタイル
  ...(variant === 'contained' && {
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    '&:hover': {
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
      transform: 'translateY(-1px)',
    },
  }),
  
  ...(variant === 'outlined' && {
    borderWidth: '2px',
    '&:hover': {
      borderWidth: '2px',
      transform: 'translateY(-1px)',
    },
  }),
  
  // サイズ別スタイル
  '&.MuiButton-sizeSmall': {
    padding: theme.spacing(0.5, 2),
    minHeight: '32px',
  },
  
  '&.MuiButton-sizeLarge': {
    padding: theme.spacing(1.5, 4),
    minHeight: '48px',
    fontSize: '1.1rem',
  },
  
  // ローディング時のスタイル
  '&.loading': {
    color: 'transparent',
  },
  
  transition: 'all 0.2s ease-in-out',
}));

const LoadingWrapper = styled('div')({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

export default function StyledButton({ 
  children, 
  loading = false, 
  startIcon,
  endIcon,
  ...props 
}) {
  return (
    <CustomButton 
      {...props}
      className={loading ? 'loading' : ''}
      disabled={loading || props.disabled}
      startIcon={!loading ? startIcon : undefined}
      endIcon={!loading ? endIcon : undefined}
    >
      {loading && (
        <LoadingWrapper>
          <CircularProgress 
            size={20} 
            color="inherit"
          />
        </LoadingWrapper>
      )}
      {children}
    </CustomButton>
  );
}