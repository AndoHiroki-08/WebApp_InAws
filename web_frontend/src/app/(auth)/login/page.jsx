/**
 * ログインページコンポーネント
 * 
 * ユーザー認証を行うログイン画面を提供します。
 * - 社員番号とパスワードによる認証
 * - 仮認証機能（開発用）
 * - レスポンシブデザイン対応
 * - エラーハンドリングとローディング状態の管理
 * 
 * 仮認証データ:
 * - admin: 管理者権限
 * - user: 一般ユーザー権限
 * 
 * @component
 */
'use client';
import { useState } from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { LoginRounded, PersonRounded, LockRounded } from '@mui/icons-material';
import { StyledInput, StyledButton } from '../../../components/ui';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../lib/stores/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    employeeNo: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // エラーをクリア
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 仮の認証ロジック（実際のAPIに置き換える）
      if (formData.employeeNo && formData.password) {
        // 仮のユーザーデータ
        const mockUser = {
          employeeNo: formData.employeeNo,
          name: 'テストユーザー',
          department: 'IT部',
          accountLevel: formData.employeeNo === 'admin' // adminの場合は管理者権限
        };
        
        setUser(mockUser);
        router.push('/menu');
      } else {
        setError('社員番号とパスワードを入力してください');
      }
    } catch (err) {
      setError('ログインに失敗しました。再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* ヘッダー */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              mb: 2,
              boxShadow: '0 8px 16px rgba(25, 118, 210, 0.3)'
            }}
          >
            <LoginRounded sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              mb: 1,
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            ログイン
          </Typography>
          <Typography variant="body1" color="text.secondary">
            レンタル機器管理システム
          </Typography>
        </Box>

        {/* エラー表示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* ログインフォーム */}
        <Box component="form" onSubmit={handleSubmit} sx={{ space: 2 }}>
          <StyledInput
            fullWidth
            name="employeeNo"
            placeholder="社員番号"
            value={formData.employeeNo}
            onChange={handleInputChange}
            startAdornment={<PersonRounded sx={{ color: 'text.secondary', mr: 1 }} />}
            sx={{ mb: 3 }}
            disabled={loading}
          />

          <StyledInput
            fullWidth
            name="password"
            type="password"
            placeholder="パスワード"
            value={formData.password}
            onChange={handleInputChange}
            startAdornment={<LockRounded sx={{ color: 'text.secondary', mr: 1 }} />}
            sx={{ mb: 4 }}
            disabled={loading}
          />

          <StyledButton
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            loading={loading}
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0, #1976d2)',
              }
            }}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </StyledButton>
        </Box>

        {/* フッター */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            © 2025 レンタル機器管理システム
          </Typography>
        </Box>

        {/* 仮ログイン用のヒント */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.main', color: 'white', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            🔧 開発用ログイン
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            社員番号: admin → 管理者権限<br />
            社員番号: user → 一般ユーザー<br />
            パスワード: 任意の文字列
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}