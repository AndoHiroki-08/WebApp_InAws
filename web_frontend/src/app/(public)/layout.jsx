/**
 * 公開ページ用レイアウト
 * 
 * 認証不要のページ（ホーム画面）用のレイアウトコンポーネントです。
 * - ヘッダーとフッターを含む公開ページ用デザイン
 * - MUIテーマの適用
 * - レスポンシブデザイン対応
 * 
 * @component
 */
'use client';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  CssBaseline
} from '@mui/material';

export default function PublicLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* ヘッダー */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold'
            }}
          >
            📱 レンタル機器管理システム
          </Typography>
        </Toolbar>
      </AppBar>

      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flex: 1,
          backgroundColor: '#f5f7fa',
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(25, 118, 210, 0.1) 0%, transparent 70%),
            radial-gradient(circle at 75% 75%, rgba(25, 118, 210, 0.05) 0%, transparent 70%)
          `,
        }}
      >
        {children}
      </Box>

      {/* フッター */}
      <Paper
        component="footer"
        sx={{
          py: 2,
          backgroundColor: '#2c3e50',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2">
            © 2025 レンタル機器管理システム - All rights reserved
          </Typography>
        </Container>
      </Paper>
    </Box>
  );
}