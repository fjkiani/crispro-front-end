/**
 * PathwayDependencyDiagram Component
 * 
 * Visual representation of broken vs essential pathways.
 * Shows the synthetic lethality logic flow:
 * - Which pathways are broken (left side)
 * - Which backup pathways become essential (center)
 * - Which drugs target those pathways (right side)
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  Divider,
  Alert,
  Tooltip,
  Popover
} from '@mui/material';
import {
  ArrowForward,
  Cancel,
  CheckCircle,
  Biotech,
  Psychology
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

// Animation for connection lines
const shimmerAnimation = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

/**
 * @param {Object} props
 * @param {Array<string>} props.brokenPathways - List of broken pathways
 * @param {Array<string>} props.essentialPathways - List of essential backup pathways
 * @param {boolean} props.doubleHitDetected - Whether multiple hits detected
 * @param {number} props.syntheticLethalityScore - Combined SL score [0,1]
 */
const PathwayDependencyDiagram = ({
  brokenPathways = [],
  essentialPathways = [],
  doubleHitDetected = false,
  syntheticLethalityScore = 0
}) => {
  const [selectedPathway, setSelectedPathway] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverContent, setPopoverContent] = useState(null);

  // Map pathways to drug targets
  const pathwayToDrug = {
    'HR': 'PARP Inhibitors',
    'NER': 'Platinum Agents',
    'ATR/CHK1': 'ATR Inhibitors',
    'G2/M Checkpoint': 'WEE1 Inhibitors',
    'NHEJ': 'DNA-PK Inhibitors'
  };

  // Pathway descriptions for tooltips
  const pathwayDescriptions = {
    'BER': 'Base Excision Repair - repairs damaged DNA bases',
    'HR': 'Homologous Recombination - repairs double-strand breaks',
    'G1/S Checkpoint': 'Cell cycle checkpoint that stops damaged cells from dividing',
    'ATR/CHK1': 'DNA damage checkpoint pathway',
    'G2/M Checkpoint': 'Final checkpoint before cell division',
    'NER': 'Nucleotide Excision Repair - removes bulky DNA lesions'
  };

  const getTargetedDrugs = () => {
    const drugs = new Set();
    for (const pathway of essentialPathways) {
      if (pathwayToDrug[pathway]) {
        drugs.add(pathwayToDrug[pathway]);
      }
    }
    // Default to PARP if DNA repair is broken
    if (brokenPathways.some(p => ['BER', 'HR'].includes(p))) {
      drugs.add('PARP Inhibitors');
    }
    return Array.from(drugs);
  };

  const targetedDrugs = getTargetedDrugs();

  const handlePathwayClick = (pathway, type, event) => {
    const description = pathwayDescriptions[pathway] || `${pathway} pathway`;
    const drug = pathwayToDrug[pathway] || 'Unknown drug target';
    
    setPopoverContent({
      pathway,
      type,
      description,
      drug: type === 'essential' ? drug : null
    });
    setAnchorEl(event.currentTarget);
    setSelectedPathway(pathway);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setSelectedPathway(null);
  };

  // Animated connection line component
  const ConnectionLine = ({ active }) => (
    <Box
      sx={{
        width: 60,
        height: 4,
        background: active 
          ? 'linear-gradient(90deg, #4caf50, #2196f3)' 
          : '#e0e0e0',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&::after': active ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
          animation: `${shimmerAnimation} 2s infinite`
        } : {}
      }}
    />
  );

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Psychology color="secondary" />
        <Typography variant="h6" fontWeight="bold">
          Pathway Dependency Analysis
        </Typography>
      </Box>

      {doubleHitDetected && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="medium">
            🎯 <strong>Double-Hit Effect Detected</strong> — Multiple pathway deficiencies create amplified synthetic lethality opportunity
          </Typography>
        </Alert>
      )}

      {/* Three-Column Flow Diagram */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr auto 1fr auto 1fr' },
          gap: 2,
          alignItems: 'center'
        }}
      >
        {/* Column 1: Broken Pathways */}
        <Box>
          <Typography variant="subtitle2" color="error.main" gutterBottom sx={{ fontWeight: 'bold' }}>
            ❌ BROKEN PATHWAYS
          </Typography>
          <Stack spacing={1}>
            {brokenPathways.length > 0 ? (
              brokenPathways.map((pathway, idx) => (
                <Tooltip key={idx} title={pathwayDescriptions[pathway] || `${pathway} pathway`}>
                  <Chip
                    icon={<Cancel />}
                    label={pathway}
                    color="error"
                    variant="filled"
                    onClick={(e) => handlePathwayClick(pathway, 'broken', e)}
                    sx={{ 
                      justifyContent: 'flex-start',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      transform: selectedPathway === pathway ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: selectedPathway === pathway ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }
                    }}
                  />
                </Tooltip>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No pathways broken
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Animated Arrow/Connection */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignItems: 'center' }}>
          <ConnectionLine active={selectedPathway !== null} />
          <ArrowForward 
            color={selectedPathway ? 'primary' : 'action'} 
            sx={{ 
              fontSize: 32,
              transition: 'all 0.3s ease',
              transform: selectedPathway ? 'scale(1.2)' : 'scale(1)'
            }} 
          />
        </Box>

        {/* Column 2: Essential Backups */}
        <Box>
          <Typography variant="subtitle2" color="warning.main" gutterBottom sx={{ fontWeight: 'bold' }}>
            ⚠️ ESSENTIAL BACKUPS
          </Typography>
          <Stack spacing={1}>
            {essentialPathways.length > 0 ? (
              essentialPathways.map((pathway, idx) => (
                <Tooltip key={idx} title={`${pathwayDescriptions[pathway] || pathway} - Becomes essential when primary pathway is broken`}>
                  <Chip
                    icon={<CheckCircle />}
                    label={pathway}
                    color="warning"
                    variant="filled"
                    onClick={(e) => handlePathwayClick(pathway, 'essential', e)}
                    sx={{ 
                      justifyContent: 'flex-start',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      transform: selectedPathway === pathway ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: selectedPathway === pathway ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }
                    }}
                  />
                </Tooltip>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No backups identified
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Animated Arrow/Connection */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignItems: 'center' }}>
          <ConnectionLine active={selectedPathway !== null} />
          <ArrowForward 
            color={selectedPathway ? 'success' : 'action'} 
            sx={{ 
              fontSize: 32,
              transition: 'all 0.3s ease',
              transform: selectedPathway ? 'scale(1.2)' : 'scale(1)'
            }} 
          />
        </Box>

        {/* Column 3: Drug Targets */}
        <Box>
          <Typography variant="subtitle2" color="success.main" gutterBottom sx={{ fontWeight: 'bold' }}>
            💊 DRUG TARGETS
          </Typography>
          <Stack spacing={1}>
            {targetedDrugs.length > 0 ? (
              targetedDrugs.map((drug, idx) => (
                <Tooltip key={idx} title={`Targets essential backup pathways - creates synthetic lethality`}>
                  <Chip
                    icon={<Biotech />}
                    label={drug}
                    color="success"
                    variant="filled"
                    sx={{ 
                      justifyContent: 'flex-start',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }
                    }}
                  />
                </Tooltip>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No targets identified
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Synthetic Lethality Score */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          Synthetic Lethality Score
        </Typography>
        <Chip
          label={`${(syntheticLethalityScore * 100).toFixed(0)}%`}
          color={syntheticLethalityScore >= 0.7 ? 'success' : syntheticLethalityScore >= 0.5 ? 'warning' : 'default'}
          sx={{ fontWeight: 'bold', fontSize: '1rem' }}
        />
      </Box>

      {/* Explanation */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>How it works:</strong> When DNA repair pathways are broken, cells become dependent on backup mechanisms.
          Drugs targeting these backup pathways create <strong>synthetic lethality</strong> — cancer cells die while normal cells survive.
          <br />
          <strong>Tip:</strong> Click on any pathway to see details.
        </Typography>
      </Box>

      {/* Popover for pathway details */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {popoverContent && (
          <Box sx={{ p: 2, maxWidth: 300 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              {popoverContent.pathway}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {popoverContent.description}
            </Typography>
            {popoverContent.drug && (
              <Typography variant="body2" color="success.main" fontWeight="medium">
                💊 Targeted by: {popoverContent.drug}
              </Typography>
            )}
          </Box>
        )}
      </Popover>
    </Paper>
  );
};

export default PathwayDependencyDiagram;

