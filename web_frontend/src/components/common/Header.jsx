'use client';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip
} from '@mui/material';
import { 
  Computer, 
  Assignment, 
  People, 
  AccountCircle,
  Notifications,
  ExitToApp 
} from '@mui/icons-material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header({ user, onLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path) => {
    router.push(path);
  };

  const handleLogout = () => {
    handleClose();
    if (onLogout) onLogout();
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        {/* ロゴ・タイトル */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          onClick={() => handleNavigation('/menu')}
        >
          📱 レンタル機器管理システム
        </Typography>

        {/* ナビゲーションメニュー */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          <Button
            color="inherit"
            startIcon={<Computer />}
            onClick={() => handleNavigation('/machines')}
          >
            機器管理
          </Button>
          <Button
            color="inherit"
            startIcon={<Assignment />}
            onClick={() => handleNavigation('/rentals')}
          >
            貸出管理
          </Button>
          <Button
            color="inherit"
            startIcon={<People />}
            onClick={() => handleNavigation('/users')}
          >
            ユーザー管理
          </Button>
        </Box>

        {/* 通知アイコン */}
        <IconButton color="inherit" sx={{ ml: 2 }}>
          <Notifications />
        </IconButton>

        {/* ユーザーメニュー */}
        <Box sx={{ ml: 2 }}>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.name ? user.name.charAt(0) : <AccountCircle />}
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="subtitle2">
                  {user?.name || 'ゲストユーザー'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.department || '未設定'}
                </Typography>
                {user?.accountLevel && (
                  <Chip 
                    label="管理者" 
                    size="small" 
                    color="primary" 
                    sx={{ mt: 0.5, fontSize: '0.7rem' }} 
                  />
                )}
              </Box>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              ログアウト
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}