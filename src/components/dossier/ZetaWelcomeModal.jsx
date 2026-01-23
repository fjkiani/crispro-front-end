import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Modal, 
  Paper, 
  Divider, 
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Close,
  Psychology,
  Science,
  Biotech,
  CheckCircle
} from '@mui/icons-material';

const StyledModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
}));

const ModalContainer = styled(Paper)(({ theme }) => ({
  maxWidth: '900px',
  width: '100%',
  maxHeight: '95vh',
  overflow: 'auto',
  background: 'linear-gradient(135deg, rgba(10, 15, 25, 0.98), rgba(20, 30, 45, 0.98))',
  backdropFilter: 'blur(20px)',
  border: '3px solid rgba(96, 165, 250, 0.6)',
  borderRadius: '20px',
  boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9)',
  color: 'white',
  outline: 'none',
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.25), rgba(96, 165, 250, 0.15))',
  padding: '50px 40px',
  borderBottom: '3px solid rgba(96, 165, 250, 0.4)',
  position: 'relative',
}));

const CloseButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: '20px',
  right: '20px',
  minWidth: '44px',
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.15)',
  color: 'rgba(255, 255, 255, 0.8)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.25)',
    color: 'white',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
  color: 'white',
  fontWeight: 900,
  padding: '20px 60px',
  borderRadius: '16px',
  textTransform: 'none',
  fontSize: '1.4rem',
  boxShadow: '0 8px 32px rgba(96, 165, 250, 0.4)',
  '&:hover': {
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 40px rgba(96, 165, 250, 0.6)',
  },
}));

const ApiCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  margin: '16px 0',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.25), rgba(96, 165, 250, 0.15))',
    borderColor: 'rgba(96, 165, 250, 0.6)',
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 32px rgba(96, 165, 250, 0.4)',
  },
}));

