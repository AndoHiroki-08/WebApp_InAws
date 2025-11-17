/**
 * スタイル付きインプットコンポーネント
 * 
 * MUIのTextFieldコンポーネントをベースにカスタムスタイルを適用した入力フィールドです。
 * - 統一されたボーダー半径
 * - フォームバリデーション対応
 * - アクセシビリティ機能
 * - 各種入力タイプのサポート
 * 
 * @component
 * @param {Object} props - MUI TextFieldのprops
 */
'use client';
import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
  },
}));

export default function StyledInput({ 
  startAdornment, 
  endAdornment, 
  InputProps, 
  ...props 
}) {
  // InputPropsを適切に処理
  const inputProps = {
    ...InputProps,
    ...(startAdornment && { startAdornment }),
    ...(endAdornment && { endAdornment }),
  };

  return (
    <CustomTextField 
      {...props} 
      InputProps={inputProps}
    />
  );
}