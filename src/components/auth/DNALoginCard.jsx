/**
 * DNALoginCard - DNA-themed login card component
 * 
 * Beautiful card with DNA styling, nucleotide accents, and genetic theme
 */

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import ScienceIcon from '@mui/icons-material/Science';

// DNA Glow Animation
const dnaGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 10px rgba(0, 255, 127, 0.3),
                0 0 20px rgba(0, 255, 127, 0.2),
                0 0 30px rgba(0, 255, 127, 0.1);
  }
  50% { 
    box-shadow: 0 0 20px rgba(0, 255, 127, 0.5),
                0 0 40px rgba(0, 255, 127, 0.3),
                0 0 60px rgba(0, 255, 127, 0.2);
  }
`;

const StyledCard = styled(Card)(({ theme }) => ({
  background: `
    linear-gradient(135deg, 
      rgba(0, 20, 40, 0.95) 0%, 
      rgba(0, 40, 80, 0.95) 100%
    )
  `,
  border: '2px solid rgba(0, 255, 127, 0.3)',
  borderRadius: '20px',
  backdropFilter: 'blur(20px)',
  position: 'relative',
  overflow: 'visible',
  maxWidth: '480px',
  width: '100%',
  animation: `${dnaGlow} 3s ease-in-out infinite`,
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    background: 'linear-gradient(45deg, rgba(0, 255, 127, 0.4), rgba(0, 191, 255, 0.4), rgba(255, 20, 147, 0.4), rgba(255, 165, 0, 0.4))',
    borderRadius: '20px',
    zIndex: -1,
    opacity: 0.6,
    animation: `${dnaGlow} 3s ease-in-out infinite`,
  },
}));

const NucleotideBadge = styled(Box)(({ nucleotide }) => {
  const colors = {
    A: { bg: 'rgba(255, 20, 147, 0.2)', border: 'rgba(255, 20, 147, 0.6)', color: '#ff1493' },
    T: { bg: 'rgba(0, 191, 255, 0.2)', border: 'rgba(0, 191, 255, 0.6)', color: '#00bfff' },
    G: { bg: 'rgba(0, 255, 127, 0.2)', border: 'rgba(0, 255, 127, 0.6)', color: '#00ff7f' },
    C: { bg: 'rgba(255, 165, 0, 0.2)', border: 'rgba(255, 165, 0, 0.6)', color: '#ffa500' },
  };
  const colorScheme = colors[nucleotide] || colors.G;
  
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: colorScheme.bg,
    border: `2px solid ${colorScheme.border}`,
    color: colorScheme.color,
    fontSize: '0.9rem',
    fontWeight: 700,
    fontFamily: 'monospace',
    textShadow: `0 0 8px ${colorScheme.color}`,
    boxShadow: `0 0 10px ${colorScheme.color}40`,
  };
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(0, 255, 127, 0.3)',
    borderRadius: '12px',
    color: '#ffffff',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: 'rgba(0, 255, 127, 0.5)',
      boxShadow: '0 0 10px rgba(0, 255, 127, 0.2)',
    },
    '&.Mui-focused': {
      borderColor: 'rgba(0, 255, 127, 0.8)',
      boxShadow: '0 0 20px rgba(0, 255, 127, 0.4)',
    },
    '& input': {
      color: '#ffffff',
      '&::placeholder': {
        color: 'rgba(255, 255, 255, 0.5)',
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: 'rgba(0, 255, 127, 0.9)',
    },
  },
}));

const DNASubmitButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(0, 255, 127, 0.8), rgba(0, 191, 255, 0.8))',
  border: '1px solid rgba(0, 255, 127, 0.5)',
  borderRadius: '12px',
  padding: '12px 32px',
  fontSize: '1rem',
  fontWeight: 600,
  color: '#ffffff',
  textTransform: 'none',
  boxShadow: '0 4px 20px rgba(0, 255, 127, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(0, 255, 127, 1), rgba(0, 191, 255, 1))',
    boxShadow: '0 6px 30px rgba(0, 255, 127, 0.5)',
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: 'rgba(0, 255, 127, 0.3)',
    color: 'rgba(255, 255, 255, 0.5)',
  },
}));

export default function DNALoginCard({
  email,
  password,
  error,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onSignupClick,
  onForgotPasswordClick,
}) {
  return (
    <StyledCard>
      <CardContent sx={{ p: 4 }}>
        {/* Header with DNA Theme */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <ScienceIcon sx={{ fontSize: 48, color: '#00ff7f', filter: 'drop-shadow(0 0 10px rgba(0, 255, 127, 0.8))' }} />
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #00ff7f, #00bfff, #ff1493)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 20px rgba(0, 255, 127, 0.5)',
                  mb: 0.5,
                }}
              >
                CrisPRO
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'monospace' }}>
                Precision Oncology Platform
              </Typography>
            </Box>
          </Box>

          {/* Nucleotide Sequence Badge */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
            {['A', 'T', 'G', 'C'].map((nuc) => (
              <NucleotideBadge key={nuc} nucleotide={nuc}>
                {nuc}
              </NucleotideBadge>
            ))}
          </Box>

          <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 600, mb: 1 }}>
            Sign In
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Access your genomic intelligence dashboard
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              background: 'rgba(211, 47, 47, 0.2)',
              border: '1px solid rgba(211, 47, 47, 0.5)',
              color: '#ff6b6b',
            }}
          >
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <StyledTextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: 'rgba(0, 255, 127, 0.7)' }} />
                </InputAdornment>
              ),
            }}
          />

          <StyledTextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: 'rgba(0, 255, 127, 0.7)' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Forgot Password Link */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link
              component="button"
              type="button"
              onClick={onForgotPasswordClick}
              sx={{
                color: 'rgba(0, 255, 127, 0.8)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'rgba(0, 255, 127, 1)',
                  textDecoration: 'underline',
                },
              }}
            >
              Forgot password?
            </Link>
          </Box>

          {/* Submit Button */}
          <DNASubmitButton
            type="submit"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : null}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </DNASubmitButton>

          {/* Sign Up Link */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Don't have an account?{' '}
              <Link
                component="button"
                type="button"
                onClick={onSignupClick}
                sx={{
                  color: 'rgba(0, 255, 127, 0.9)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    color: 'rgba(0, 255, 127, 1)',
                    textDecoration: 'underline',
                  },
                }}
              >
                Create account
              </Link>
            </Typography>
          </Box>
        </Box>

        {/* RUO Disclaimer */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(0, 255, 127, 0.2)' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', textAlign: 'center' }}>
            Research Use Only (RUO) • Not for diagnostic use
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  );
}
