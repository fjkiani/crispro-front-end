import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { useSpring, animated } from '@react-spring/web';

const ImpactBar = ({ value, title }) => {
  const { number } = useSpring({
    from: { number: 100 },
    to: { number: value },
    delay: 200,
    config: { mass: 1, tension: 20, friction: 14 },
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{title}</Typography>
        <animated.div style={{ fontWeight: 'bold', color: '#d32f2f', fontSize: '1.2rem' }}>
          {number.to(n => `${n.toFixed(1)}%`)}
        </animated.div>
      </Box>
      <animated.div>
        {number.to(n => (
          <LinearProgress
            variant="determinate"
            value={n}
            sx={{
              height: 12,
              borderRadius: 6,
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#d32f2f',
              },
            }}
          />
        ))}
      </animated.div>
      <Typography variant="caption" color="text.secondary">Remaining Activity</Typography>
    </Box>
  );
};

export default ImpactBar; 