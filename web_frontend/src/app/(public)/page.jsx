/**
 * ホーム画面コンポーネント
 * 
 * アプリケーションの概要を紹介し、ダウンロードやログインを促すランディングページです。
 * - アプリケーションの機能紹介
 * - プラットフォーム別ダウンロードリンク
 * - 管理画面へのログインボタン
 * - MUIを使用したレスポンシブデザイン
 * 
 * @component
 */
'use client';
import {
  Box,
  Container,
  Typography,
  Grid,
  CardContent,
  CardActions,
  Chip,
  Stack,
  useMediaQuery,
  useTheme
} from '@mui/material';
// 必要なアイコンのみを個別インポート（Tree Shaking最適化）
import ComputerIcon from '@mui/icons-material/Computer';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import LoginIcon from '@mui/icons-material/Login';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import TabletMacIcon from '@mui/icons-material/TabletMac';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import { useRouter } from 'next/navigation';
import { StyledButton, StyledCard } from '../../components/ui';
import { getDownloadLinks, isMobileDevice, isTabletDevice } from '../../lib/utils/platformUtils';

export default function HomePage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const downloadLinks = getDownloadLinks();

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleDownload = (platform) => {
    if (platform === 'pwa') {
      // PWAインストールのトリガー（実装は将来的に）
      alert('PWAとしてホーム画面に追加できます');
    } else {
      window.open(downloadLinks[platform], '_blank');
    }
  };

  const features = [
    {
      icon: <ComputerIcon sx={{ fontSize: 40 }} />,
      title: '機器管理',
      description: 'PC、タブレット等のIT機器を一元管理。リース情報や設置場所も記録可能。',
      color: '#1976d2'
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      title: '貸出管理',
      description: '機器の貸出・返却をスムーズに処理。返却期限の自動リマインド機能付き。',
      color: '#388e3c'
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: 'ユーザー管理',
      description: '社員情報の管理と権限制御。管理者は全機能にアクセス可能。',
      color: '#f57c00'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      {/* ヒーローセクション */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography
          variant={isMobile ? 'h3' : 'h2'}
          component="h1"
          sx={{
            fontWeight: 'bold',
            mb: 2,
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          📱 レンタル機器管理システム
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}
        >
          IT機器のレンタル管理を効率化する統合Webアプリケーション
        </Typography>
        
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          sx={{ mb: 4 }}
        >
          <StyledButton
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
            onClick={handleLoginClick}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)'
            }}
          >
            管理画面にログイン
          </StyledButton>
          
          {isMobileDevice() && (
            <StyledButton
              variant="outlined"
              size="large"
              startIcon={<CloudDownloadIcon />}
              onClick={() => handleDownload('pwa')}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
            >
              アプリをダウンロード
            </StyledButton>
          )}
        </Stack>

        {/* プラットフォーム対応チップ */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          flexWrap="wrap"
          sx={{ gap: 1 }}
        >
          <Chip
            icon={<DesktopWindowsIcon />}
            label="Web"
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<TabletMacIcon />}
            label="Tablet"
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<SmartphoneIcon />}
            label="Mobile"
            color="primary"
            variant="outlined"
          />
        </Stack>
      </Box>

      {/* 主要機能セクション */}
      <Box sx={{ mb: 8 }}>
        <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          sx={{ fontWeight: 'bold', mb: 4 }}
        >
          主要機能
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <StyledCard
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)'
                  }
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      color: feature.color,
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ fontWeight: 'bold', mb: 2 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTAセクション */}
      <StyledCard sx={{ textAlign: 'center', py: 4 }}>
        <CardContent>
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            今すぐ始めましょう
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: '600px', mx: 'auto' }}
          >
            IT機器のレンタル管理を効率化し、業務を大幅に改善できます。
            管理画面にログインして、すべての機能をお試しください。
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
          <StyledButton
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
            onClick={handleLoginClick}
            sx={{
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)'
            }}
          >
            ログインして開始
          </StyledButton>
        </CardActions>
      </StyledCard>
    </Container>
  );
}