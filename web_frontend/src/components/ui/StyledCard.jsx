'use client';
import { Card, CardContent, CardActions, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCardBase = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
}));

export default function StyledCard({ 
  title, 
  subtitle, 
  children, 
  actions, 
  hover = true,
  ...props 
}) {
  return (
    <StyledCardBase 
      {...props}
      sx={{
        ...props.sx,
        '&:hover': hover ? undefined : 'none',
        transform: hover ? undefined : 'none',
      }}
    >
      <StyledCardContent>
        {(title || subtitle) && (
          <Box sx={{ mb: 2 }}>
            {title && (
              <Typography 
                variant="h6" 
                component="h2" 
                sx={{ fontWeight: 'bold', mb: 0.5 }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mb: 1 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
        {children}
      </StyledCardContent>
      {actions && (
        <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
          {actions}
        </CardActions>
      )}
    </StyledCardBase>
  );
}