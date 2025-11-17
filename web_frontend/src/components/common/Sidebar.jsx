'use client';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Chip
} from '@mui/material';
import {
  Computer,
  Assignment,
  People,
  History,
  Dashboard,
  Settings,
  Help
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';

const menuItems = [
  { text: 'ダッシュボード', icon: <Dashboard />, path: '/menu' },
  { text: '機器管理', icon: <Computer />, path: '/machines' },
  { text: '貸出管理', icon: <Assignment />, path: '/rentals' },
  { text: '貸出履歴', icon: <History />, path: '/rentals/history' },
  { text: 'ユーザー管理', icon: <People />, path: '/users', adminOnly: true },
];

const bottomMenuItems = [
  { text: '設定', icon: <Settings />, path: '/settings' },
  { text: 'ヘルプ', icon: <Help />, path: '/help' },
];

export default function Sidebar({ open, onClose, user }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path) => {
    router.push(path);
    if (onClose) onClose();
  };

  const isActive = (path) => {
    if (path === '/menu') {
      return pathname === '/menu' || pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || user?.accountLevel
  );

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          📱 レンタル機器管理
        </Typography>
        {user && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.department}
            </Typography>
            {user.accountLevel && (
              <Chip 
                label="管理者" 
                size="small" 
                color="primary" 
                sx={{ mt: 0.5, fontSize: '0.7rem' }} 
              />
            )}
          </Box>
        )}
      </Box>
      
      <Divider />
      
      <List sx={{ flexGrow: 1 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: '#e3f2fd',
                  borderRight: '3px solid #1976d2',
                  '& .MuiListItemIcon-root': {
                    color: '#1976d2',
                  },
                  '& .MuiListItemText-primary': {
                    color: '#1976d2',
                    fontWeight: 'bold',
                  },
                },
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />
      
      <List>
        {bottomMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}