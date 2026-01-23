import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { CheckCircleOutline, ErrorOutline, WarningAmberOutlined } from '@mui/icons-material';

const statusConfig = {
  success: {
    Icon: CheckCircleOutline,
    color: 'success.main',
    bgColor: 'success.light',
  },
  error: {
    Icon: ErrorOutline,
    color: 'error.main',
    bgColor: 'error.light',
  },
  warning: {
    Icon: WarningAmberOutlined,
    color: 'warning.main',
    bgColor: 'warning.light',
  },
};

const VerdictCard = ({ verdict, status }) => {
  const { Icon, color, bgColor } = statusConfig[status] || statusConfig.warning;

  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
        border: `2px solid ${color}`,
        borderRadius: 2,
        minHeight: 120,
      }}
    >
      <Icon sx={{ fontSize: 40, color: color, mb: 1 }} />
      <Typography variant="h5" sx={{ fontWeight: 'bold', color: color }}>
        {verdict}
      </Typography>
    </Paper>
  );
};

export default VerdictCard; 