'use client';
import { useState } from 'react';
import {
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
  CssBaseline
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Header, Sidebar } from '../../components/common';
import { useAuth } from '../../lib/hooks';

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* ヘッダー */}
      <Header user={user} onLogout={logout} />
      
      {/* メインコンテンツエリア */}
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* モバイル用サイドバートグルボタン */}
        {isMobile && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 1200,
            }}
          >
            <IconButton
              onClick={handleSidebarToggle}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        )}

        {/* サイドバー */}
        <Sidebar
          open={sidebarOpen}
          onClose={handleSidebarClose}
          user={user}
        />

        {/* メインコンテンツ */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            backgroundColor: '#f8fafc',
            minHeight: 'calc(100vh - 64px)', // ヘッダーの高さを引く
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}