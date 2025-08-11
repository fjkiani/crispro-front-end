import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { useSpring, animated } from 'react-spring';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ScienceIcon from '@mui/icons-material/Science';

import OracleValidationDisplay from '../canisters/OracleValidationDisplay';
import ForgeTherapeuticsDisplay from '../canisters/ForgeTherapeuticsDisplay';
import GauntletTrialsDisplay from '../canisters/GauntletTrialsDisplay';
import TherapeuticBlueprint from '../canisters/TherapeuticBlueprint';
import MissionDecisionDisplay from '../canisters/MissionDecisionDisplay';

const AnalysisFocusView = ({ results, currentStep }) => {
  const { oracle, forge, gauntlet, dossier } = results;

  const styles = useSpring({
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
    reset: true,
    key: currentStep,
    config: { tension: 280, friction: 30 },
  });
  
  const AnimatedBox = animated(Box);

  const getPhaseInfo = () => {
    if (currentStep < 2) {
      return {
        phase: 'ORACLE',
        title: 'Target Validation Intelligence',
        color: '#e53e3e',
        icon: AnalyticsIcon,
        description: 'AI-powered analysis of target viability and therapeutic potential'
      };
    }
    if (currentStep === 2) {
      return {
        phase: 'ORACLE',
        title: 'Mission Authorization Decision',
        color: '#e53e3e',
        icon: AnalyticsIcon,
        description: 'Critical GO/NO-GO determination based on validation results'
      };
    }
    if (currentStep >= 3 && currentStep < 5) {
      return {
        phase: 'FORGE',
        title: 'Therapeutic Weapon Design',
        color: '#3182ce',
        icon: ScienceIcon,
        description: 'Advanced AI generation of precision therapeutic candidates'
      };
    }
    if (currentStep >= 5 && currentStep < 7) {
      return {
        phase: 'GAUNTLET',
        title: 'In Silico Battle Testing',
        color: '#38a169',
        icon: ScienceIcon,
        description: 'Computational validation of therapeutic efficacy and safety'
      };
    }
    if (currentStep >= 7) {
      return {
        phase: 'DOSSIER',
        title: 'Mission Complete',
        color: '#805ad5',
        icon: AnalyticsIcon,
        description: 'Comprehensive therapeutic blueprint ready for development'
      };
    }
    return {
      phase: 'STANDBY',
      title: 'Mission Briefing',
      color: '#718096',
      icon: AnalyticsIcon,
      description: 'Awaiting mission authorization'
    };
  };

  const phaseInfo = getPhaseInfo();
  const PhaseIcon = phaseInfo.icon;

  const renderCurrentAnalysis = () => {
    if (currentStep < 2) {
      return <OracleValidationDisplay oracleData={oracle} currentEndpointIndex={currentStep} />;
    }
    if (currentStep === 2) {
      // Show Mission Decision after druggability assessment
      return <MissionDecisionDisplay oracleData={oracle} />;
    }
    if (currentStep >= 3 && currentStep < 5) {
      const forgeStepIndex = currentStep === 3 ? 0 : 2;
      return <ForgeTherapeuticsDisplay forgeData={forge} currentEndpointIndex={forgeStepIndex} />;
    }
    if (currentStep === 5) {
      return <GauntletTrialsDisplay gauntletData={gauntlet} currentEndpointIndex={0} />;
    }
    if (currentStep === 6) {
      return <TherapeuticBlueprint blueprintData={dossier} />;
    }
    return (
      <Box sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4
      }}>
        <PhaseIcon sx={{ 
          fontSize: 80, 
          color: 'rgba(255,255,255,0.3)', 
          mb: 3
        }} />
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: 'white',
          mb: 2
        }}>
          Mission Control Ready
        </Typography>
        <Typography variant="body1" sx={{ 
          color: 'rgba(255,255,255,0.7)',
          fontSize: '1.1rem',
          maxWidth: 400,
          lineHeight: 1.6
        }}>
          Advanced AI systems are standing by for target analysis. 
          Launch your first operation to begin the biotech conquest.
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Phase Header */}
      {(oracle || forge || gauntlet || dossier) && (
        <Box sx={{ 
          p: 3,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Chip 
              label={phaseInfo.phase}
              sx={{ 
                background: `linear-gradient(135deg, ${phaseInfo.color}, ${phaseInfo.color}cc)`,
                color: 'white',
                fontWeight: 700,
                fontSize: '0.8rem',
                mr: 2
              }}
            />
            <PhaseIcon sx={{ color: phaseInfo.color, fontSize: 24, mr: 1 }} />
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              color: 'white',
              fontSize: '1.2rem'
            }}>
              {phaseInfo.title}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.95rem'
          }}>
            {phaseInfo.description}
          </Typography>
        </Box>
      )}

      {/* Analysis Content */}
      <AnimatedBox 
        style={styles}
        sx={{ 
          flexGrow: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '3px',
            '&:hover': {
              background: 'rgba(255,255,255,0.5)',
            },
          },
        }}
      >
        {renderCurrentAnalysis()}
      </AnimatedBox>
    </Box>
  );
};

export default AnalysisFocusView; 