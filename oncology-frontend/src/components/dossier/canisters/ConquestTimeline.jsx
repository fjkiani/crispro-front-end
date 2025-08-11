import React from 'react';
import { Box, Typography, Stepper, Step, StepLabel, StepContent, Button, Paper, Chip, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSpring, animated } from 'react-spring';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ShieldIcon from '@mui/icons-material/Shield';
import TokenIcon from '@mui/icons-material/Token';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const StyledStepper = styled(Stepper)(({ theme }) => ({
  '& .MuiStepLabel-root': {
    padding: '20px 0',
  },
  '& .MuiStepIcon-root': {
    fontSize: '2.2rem',
    '&.Mui-completed': {
      color: '#22c55e',
    },
    '&.Mui-active': {
      color: '#60a5fa',
    },
  },
  '& .MuiStepLabel-label': {
    fontSize: '1.2rem',
    fontWeight: 700,
    '&.Mui-completed': {
      color: '#22c55e',
    },
    '&.Mui-active': {
      color: '#60a5fa',
    },
  },
  '& .MuiStepContent-root': {
    borderColor: 'rgba(255,255,255,0.2)',
    marginLeft: '20px',
    paddingLeft: '24px',
  },
}));

const ConquestTimeline = ({ stages, onStageAction }) => {
  const timelineAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 200, friction: 20 },
    delay: 400,
  });

  const getStageIcon = (stageName) => {
    switch(stageName) {
      case 'VICTORY': return <RocketLaunchIcon sx={{ fontSize: '2.2rem', color: '#22c55e' }} />;
      case 'FORTIFY': return <ShieldIcon sx={{ fontSize: '2.2rem', color: '#1976d2' }} />;
      case 'ARM': return <TokenIcon sx={{ fontSize: '2.2rem', color: '#9c27b0' }} />;
      case 'FUND': return <AttachMoneyIcon sx={{ fontSize: '2.2rem', color: '#f59e0b' }} />;
      case 'CONQUER': return <EmojiEventsIcon sx={{ fontSize: '2.2rem', color: '#dc2626' }} />;
      default: return <RadioButtonUncheckedIcon />;
    }
  };

  const getStatusChip = (status, value) => {
    const chipProps = {
      complete: { 
        color: 'success', 
        label: 'COMPLETED',
        sx: { 
          bgcolor: 'rgba(34, 197, 94, 0.2)', 
          color: '#22c55e',
          border: '1px solid rgba(34, 197, 94, 0.5)'
        }
      },
      ready: { 
        color: 'primary', 
        label: 'READY TO EXECUTE',
        sx: { 
          bgcolor: 'rgba(96, 165, 250, 0.2)', 
          color: '#60a5fa',
          border: '1px solid rgba(96, 165, 250, 0.5)'
        }
      },
      pending: { 
        color: 'default', 
        label: 'PENDING',
        sx: { 
          bgcolor: 'rgba(255, 255, 255, 0.1)', 
          color: 'rgba(255, 255, 255, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }
      }
    };

    const props = chipProps[status] || chipProps.pending;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Chip 
          label={props.label}
          variant="outlined" 
          size="medium"
          sx={{ 
            fontWeight: 700,
            fontSize: '0.8rem',
            ...props.sx
          }}
        />
        {value && (
          <Typography variant="body2" sx={{ 
            color: status === 'complete' ? '#22c55e' : 
                   status === 'ready' ? '#60a5fa' : 'rgba(255,255,255,0.7)',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            {value}
          </Typography>
        )}
      </Box>
    );
  };

  const getStageName = (stage) => {
    const names = {
      'VICTORY': 'Stage 1: Victory',
      'FORTIFY': 'Stage 2: IP Protection',
      'ARM': 'Stage 3: Asset Tokenization',
      'FUND': 'Stage 4: Community Funding',
      'CONQUER': 'Stage 5: Market Domination'
    };
    return names[stage.name] || stage.name;
  };

  const getStageSubtitle = (stage) => {
    const subtitles = {
      'VICTORY': 'IND-Ready Therapeutic Dossier Generated',
      'FORTIFY': 'Provisional Patent Filed & IP Protected',
      'ARM': 'Fractional Ownership NFTs Minted',
      'FUND': 'DeSci Community Validation Funding',
      'CONQUER': 'Licensing Deals & Revenue Distribution'
    };
    return subtitles[stage.name] || '';
  };

  return (
    <animated.div style={timelineAnimation}>
      <Paper sx={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 4,
        p: 4,
        mb: 4
      }}>
        <Typography variant="h4" sx={{
          fontWeight: 900,
          color: 'white',
          mb: 2,
          textAlign: 'center',
        }}>
          🏛️ Intellectual Property Monetization Pipeline
        </Typography>
        
        <Typography variant="h6" sx={{
          color: 'rgba(255,255,255,0.8)',
          textAlign: 'center',
          mb: 4,
          fontWeight: 400,
          fontSize: '1.1rem'
        }}>
          From AI Discovery to Tradeable Pharmaceutical Assets
        </Typography>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 4 }} />

        <StyledStepper orientation="vertical" sx={{ mt: 3 }}>
          {stages.map((stage, index) => (
            <Step key={stage.name} completed={stage.status === 'complete'} active={stage.status === 'ready'}>
              <StepLabel 
                icon={getStageIcon(stage.name)}
                sx={{ 
                  '& .MuiStepLabel-labelContainer': {
                    ml: 3
                  }
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700,
                    color: stage.status === 'complete' ? '#22c55e' : 
                           stage.status === 'ready' ? '#60a5fa' : 'rgba(255,255,255,0.7)',
                    fontSize: '1.3rem',
                    mb: 0.5
                  }}>
                    {getStageName(stage)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.95rem',
                    fontStyle: 'italic'
                  }}>
                    {getStageSubtitle(stage)}
                  </Typography>
                </Box>
              </StepLabel>
              
              <StepContent>
                <Box sx={{ pb: 4 }}>
                  {getStatusChip(stage.status, stage.value || stage.target || stage.projection)}
                  
                  <Typography variant="body1" sx={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    mb: 3,
                    lineHeight: 1.7,
                    fontSize: '1rem'
                  }}>
                    {stage.description}
                  </Typography>

                  {/* Remove the action button since individual components handle actions */}
                  {stage.action && stage.status === 'ready' && (
                    <Typography variant="body2" sx={{
                      color: 'rgba(96, 165, 250, 0.8)',
                      fontStyle: 'italic',
                      mt: 2,
                      p: 2,
                      background: 'rgba(96, 165, 250, 0.1)',
                      borderRadius: 2,
                      border: '1px solid rgba(96, 165, 250, 0.3)'
                    }}>
                      💡 Scroll down to {stage.action.toLowerCase()} using the detailed interface below
                    </Typography>
                  )}

                  {stage.status === 'complete' && (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 3,
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05))',
                      borderRadius: 3,
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      mt: 2
                    }}>
                      <CheckCircleIcon sx={{ color: '#22c55e', mr: 2, fontSize: 28 }} />
                      <Box>
                        <Typography sx={{ color: '#22c55e', fontWeight: 700, fontSize: '1rem' }}>
                          Stage Completed Successfully
                        </Typography>
                        <Typography sx={{ color: 'rgba(34, 197, 94, 0.8)', fontSize: '0.9rem' }}>
                          Proceeding to next phase of IP monetization
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </StyledStepper>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 4 }} />

        {/* Professional Pipeline Summary */}
        <Box sx={{ 
          mt: 4, 
          p: 4, 
          background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.15), rgba(96, 165, 250, 0.05))',
          borderRadius: 3,
          border: '1px solid rgba(96, 165, 250, 0.3)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <TrendingUpIcon sx={{ color: '#60a5fa', mr: 2, fontSize: 28 }} />
            <Typography variant="h6" sx={{ color: '#60a5fa', fontWeight: 700 }}>
              Pipeline Value Proposition
            </Typography>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 3 }}>
            <Box sx={{ 
              p: 3, 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                Patent Valuation Range
              </Typography>
              <Typography variant="h6" sx={{ color: '#22c55e', fontWeight: 700, mb: 1 }}>
                $100M - $500M
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Based on comparable biotech IP
              </Typography>
            </Box>
            
            <Box sx={{ 
              p: 3, 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                Community Funding Target
              </Typography>
              <Typography variant="h6" sx={{ color: '#f59e0b', fontWeight: 700, mb: 1 }}>
                $5M
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                For validation studies
              </Typography>
            </Box>
            
            <Box sx={{ 
              p: 3, 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                Timeline to Market
              </Typography>
              <Typography variant="h6" sx={{ color: '#60a5fa', fontWeight: 700, mb: 1 }}>
                18-24 Months
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                vs 8-12 years traditional
              </Typography>
            </Box>
            
            <Box sx={{ 
              p: 3, 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                Projected ROI Range
              </Typography>
              <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 700, mb: 1 }}>
                10x - 50x
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                For early stakeholders
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </animated.div>
  );
};

export default ConquestTimeline; 