import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Button, Card, CardContent, 
  LinearProgress, Chip, Divider, IconButton, Collapse
} from '@mui/material';
import { 
  ExpandMore, ExpandLess, Download, Edit, CheckCircle, 
  Warning, Info, Gavel
} from '@mui/icons-material';

const BaseSectionTemplate = ({ 
  sectionNumber,
  sectionTitle, 
  children,
  completionPercentage = 0,
  exportHandler,
  editable = false,
  fdaGuidance = null,
  validationStatus = 'pending' // 'complete', 'partial', 'pending', 'error'
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showGuidance, setShowGuidance] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return '#059669';
      case 'partial': return '#d97706';
      case 'error': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete': return <CheckCircle />;
      case 'partial': return <Warning />;
      case 'error': return <Warning />;
      default: return <Info />;
    }
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return '#059669';
    if (percentage >= 60) return '#d97706';
    return '#dc2626';
  };

  return (
    <Paper sx={{ 
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 3,
      mb: 3,
      overflow: 'hidden'
    }}>
      {/* FDA Section Header */}
      <Box sx={{ 
        p: 3,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 900, 
                color: 'white',
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}>
                Section {sectionNumber}: {sectionTitle}
              </Typography>
              
              {/* Status Indicator */}
              <Chip 
                icon={getStatusIcon(validationStatus)}
                label={validationStatus.toUpperCase()}
                sx={{ 
                  background: `linear-gradient(135deg, ${getStatusColor(validationStatus)}, ${getStatusColor(validationStatus)}cc)`,
                  color: 'white',
                  fontWeight: 700,
                  '& .MuiChip-icon': {
                    color: 'white'
                  }
                }}
              />
            </Box>
            
            {/* Completion Progress */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
              <Typography variant="body2" sx={{ 
                color: 'rgba(255,255,255,0.7)',
                minWidth: 100
              }}>
                Completeness:
              </Typography>
              <Box sx={{ flex: 1, maxWidth: 300 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={completionPercentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getCompletionColor(completionPercentage),
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ 
                color: getCompletionColor(completionPercentage),
                fontWeight: 700,
                minWidth: 50
              }}>
                {completionPercentage}%
              </Typography>
            </Box>
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            {fdaGuidance && (
              <Button
                size="small"
                startIcon={<Gavel />}
                onClick={() => setShowGuidance(!showGuidance)}
                sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.5)',
                    background: 'rgba(255,255,255,0.05)'
                  }
                }}
                variant="outlined"
              >
                FDA Guidance
              </Button>
            )}
            
            {editable && (
              <IconButton 
                size="small"
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                <Edit />
              </IconButton>
            )}
            
            {exportHandler && (
              <Button
                size="small"
                startIcon={<Download />}
                onClick={exportHandler}
                variant="contained"
                sx={{ 
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  px: 2
                }}
              >
                Export
              </Button>
            )}
            
            <IconButton 
              onClick={() => setExpanded(!expanded)}
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        {/* FDA Guidance Section */}
        <Collapse in={showGuidance}>
          <Box sx={{ 
            mt: 2,
            p: 2,
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 2
          }}>
            <Typography variant="h6" sx={{ 
              color: '#60a5fa', 
              fontWeight: 700, 
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Gavel sx={{ fontSize: 20 }} />
              FDA Regulatory Guidance
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255,255,255,0.9)',
              lineHeight: 1.6
            }}>
              {fdaGuidance || `FDA guidance for Section ${sectionNumber} requires comprehensive documentation of ${sectionTitle.toLowerCase()} with supporting data and analysis.`}
            </Typography>
          </Box>
        </Collapse>
      </Box>

      {/* Section Content */}
      <Collapse in={expanded}>
        <Box sx={{ p: 4 }}>
          {children}
        </Box>
      </Collapse>

      {/* Regulatory Footer */}
      <Box sx={{ 
        p: 2,
        background: 'rgba(0,0,0,0.2)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="caption" sx={{ 
          color: 'rgba(255,255,255,0.6)',
          fontFamily: 'monospace'
        }}>
          21 CFR 312.23 - IND Content and Format Requirements
        </Typography>
        <Typography variant="caption" sx={{ 
          color: 'rgba(255,255,255,0.6)',
          fontFamily: 'monospace'
        }}>
          Generated: {new Date().toLocaleDateString()}
        </Typography>
      </Box>
    </Paper>
  );
};

export default BaseSectionTemplate; 