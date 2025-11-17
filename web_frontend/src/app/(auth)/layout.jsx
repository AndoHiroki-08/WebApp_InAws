'use client';
import {
  Box,
  Container,
  Paper,
  Typography,
  CssBaseline
} from '@mui/material';

export default function AuthLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e3f2fd',
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(25, 118, 210, 0.1) 0%, transparent 70%),
          radial-gradient(circle at 75% 75%, rgba(25, 118, 210, 0.05) 0%, transparent 70%)
        `,
      }}
    >
      <CssBaseline />
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* ロゴ・タイトル */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              📱 レンタル機器管理システム
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Rental Machine Management System
            </Typography>
          </Box>

          {/* コンテンツ */}
          {children}
        </Paper>
      </Container>
    </Box>
  );
}