const ZetaWelcomeModal = ({ isOpen, onClose, forceShow = false, onCommence }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [selectedApis, setSelectedApis] = useState({
    oracle: true,
    forge: true,
    gauntlet: true
  });

  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      return;
    }
    const hasSeenZetaWelcome = localStorage.getItem('zeta_welcome_seen');
    if (!hasSeenZetaWelcome) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  useEffect(() => {
    if (isOpen !== undefined) {
      setIsVisible(isOpen);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    if (dontShowAgain && !forceShow) {
      localStorage.setItem('zeta_welcome_seen', 'true');
    }
    if (onClose) onClose();
  };

  const handleCommenceOperation = () => {
    setIsVisible(false);
    if (!forceShow) {
      localStorage.setItem('zeta_welcome_seen', 'true');
    }
    if (onCommence) onCommence(selectedApis);
    if (onClose) onClose();
  };

  const apiOptions = [
    {
      id: 'oracle',
      icon: Psychology,
      title: 'Target Validation',
      description: 'Prove this mutation is worth targeting. Check if it damages the protein, if cancer depends on it, and if drugs can reach it.',
      endpoints: ['Functional damage analysis', 'Cancer dependency check', 'Drug accessibility']
    },
    {
      id: 'forge',
      icon: Science,
      title: 'Therapeutic Design',
      description: 'Design CRISPR tools and small molecules specifically for this mutation. Generate ready-to-test candidates.',
      endpoints: ['CRISPR guide generation', 'Novel inhibitor design']
    },
    {
      id: 'gauntlet',
      icon: Biotech,
      title: 'Validation Testing',
      description: 'Test our designs computationally. Predict if they will fold correctly and bind as intended.',
      endpoints: ['Structure prediction', 'Binding validation']
    }
  ];

  return (
    <StyledModal open={isVisible} onClose={handleClose}>
      <ModalContainer>
        {/* Header */}
        <HeaderSection>
          <CloseButton onClick={handleClose}>
            <Close />
          </CloseButton>
          
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: '4rem', 
                mb: 4, 
                filter: 'drop-shadow(0 0 25px rgba(96, 165, 250, 1))',
                fontWeight: 900
              }}
            >
              🧬
            </Typography>
            <Typography variant="h1" sx={{ 
              fontWeight: 900, 
              mb: 3, 
              fontSize: '3rem',
              color: 'white',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}>
              Validate Your Cancer Target
            </Typography>
            <Typography variant="h4" sx={{ 
              color: 'white', 
              fontWeight: 500,
              fontSize: '1.8rem',
              lineHeight: 1.4,
              textShadow: '0 1px 5px rgba(0,0,0,0.3)'
            }}>
              Get mathematical proof before you spend millions
            </Typography>
          </Box>

          <Box sx={{ 
            background: 'rgba(0, 0, 0, 0.3)', 
            p: 5, 
            borderRadius: '20px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 800, 
              mb: 4, 
              color: '#fbbf24',
              fontSize: '1.8rem',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}>
              Your Research Problem
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'white', 
              lineHeight: 1.8,
              fontSize: '1.3rem',
              mb: 4,
              fontWeight: 400,
              textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}>
              You have a promising cancer mutation. But before committing years and millions 
              to development, you need proof: Is it actually harmful? Does cancer depend on it? 
              Can you drug it effectively?
            </Typography>
            <Typography variant="h4" sx={{ 
              fontWeight: 800, 
              mb: 3, 
              color: '#34d399',
              fontSize: '1.8rem',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}>
              Get Answers in Minutes
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'white', 
              lineHeight: 1.8,
              fontSize: '1.3rem',
              fontWeight: 400,
              textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}>
              Validate your target, design therapeutics, and test them computationally 
              before any wet lab work. Get the confidence you need to move forward.
            </Typography>
          </Box>
        </HeaderSection>

        {/* Content */}
        <Box sx={{ p: 5 }}>
          {/* API Selection */}
          <Typography variant="h3" sx={{ 
            fontWeight: 900, 
            mb: 5, 
            color: 'white',
            fontSize: '2.2rem',
            textAlign: 'center',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}>
            Choose Your Analysis
          </Typography>

          <Box sx={{ display: 'grid', gap: 4, mb: 6 }}>
            {apiOptions.map((api) => {
              const IconComponent = api.icon;
              return (
                <ApiCard key={api.id}>
                  <CardContent sx={{ p: 5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedApis[api.id]}
                            onChange={(e) => setSelectedApis(prev => ({
                              ...prev,
                              [api.id]: e.target.checked
                            }))}
                            sx={{
                              color: 'rgba(255,255,255,0.7)',
                              '&.Mui-checked': { color: '#60a5fa' },
                              transform: 'scale(1.4)'
                            }}
                          />
                        }
                        label=""
                        sx={{ m: 0 }}
                      />
                      <IconComponent sx={{ fontSize: 48, color: '#60a5fa', mt: 1 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" sx={{ 
                          fontWeight: 900, 
                          mb: 3,
                          fontSize: '1.8rem',
                          color: 'white',
                          textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                        }}>
                          {api.title}
                        </Typography>
                        <Typography variant="h6" sx={{ 
                          color: 'white', 
                          mb: 4,
                          lineHeight: 1.8,
                          fontSize: '1.2rem',
                          fontWeight: 400,
                          textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }}>
                          {api.description}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {api.endpoints.map((endpoint, idx) => (
                            <Chip 
                              key={idx}
                              label={endpoint}
                              sx={{ 
                                backgroundColor: 'rgba(96, 165, 250, 0.3)',
                                color: 'white',
                                border: '2px solid rgba(96, 165, 250, 0.5)',
                                fontSize: '1rem',
                                fontWeight: 700,
                                height: '36px',
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </ApiCard>
              );
            })}
          </Box>

          {/* Actions */}
          <Box sx={{ 
            display: 'flex', 
            gap: 5, 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pt: 4,
            borderTop: '3px solid rgba(255,255,255,0.2)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Checkbox
                id="dontShowAgain"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-checked': { color: '#60a5fa' },
                  transform: 'scale(1.2)'
                }}
              />
              <Typography variant="h6" sx={{ 
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 500,
                textShadow: '0 1px 3px rgba(0,0,0,0.3)'
              }}>
                Don't show this again
              </Typography>
            </Box>
            
            <ActionButton onClick={handleCommenceOperation}>
              <CheckCircle sx={{ mr: 2, fontSize: 28 }} />
              Run Analysis
            </ActionButton>
          </Box>

          {/* Disclaimer */}
          <Typography 
            variant="h6" 
            sx={{ 
              display: 'block',
              mt: 5, 
              p: 4,
              background: 'rgba(255, 193, 7, 0.15)',
              border: '2px solid rgba(255, 193, 7, 0.4)',
              borderRadius: '16px',
              color: 'white',
              lineHeight: 1.7,
              fontSize: '1.1rem',
              textAlign: 'center',
              fontWeight: 500,
              textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}
          >
            Demo uses synthetic data to show computational methods
          </Typography>
        </Box>
      </ModalContainer>
    </StyledModal>
  );
};

export default ZetaWelcomeModal; 