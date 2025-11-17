'use client';
import { Box, Typography, Button, Alert, AlertTitle } from '@mui/material';
import { Error, Refresh, Home } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

// 全画面エラー
export function FullScreenError({ 
  title = 'エラーが発生しました',
  message = 'しばらく時間をおいて再度お試しください。',
  onRetry,
  showHomeButton = true
}) {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        p: 4,
        textAlign: 'center',
      }}
    >
      <Error sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '500px' }}>
        {message}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {onRetry && (
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={onRetry}
          >
            再試行
          </Button>
        )}
        {showHomeButton && (
          <Button
            variant="outlined"
            startIcon={<Home />}
            onClick={() => router.push('/menu')}
          >
            ホームに戻る
          </Button>
        )}
      </Box>
    </Box>
  );
}

// インラインエラー
export function InlineError({ 
  message, 
  onRetry, 
  severity = 'error' 
}) {
  return (
    <Alert 
      severity={severity} 
      sx={{ mb: 2 }}
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            再試行
          </Button>
        )
      }
    >
      {message}
    </Alert>
  );
}

// フォームエラー
export function FormError({ errors }) {
  if (!errors || errors.length === 0) return null;

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      <AlertTitle>入力エラー</AlertTitle>
      <Box component="ul" sx={{ pl: 2, m: 0 }}>
        {errors.map((error, index) => (
          <Typography component="li" key={index} variant="body2">
            {error}
          </Typography>
        ))}
      </Box>
    </Alert>
  );
}

// 404エラー
export function NotFoundError() {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        p: 4,
        textAlign: 'center',
      }}
    >
      <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'text.secondary' }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
        ページが見つかりません
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        お探しのページは存在しないか、移動された可能性があります。
      </Typography>
      <Button
        variant="contained"
        startIcon={<Home />}
        onClick={() => router.push('/menu')}
      >
        ホームに戻る
      </Button>
    </Box>
  );
}

// ネットワークエラー
export function NetworkError({ onRetry }) {
  return (
    <FullScreenError
      title="接続エラー"
      message="インターネット接続を確認して、再度お試しください。"
      onRetry={onRetry}
    />
  );
}