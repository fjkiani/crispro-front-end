/**
 * DNAHelixBackground - Animated DNA helix background component
 * 
 * Reusable component for DNA-themed backgrounds with animated helix visualization
 */

import React from 'react';
import { Box, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';

// DNA Helix Animation
const helixRotate = keyframes`
  0% { transform: rotateY(0deg) rotateZ(0deg); }
  100% { transform: rotateY(360deg) rotateZ(360deg); }
`;

const helixFloat = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const dnaPulse = keyframes`
  0%, 100% { 
    opacity: 0.3;
    transform: scale(1);
  }
  50% { 
    opacity: 0.6;
    transform: scale(1.1);
  }
`;

const StyledBackground = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 0,
  overflow: 'hidden',
  background: `
    linear-gradient(135deg, 
      rgba(0, 20, 40, 0.98) 0%, 
      rgba(0, 30, 60, 0.98) 30%,
      rgba(10, 40, 70, 0.98) 70%,
      rgba(0, 20, 50, 0.98) 100%
    ),
    radial-gradient(circle at 20% 30%, rgba(0, 255, 127, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(0, 191, 255, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(255, 20, 147, 0.1) 0%, transparent 60%)
  `,
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      repeating-linear-gradient(
        90deg,
        transparent 0px,
        rgba(0, 255, 127, 0.03) 1px,
        transparent 2px,
        transparent 40px
      ),
      repeating-linear-gradient(
        0deg,
        transparent 0px,
        rgba(0, 191, 255, 0.02) 1px,
        transparent 2px,
        transparent 60px
      )
    `,
    pointerEvents: 'none',
  },
}));

const HelixContainer = styled(Box)({
  position: 'absolute',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  pointerEvents: 'none',
});

const Helix = styled(Box)({
  position: 'relative',
  width: '200px',
  height: '400px',
  animation: `${helixRotate} 20s linear infinite`,
  '&:before': {
    content: '""',
    position: 'absolute',
    width: '4px',
    height: '100%',
    background: 'linear-gradient(180deg, rgba(0, 255, 127, 0.6), rgba(0, 191, 255, 0.6), rgba(255, 20, 147, 0.6), rgba(255, 165, 0, 0.6))',
    left: '50%',
    transform: 'translateX(-50%)',
    borderRadius: '2px',
    boxShadow: '0 0 20px rgba(0, 255, 127, 0.5)',
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    width: '4px',
    height: '100%',
    background: 'linear-gradient(180deg, rgba(255, 165, 0, 0.6), rgba(255, 20, 147, 0.6), rgba(0, 191, 255, 0.6), rgba(0, 255, 127, 0.6))',
    left: '50%',
    transform: 'translateX(-50%) rotateY(180deg)',
    borderRadius: '2px',
    boxShadow: '0 0 20px rgba(0, 191, 255, 0.5)',
  },
});

const NucleotideDot = styled(Box)(({ color, delay, position }) => ({
  position: 'absolute',
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  background: color,
  left: position === 'left' ? '20%' : '80%',
  top: `${delay * 10}%`,
  boxShadow: `0 0 15px ${color}`,
  animation: `${dnaPulse} ${2 + delay * 0.5}s ease-in-out infinite`,
  animationDelay: `${delay * 0.3}s`,
}));

const FloatingHelix = styled(Box)({
  position: 'absolute',
  width: '150px',
  height: '300px',
  animation: `${helixFloat} 8s ease-in-out infinite`,
  '&:nth-of-type(1)': {
    top: '10%',
    left: '10%',
    animationDelay: '0s',
  },
  '&:nth-of-type(2)': {
    top: '60%',
    right: '15%',
    animationDelay: '2s',
  },
  '&:nth-of-type(3)': {
    bottom: '20%',
    left: '20%',
    animationDelay: '4s',
  },
});

export default function DNAHelixBackground() {
  // Generate nucleotide dots for visual interest
  const nucleotides = [
    { color: 'rgba(0, 255, 127, 0.8)', position: 'left' }, // G - Green
    { color: 'rgba(0, 191, 255, 0.8)', position: 'right' }, // T - Blue
    { color: 'rgba(255, 20, 147, 0.8)', position: 'left' }, // A - Pink
    { color: 'rgba(255, 165, 0, 0.8)', position: 'right' }, // C - Orange
  ];

  return (
    <StyledBackground>
      {/* Main centered helix */}
      <HelixContainer>
        <Helix>
          {nucleotides.map((nuc, idx) => (
            <React.Fragment key={idx}>
              <NucleotideDot
                color={nuc.color}
                delay={idx}
                position={nuc.position}
              />
              <NucleotideDot
                color={nucleotides[(idx + 2) % 4].color}
                delay={idx + 0.5}
                position={nuc.position === 'left' ? 'right' : 'left'}
              />
            </React.Fragment>
          ))}
        </Helix>
      </HelixContainer>

      {/* Floating background helixes */}
      {[0, 1, 2].map((idx) => (
        <FloatingHelix key={idx}>
          <Helix style={{ opacity: 0.2, transform: `scale(${0.5 + idx * 0.2})` }}>
            {nucleotides.map((nuc, nIdx) => (
              <NucleotideDot
                key={nIdx}
                color={nuc.color}
                delay={nIdx + idx}
                position={nuc.position}
              />
            ))}
          </Helix>
        </FloatingHelix>
      ))}
    </StyledBackground>
  );
}
