import React from 'react';
import { Box, Typography } from '@mui/material';
import { useSpring, animated } from 'react-spring';

const AnimatedTypography = animated(Typography);

const ScoreGauge = ({ value, title, color = '#1976d2' }) => {
  const { number } = useSpring({
    from: { number: 0 },
    to: { number: value },
    delay: 300,
    config: { mass: 1, tension: 20, friction: 14 },
  });

  const styles = useSpring({
    from: { opacity: 0, transform: 'scale(0.8)' },
    to: { opacity: 1, transform: 'scale(1)' },
    delay: 100,
  });

  // Normalize value for the gauge display (0-100 range)
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  return (
    <animated.div style={styles}>
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="60" fill="none" stroke={color} strokeWidth="10" strokeOpacity="0.1" />
          <animated.circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={2 * Math.PI * 60}
            strokeDashoffset={number.to(n => (1 - (Math.min(Math.max(n, 0), 100) / 100)) * 2 * Math.PI * 60)}
            transform="rotate(-90 70 70)"
            strokeLinecap="round"
          />
        </svg>
        <Box sx={{ position: 'absolute', textAlign: 'center' }}>
          <AnimatedTypography variant="h4" sx={{ fontWeight: 'bold', color }}>
            {number.to(n => n.toFixed(0) + '%')}
          </AnimatedTypography>
          <Typography variant="caption" sx={{ fontWeight: 600, color, textTransform: 'uppercase' }}>
            {title}
          </Typography>
        </Box>
      </Box>
    </animated.div>
  );
};

export default ScoreGauge; 