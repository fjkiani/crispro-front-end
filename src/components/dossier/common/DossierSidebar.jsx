import React, { useState } from 'react';
import { 
  Box, Typography, Card, CardContent, List, ListItem, ListItemIcon, 
  ListItemText, Chip, LinearProgress, Divider, IconButton, Collapse,
  Avatar, Button, Tooltip
} from '@mui/material';
import { useSpring, animated } from 'react-spring';
import { styled, keyframes } from '@mui/material/styles';

// Icons
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ScienceIcon from '@mui/icons-material/Science';
import SecurityIcon from '@mui/icons-material/Security';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ShieldIcon from '@mui/icons-material/Shield';
import TokenIcon from '@mui/icons-material/Token';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// DNA Animation
const helixRotation = keyframes`
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
`;

const nucleotideFloat = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(180deg); }
`;

const dnaGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 5px rgba(0, 255, 127, 0.3),
                0 0 10px rgba(0, 255, 127, 0.2),
                0 0 15px rgba(0, 255, 127, 0.1);
  }
  50% { 
    box-shadow: 0 0 10px rgba(0, 255, 127, 0.5),
                0 0 20px rgba(0, 255, 127, 0.3),
                0 0 30px rgba(0, 255, 127, 0.2);
  }
`;

const StyledSidebar = styled(Box)(({ theme }) => ({
  width: '360px',
  height: '100vh',
  background: `
    linear-gradient(180deg, 
      rgba(0, 20, 40, 0.95) 0%, 
      rgba(0, 30, 60, 0.95) 30%,
      rgba(10, 40, 70, 0.95) 70%,
      rgba(0, 20, 50, 0.95) 100%
    ),
    radial-gradient(circle at 20% 30%, rgba(0, 255, 127, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(0, 191, 255, 0.1) 0%, transparent 50%)
  `,
  backdropFilter: 'blur(20px)',
  borderRight: '2px solid rgba(0, 255, 127, 0.2)',
  overflow: 'auto',
  position: 'fixed',
  left: 0,
  top: 0,
  zIndex: 1200,
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
        rgba(0, 255, 127, 0.05) 1px,
        transparent 2px,
        transparent 20px
      ),
      repeating-linear-gradient(
        0deg,
        transparent 0px,
        rgba(0, 191, 255, 0.03) 1px,
        transparent 2px,
        transparent 40px
      )
    `,
    pointerEvents: 'none',
  },
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 255, 127, 0.1)',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(180deg, rgba(0, 255, 127, 0.6), rgba(0, 191, 255, 0.6))',
    borderRadius: '4px',
    '&:hover': {
      background: 'linear-gradient(180deg, rgba(0, 255, 127, 0.8), rgba(0, 191, 255, 0.8))',
    }
  },
}));

const DNAProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 12,
  borderRadius: 6,
  background: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(0, 255, 127, 0.3)',
  overflow: 'visible',
  '& .MuiLinearProgress-bar': {
    background: `
      linear-gradient(90deg, 
        rgba(0, 255, 127, 0.8) 0%,
        rgba(0, 191, 255, 0.8) 25%,
        rgba(255, 20, 147, 0.8) 50%,
        rgba(255, 165, 0, 0.8) 75%,
        rgba(0, 255, 127, 0.8) 100%
      )
    `,
    borderRadius: 6,
    animation: `${dnaGlow} 2s ease-in-out infinite`,
    '&:after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '8px',
      height: '8px',
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '50%',
      boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
    }
  }
}));

const NucleotideChip = styled(Chip)(({ nucleotide }) => {
  const colors = {
    A: { bg: 'rgba(255, 20, 147, 0.2)', border: 'rgba(255, 20, 147, 0.6)', color: '#ff1493' }, // Adenine - Pink
    T: { bg: 'rgba(0, 191, 255, 0.2)', border: 'rgba(0, 191, 255, 0.6)', color: '#00bfff' },   // Thymine - Blue  
    G: { bg: 'rgba(0, 255, 127, 0.2)', border: 'rgba(0, 255, 127, 0.6)', color: '#00ff7f' },   // Guanine - Green
    C: { bg: 'rgba(255, 165, 0, 0.2)', border: 'rgba(255, 165, 0, 0.6)', color: '#ffa500' }    // Cytosine - Orange
  };
  
  const colorScheme = colors[nucleotide] || colors.A;
  
  return {
    background: colorScheme.bg,
    border: `1px solid ${colorScheme.border}`,
    color: colorScheme.color,
    fontSize: '0.7rem',
    height: 20,
    fontWeight: 700,
    fontFamily: 'monospace',
    animation: `${nucleotideFloat} 3s ease-in-out infinite`,
    '& .MuiChip-label': { 
      px: 1,
      textShadow: `0 0 5px ${colorScheme.color}40`
    }
  };
});

const DNAMetricCard = styled(Card)(({ theme }) => ({
  background: `
    linear-gradient(135deg, 
      rgba(0, 20, 40, 0.8) 0%, 
      rgba(0, 40, 80, 0.6) 100%
    )
  `,
  border: '1px solid rgba(0, 255, 127, 0.2)',
  borderRadius: '12px',
  margin: '8px 0',
  backdropFilter: 'blur(15px)',
  position: 'relative',
  overflow: 'visible',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '-1px',
    left: '-1px',
    right: '-1px',
    bottom: '-1px',
    background: 'linear-gradient(45deg, rgba(0, 255, 127, 0.3), rgba(0, 191, 255, 0.3), rgba(255, 20, 147, 0.3), rgba(255, 165, 0, 0.3))',
    borderRadius: '12px',
    zIndex: -1,
    opacity: 0.5,
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 32px rgba(0, 255, 127, 0.3)',
    '&:before': {
      opacity: 0.8,
    }
  }
}));

const DNASequenceDisplay = styled(Box)(({ theme }) => ({
  fontFamily: 'Monaco, "Courier New", monospace',
  fontSize: '11px',
  lineHeight: 1.2,
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(0, 255, 127, 0.3)',
  borderRadius: '8px',
  padding: '8px',
  margin: '8px 0',
  color: '#ffffff',
  letterSpacing: '1px',
  '& .nucleotide': {
    display: 'inline-block',
    padding: '1px 2px',
    margin: '0 1px',
    borderRadius: '2px',
    fontWeight: 'bold',
    textShadow: '0 0 3px currentColor',
  },
  '& .A': { color: '#ff1493', background: 'rgba(255, 20, 147, 0.2)' },
  '& .T': { color: '#00bfff', background: 'rgba(0, 191, 255, 0.2)' },
  '& .G': { color: '#00ff7f', background: 'rgba(0, 255, 127, 0.2)' },
  '& .C': { color: '#ffa500', background: 'rgba(255, 165, 0, 0.2)' },
}));

const DossierSidebar = ({ results, currentStep, onStepChange, conquestStages }) => {
  const [expandedSection, setExpandedSection] = useState('progress');
  
  const sidebarAnimation = useSpring({
    from: { opacity: 0, transform: 'translateX(-100%)' },
    to: { opacity: 1, transform: 'translateX(0%)' },
    config: { tension: 280, friction: 30 },
    delay: 200,
  });

  const getPhaseInfo = (step) => {
    if (step < 2) return { phase: 'oracle', name: 'Oracle', icon: AnalyticsIcon, color: '#ff1493', nucleotide: 'A' };
    if (step >= 2 && step < 5) return { phase: 'forge', name: 'Forge', icon: ScienceIcon, color: '#00bfff', nucleotide: 'T' };
    if (step === 5) return { phase: 'gauntlet', name: 'Gauntlet', icon: SecurityIcon, color: '#00ff7f', nucleotide: 'G' };
    return { phase: 'dossier', name: 'Dossier', icon: AssignmentIcon, color: '#ffa500', nucleotide: 'C' };
  };

  const getStepStatus = (step) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'active';
    return 'pending';
  };

  const getConquestIcon = (stageName) => {
    switch(stageName) {
      case 'VICTORY': return RocketLaunchIcon;
      case 'FORTIFY': return ShieldIcon;
      case 'ARM': return TokenIcon;
      case 'FUND': return AttachMoneyIcon;
      case 'CONQUER': return EmojiEventsIcon;
      default: return RadioButtonUncheckedIcon;
    }
  };

  const renderDNASequence = (sequence, title) => (
    <DNASequenceDisplay>
      <Typography variant="caption" sx={{ color: '#00ff7f', fontWeight: 'bold', display: 'block', mb: 1 }}>
        {title}
      </Typography>
      <Box>
        {sequence.split('').map((nucleotide, index) => (
          <span key={index} className={`nucleotide ${nucleotide}`}>
            {nucleotide}
          </span>
        ))}
      </Box>
    </DNASequenceDisplay>
  );

  const campaignSteps = [
    { label: 'Functional Impact', phase: 'oracle' },
    { label: 'Dependency Analysis', phase: 'oracle' },
    { label: 'Druggability Assessment', phase: 'oracle' },
    { label: 'CRISPR Design', phase: 'forge' },
    { label: 'Inhibitor Design', phase: 'forge' },
    { label: 'In Silico Trial', phase: 'gauntlet' },
    { label: 'IND Dossier', phase: 'dossier' }
  ];

  const keyMetrics = [
    { label: 'Target Damage', value: '18,750%', status: 'critical', icon: '🎯', nucleotide: 'A' },
    { label: 'Cancer Dependency', value: '92%', status: 'high', icon: '⚡', nucleotide: 'T' },
    { label: 'Druggability', value: '88%', status: 'excellent', icon: '🔬', nucleotide: 'G' },
    { label: 'Cost Avoidance', value: '$47.2M', status: 'savings', icon: '💰', nucleotide: 'C' }
  ];

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <animated.div style={sidebarAnimation}>
      <StyledSidebar>
        {/* DNA Header */}
        <Box sx={{ p: 3, borderBottom: '2px solid rgba(0, 255, 127, 0.2)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ 
              background: 'linear-gradient(45deg, #00ff7f, #00bfff, #ff1493)',
              width: 48,
              height: 48,
              mr: 2,
              border: '2px solid rgba(0, 255, 127, 0.4)',
              animation: `${helixRotation} 4s linear infinite`
            }}>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>🧬</Typography>
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ 
                color: 'white', 
                fontWeight: 700, 
                fontSize: '1.2rem',
                textShadow: '0 0 10px rgba(0, 255, 127, 0.5)'
              }}>
                Genomic Analysis
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'rgba(0, 255, 127, 0.8)',
                fontFamily: 'monospace',
                fontSize: '0.9rem'
              }}>
                PIK3CA:E542K → ∆G:-18.2kJ/mol
              </Typography>
            </Box>
          </Box>
          
          {/* DNA Progress Overview */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              mb: 1,
              fontSize: '0.9rem',
              fontWeight: 600
            }}>
              Sequence Analysis Progress
            </Typography>
            <DNAProgressBar 
              variant="determinate" 
              value={Math.max(0, currentStep + 1) / campaignSteps.length * 100}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" sx={{ 
                color: 'rgba(0, 255, 127, 0.8)', 
                fontFamily: 'monospace',
                fontSize: '0.8rem'
              }}>
                Step {Math.max(0, currentStep + 1)}/{campaignSteps.length}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'rgba(0, 191, 255, 0.8)', 
                fontFamily: 'monospace',
                fontSize: '0.8rem'
              }}>
                {Math.round(Math.max(0, currentStep + 1) / campaignSteps.length * 100)}% Complete
              </Typography>
            </Box>
          </Box>

          {/* Show sequences when in forge phase */}
          {currentStep >= 3 && currentStep <= 4 && (
            <Box sx={{ mt: 3 }}>
              {currentStep >= 3 && renderDNASequence(
                "ACGACTAGCTAGCATGACGATGCATGCATGCATGCATGCAGATTACAGATTACAGATTAC", 
                "🎯 CRISPR Guide RNA (94.5% efficacy)"
              )}
              {currentStep >= 4 && (
                <Box sx={{ mt: 2, p: 2, background: 'rgba(0, 0, 0, 0.4)', borderRadius: 2, border: '1px solid rgba(255, 20, 147, 0.3)' }}>
                  <Typography variant="caption" sx={{ color: '#ff1493', fontWeight: 'bold', display: 'block', mb: 1 }}>
                    🧪 Novel Small Molecule
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'white', 
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    lineHeight: 1.4
                  }}>
                    <strong>Binding Affinity:</strong> -12.3 kcal/mol<br/>
                    <strong>Selectivity:</strong> 847x vs off-targets<br/>
                    <strong>Drug-likeness:</strong> 95% Lipinski compliance
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Campaign Steps */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ 
              color: 'white', 
              fontWeight: 600, 
              fontSize: '1rem',
              textShadow: '0 0 5px rgba(0, 255, 127, 0.5)'
            }}>
              📊 Analysis Pipeline
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => toggleSection('progress')}
              sx={{ color: 'rgba(0, 255, 127, 0.8)' }}
            >
              {expandedSection === 'progress' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Collapse in={expandedSection === 'progress'}>
            <List dense sx={{ py: 0 }}>
              {campaignSteps.map((step, index) => {
                const phaseInfo = getPhaseInfo(index);
                const status = getStepStatus(index);
                const Icon = phaseInfo.icon;
                
                return (
                  <ListItem 
                    key={index}
                    button
                    onClick={() => onStepChange?.(index)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      background: status === 'active' ? `rgba(${phaseInfo.color === '#ff1493' ? '255, 20, 147' : phaseInfo.color === '#00bfff' ? '0, 191, 255' : phaseInfo.color === '#00ff7f' ? '0, 255, 127' : '255, 165, 0'}, 0.15)` : 'transparent',
                      border: status === 'active' ? `1px solid ${phaseInfo.color}40` : 'none',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.05)',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {status === 'completed' ? (
                        <CheckCircleIcon sx={{ color: '#00ff7f', fontSize: 20 }} />
                      ) : status === 'active' ? (
                        <PlayCircleFilledIcon sx={{ color: phaseInfo.color, fontSize: 20 }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={step.label}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.85rem',
                          fontWeight: status === 'active' ? 600 : 400,
                          color: status === 'completed' ? '#00ff7f' :
                                 status === 'active' ? phaseInfo.color : 'rgba(255,255,255,0.7)'
                        }
                      }}
                    />
                    <NucleotideChip 
                      nucleotide={phaseInfo.nucleotide}
                      label={phaseInfo.nucleotide}
                      size="small"
                    />
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        </Box>

        <Divider sx={{ borderColor: 'rgba(0, 255, 127, 0.2)', mx: 2 }} />

        {/* Key Metrics */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ 
              color: 'white', 
              fontWeight: 600, 
              fontSize: '1rem',
              textShadow: '0 0 5px rgba(0, 191, 255, 0.5)'
            }}>
              🔬 Genomic Metrics
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => toggleSection('metrics')}
              sx={{ color: 'rgba(0, 191, 255, 0.8)' }}
            >
              {expandedSection === 'metrics' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Collapse in={expandedSection === 'metrics'}>
            {keyMetrics.map((metric, index) => (
              <DNAMetricCard key={index}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '1.2rem', mr: 1 }}>
                        {metric.icon}
                      </Typography>
                      <Box>
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255,255,255,0.8)', 
                          fontSize: '0.8rem',
                          fontWeight: 500
                        }}>
                          {metric.label}
                        </Typography>
                        <Typography variant="h6" sx={{ 
                          color: metric.status === 'critical' ? '#ff1493' :
                                 metric.status === 'high' ? '#ffa500' :
                                 metric.status === 'excellent' ? '#00ff7f' : '#00bfff',
                          fontWeight: 700,
                          fontSize: '1rem',
                          fontFamily: 'monospace',
                          textShadow: '0 0 5px currentColor'
                        }}>
                          {metric.value}
                        </Typography>
                      </Box>
                    </Box>
                    <NucleotideChip 
                      nucleotide={metric.nucleotide}
                      label={metric.nucleotide}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </DNAMetricCard>
            ))}
          </Collapse>
        </Box>

        <Divider sx={{ borderColor: 'rgba(0, 255, 127, 0.2)', mx: 2 }} />

        {/* Victory → Conquer Pipeline */}
        {conquestStages && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ 
                color: 'white', 
                fontWeight: 600, 
                fontSize: '1rem',
                textShadow: '0 0 5px rgba(255, 20, 147, 0.5)'
              }}>
                🏛️ IP Pipeline
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => toggleSection('conquest')}
                sx={{ color: 'rgba(255, 20, 147, 0.8)' }}
              >
                {expandedSection === 'conquest' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={expandedSection === 'conquest'}>
              <List dense sx={{ py: 0 }}>
                {conquestStages.map((stage, index) => {
                  const Icon = getConquestIcon(stage.name);
                  
                  return (
                    <ListItem key={index} sx={{ px: 1, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Icon sx={{ 
                          fontSize: 18,
                          color: stage.status === 'complete' ? '#00ff7f' :
                                 stage.status === 'ready' ? '#00bfff' : 'rgba(255,255,255,0.3)'
                        }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={stage.name}
                        secondary={stage.value || stage.target || stage.projection}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: stage.status === 'complete' ? '#00ff7f' :
                                   stage.status === 'ready' ? '#00bfff' : 'rgba(255,255,255,0.7)'
                          },
                          '& .MuiListItemText-secondary': {
                            fontSize: '0.7rem',
                            color: 'rgba(255,255,255,0.5)',
                            fontFamily: 'monospace'
                          }
                        }}
                      />
                      <Chip 
                        label={stage.status.toUpperCase()}
                        size="small"
                        sx={{
                          background: stage.status === 'complete' ? 'rgba(0, 255, 127, 0.2)' :
                                     stage.status === 'ready' ? 'rgba(0, 191, 255, 0.2)' : 'rgba(255,255,255,0.1)',
                          color: stage.status === 'complete' ? '#00ff7f' :
                                 stage.status === 'ready' ? '#00bfff' : 'rgba(255,255,255,0.7)',
                          fontSize: '0.6rem',
                          height: 18,
                          fontFamily: 'monospace',
                          border: `1px solid ${stage.status === 'complete' ? '#00ff7f40' :
                                                stage.status === 'ready' ? '#00bfff40' : 'rgba(255,255,255,0.2)'}`,
                          '& .MuiChip-label': { px: 1 }
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
          </Box>
        )}

        {/* DNA Footer */}
        <Box sx={{ 
          p: 2, 
          mt: 'auto', 
          borderTop: '2px solid rgba(0, 255, 127, 0.2)',
          background: 'rgba(0, 0, 0, 0.4)'
        }}>
          <Typography variant="caption" sx={{ 
            color: 'rgba(0, 255, 127, 0.8)', 
            display: 'block',
            textAlign: 'center',
            fontFamily: 'monospace',
            fontSize: '0.8rem'
          }}>
            🧬 CrisPRO Genomic Command Center
          </Typography>
          <Typography variant="caption" sx={{ 
            color: 'rgba(0, 191, 255, 0.6)', 
            display: 'block',
            textAlign: 'center',
            fontSize: '0.7rem',
            fontFamily: 'monospace'
          }}>
            AI-Powered Therapeutic Discovery Engine
          </Typography>
        </Box>
      </StyledSidebar>
    </animated.div>
  );
};

export default DossierSidebar; 