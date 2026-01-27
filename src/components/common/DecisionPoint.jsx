import React from 'react';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

const DecisionPoint = ({ title, narrative, buttonText, onAction, isLoading }) => {
  return (
    <Paper 
      variant="outlined"
      sx={{ 
        p: 2, 
        mt: 4, 
        mb: 2,
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        border: '1px solid', 
        borderColor: 'primary.main',
        textAlign: 'center',
        backdropFilter: 'blur(5px)',
      }}
    >
      <Typography variant="h6" color="white">{title}</Typography>
      <Typography variant="body2" sx={{ my: 1, color: 'rgba(255, 255, 255, 0.8)' }}>
        {narrative}
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
        onClick={onAction}
        disabled={isLoading}
        sx={{ mt: 1 }}
      >
        {isLoading ? 'Executing...' : buttonText}
      </Button>
    </Paper>
  );
};

export default DecisionPoint; 