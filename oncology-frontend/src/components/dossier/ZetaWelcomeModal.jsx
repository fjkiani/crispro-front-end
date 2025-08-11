import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Modal, Paper, Divider, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Close,
  Psychology,
  Science,
  Biotech,
  Security,
  Timeline,
  Assessment
} from '@mui/icons-material';

const StyledModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
}));

const ModalContainer = styled(Paper)(({ theme }) => ({
  maxWidth: '700px',
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
  background: 'linear-gradient(135deg, rgba(15, 20, 25, 0.98), rgba(26, 35, 50, 0.98))',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(96, 165, 250, 0.3)',
  borderRadius: '16px',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
  color: 'white',
  outline: 'none',
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(96, 165, 250, 0.1))',
  padding: '24px',
  borderBottom: '1px solid rgba(96, 165, 250, 0.3)',
  position: 'relative',
}));

const FeatureCard = styled(Box)(({ theme }) => ({
  padding: '16px',
  margin: '8px 0',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04))',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(96, 165, 250, 0.08))',
    borderColor: 'rgba(96, 165, 250, 0.4)',
    transform: 'translateY(-2px)',
  },
}));

const CloseButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: '16px',
  right: '16px',
  minWidth: '40px',
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.1)',
  color: 'rgba(255, 255, 255, 0.7)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
  color: 'white',
  fontWeight: 700,
  padding: '12px 32px',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '1rem',
  '&:hover': {
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    transform: 'translateY(-1px)',
  },
}));

const ZetaWelcomeModal = ({ isOpen, onClose, forceShow = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (forceShow) {
      // If explicitly opened (e.g., from sidebar), always show
      setIsVisible(true);
      return;
    }

    // Check if user has seen the Zeta welcome message before
    const hasSeenZetaWelcome = localStorage.getItem('zeta_welcome_seen');
    if (!hasSeenZetaWelcome) {
      // Show welcome modal after a brief delay to let the app load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  // Handle external control
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
    if (onClose) {
      onClose();
    }
  };

  const handleCommenceOperation = () => {
    setIsVisible(false);
    if (!forceShow) {
      localStorage.setItem('zeta_welcome_seen', 'true');
    }
    if (onClose) {
      onClose();
    }
  };

  const features = [
    {
      icon: Psychology,
      title: 'Zeta Oracle',
      description: 'Variant impact prediction with mathematical certainty',
      capability: 'Target validation & threat assessment'
    },
    {
      icon: Science,
      title: 'Zeta Forge',
      description: 'Precision weapon generation and optimization',
      capability: 'CRISPR guides & novel inhibitor design'
    },
    {
      icon: Biotech,
      title: 'Zeta Boltz',
      description: 'In silico trials and structural validation',
      capability: 'Combat effectiveness simulation'
    }
  ];

  const capabilities = [
    '⚔️ Autonomous target validation in seconds',
    '🎯 Precision therapeutic weapon generation',
    '🧬 Full in silico clinical trial simulation',
    '📋 IND-ready dossier compilation',
    '💰 $47.2M+ cost avoidance vs traditional R&D',
    '⏱️ 18 months vs 5-8 years timeline compression'
  ];

  return (
    <StyledModal open={isVisible} onClose={handleClose}>
      <ModalContainer>
        {/* Header */}
        <HeaderSection>
          <CloseButton onClick={handleClose}>
            <Close />
          </CloseButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography 
              variant="h1" 
              sx={{ fontSize: '2rem', mr: 2, filter: 'drop-shadow(0 0 10px rgba(96, 165, 250, 0.8))' }}
            >
              ⚔️
            </Typography>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
              IND (Investigational New Drug) Conquest Dossier
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Autonomous In Silico Therapeutic Conquest Platform
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
            Experience the future of drug development. This operational platform executes complete 
            in silico therapeutic conquest from target validation to IND-ready dossier in minutes, 
            not years.
          </Typography>
        </HeaderSection>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {/* Engine Overview */}
          {/* <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#60a5fa' }}>
            🔥 TACTICAL ENGINES
          </Typography> */}
          
          {/* {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <FeatureCard key={index}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <IconComponent sx={{ fontSize: 28, color: '#60a5fa', mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                      {feature.description}
                    </Typography>
                    <Chip 
                      label={feature.capability}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(96, 165, 250, 0.2)',
                        color: '#60a5fa',
                        border: '1px solid rgba(96, 165, 250, 0.3)'
                      }}
                    />
                  </Box>
                </Box>
              </FeatureCard>
            );
          })} */}

          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

          {/* Mission Capabilities */}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#34d399' }}>
            🎯 MISSION CAPABILITIES
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 1 }}>
            {capabilities.map((capability, index) => (
              <Typography 
                key={index}
                variant="body2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  py: 0.5,
                  fontSize: '0.95rem'
                }}
              >
                {capability}
              </Typography>
            ))}
          </Box>

          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

          {/* Mission Brief */}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#fbbf24' }}>
            📋 CURRENT MISSION: PIK3CA E542K
          </Typography>
          
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3, lineHeight: 1.6 }}>
            Execute full therapeutic conquest of oncogenic mutation PIK3CA E542K. Deploy Oracle for 
            target validation, Forge for weapon generation, and Boltz for combat simulation. 
            Generate complete IND-ready dossier with mathematical certainty of success.
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="checkbox"
                id="dontShowAgain"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Don't show this mission brief again
              </Typography>
            </Box>
            
            <ActionButton onClick={handleCommenceOperation}>
              🚀 COMMENCE OPERATION
            </ActionButton>
          </Box>

          {/* Disclaimer */}
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block',
              mt: 3, 
              p: 2,
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.4
            }}
          >
            <strong>OPERATIONAL NOTE:</strong> This platform demonstrates advanced AI-powered drug development 
            capabilities using synthetic data and validated models. All molecular targets and therapeutic 
            candidates are generated for demonstration purposes.
          </Typography>
        </Box>
      </ModalContainer>
    </StyledModal>
  );
};

export default ZetaWelcomeModal; 