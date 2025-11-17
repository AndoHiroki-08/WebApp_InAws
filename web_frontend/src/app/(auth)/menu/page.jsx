/**
 * メニューページコンポーネント
 * 
 * ログイン後のメイン画面として、アプリケーションの各機能へのナビゲーションを提供します。
 * - 機器管理、レンタル管理、ユーザー管理への導線
 * - ユーザー情報とリマインダー機能の表示
 * - 管理者権限に基づく機能制限
 * - レスポンシブなカードレイアウト
 * 
 * @component
 */
'use client';
import { Box, Typography, Grid } from '@mui/material';
import { Computer, Assignment, People, Dashboard, ExitToApp } from '@mui/icons-material';
import { StyledCard, StyledButton } from '../../../components/ui';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../lib/stores/authStore';

export default function MenuPage() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const menuItems = [
    {
      title: '機器管理',
      description: 'PC、タブレット等のIT機器の登録・管理',
      icon: <Computer sx={{ fontSize: 40, color: '#1976d2' }} />,
      path: '/machines',
      adminOnly: false,
    },
    {
      title: '貸出管理',
      description: '機器の貸出・返却処理の管理',
      icon: <Assignment sx={{ fontSize: 40, color: '#1976d2' }} />,
      path: '/rentals',
      adminOnly: false,
    },
    {
      title: 'ユーザー管理',
      description: 'システムユーザーの登録・権限管理',
      icon: <People sx={{ fontSize: 40, color: '#1976d2' }} />,
      path: '/users',
      adminOnly: true,
    },
  ];

  // 権限に基づいてメニュー項目をフィルタリング
  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || isAdmin()
  );

  return (
    <Box sx={{ p: 4 }}>
      {/* ユーザー情報ヘッダー */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            📱 レンタル機器管理システム
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {user?.name || 'ユーザー'} さん（{user?.department || '部署未設定'}）
            {isAdmin() && (
              <Typography component="span" sx={{ 
                ml: 2, 
                px: 1, 
                py: 0.5, 
                bgcolor: 'primary.main', 
                color: 'white', 
                borderRadius: 1, 
                fontSize: '0.8rem' 
              }}>
                管理者
              </Typography>
            )}
          </Typography>
        </Box>
        <StyledButton
          variant="outlined"
          startIcon={<ExitToApp />}
          onClick={handleLogout}
        >
          ログアウト
        </StyledButton>
      </Box>

      {/* メニューグリッド */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        メニュー
      </Typography>
      
      <Grid container spacing={3}>
        {filteredMenuItems.map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <StyledCard
              sx={{
                height: '100%',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
              onClick={() => router.push(item.path)}
            >
              <Box sx={{ mb: 2 }}>
                {item.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
      
      {/* リマインダーセクション（今後実装予定） */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          📋 リマインダー
        </Typography>
        <StyledCard>
          <Typography color="text.secondary">
            返却期限の近い機器や重要な通知がここに表示されます。
          </Typography>
        </StyledCard>
      </Box>
    </Box>
  );
}