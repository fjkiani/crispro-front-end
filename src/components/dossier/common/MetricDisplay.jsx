import React from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { useSpring, animated } from 'react-spring';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const MetricDisplay = ({ title, value, status, color, isLoading, isCompleted }) => {
  const styles = useSpring({
    opacity: isCompleted ? 1 : 0.3,
    transform: isCompleted ? 'translateY(0px)' : 'translateY(10px)',
    config: { tension: 220, friction: 20 },
  });

  const AnimatedPaper = animated(Paper);

  return (
    <AnimatedPaper 
      elevation={3}
      style={styles}
      sx={{ 
        p: 2, 
        textAlign: 'center', 
        height: '100%',
        borderTop: `4px solid ${isCompleted ? color : '#e0e0e0'}`,
        transition: 'border-color 0.3s ease',
      }}
    >
      <Typography 
        variant="caption" 
        sx={{ 
          fontWeight: 600, 
          color: isCompleted ? 'text.primary' : 'text.secondary', 
          fontSize: '0.8rem',
          mb: 1,
          display: 'block'
        }}
      >
        {title}
      </Typography>
      
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 80 }}>
          <CircularProgress size={30} />
        </Box>
      )}

      {isCompleted && !isLoading && (
        <Box sx={{ height: 80, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: color, lineHeight: 1.2 }}>
            {value}
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: color, fontSize: '0.9rem' }}>
            {status}
          </Typography>
        </Box>
      )}

      {!isCompleted && !isLoading && (
        <Box sx={{ height: 80, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Pending...
          </Typography>
        </Box>
      )}
    </AnimatedPaper>
  );
};

export default MetricDisplay; 