import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip
} from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Science from '@mui/icons-material/Science';
import AccountTree from '@mui/icons-material/AccountTree';
import Build from '@mui/icons-material/Build';
import Info from '@mui/icons-material/Info';

const ExpandMoreIcon = ExpandMore;
const ScienceIcon = Science;
const AccountTreeIcon = AccountTree;
const BuildIcon = Build;
const InfoIcon = Info;
// Using CSS transitions instead of framer-motion for better compatibility

/**
 * MechanismPanel Component
 * 
 * Displays interactive compound targets, pathways, and mechanisms
 * with TCGA-weighted pathway visualization.
 * 
 * Props:
 * - targets: array - Array of target gene names
 * - pathways: array - Array of pathway names
 * - mechanisms: array - Array of mechanism descriptions
 * - mechanismScores: object - Scores for each mechanism (optional)
 * - tcgaWeights: object - TCGA-weighted pathway frequencies (optional)
 * - disease: string - Disease name for context
 */
export default function MechanismPanel({ 
  targets = [], 
  pathways = [], 
  mechanisms = [],
  mechanismScores = {},
  tcgaWeights = {},
  disease = ''
}) {
  const [expandedTarget, setExpandedTarget] = useState(null);
  const [expandedPathway, setExpandedPathway] = useState(null);

  // Handle empty data gracefully
  if (!targets || targets.length === 0) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
        <Typography variant="body2" color="text.secondary">
          No molecular targets identified for this compound
        </Typography>
      </Paper>
    );
  }

  // Get pathway weight (from TCGA data if available)
  const getPathwayWeight = (pathwayName) => {
    if (!tcgaWeights || Object.keys(tcgaWeights).length === 0) return null;
    
    // Try exact match first
    if (tcgaWeights[pathwayName]) {
      return tcgaWeights[pathwayName];
    }
    
    // Try normalized match (case-insensitive)
    const normalized = pathwayName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    for (const [key, value] of Object.entries(tcgaWeights)) {
      if (key.toLowerCase().replace(/[^a-z0-9]/g, '_') === normalized) {
        return value;
      }
    }
    
    return null;
  };

  // Get pathway weight color
  const getPathwayWeightColor = (weight) => {
    if (!weight) return 'default';
    if (weight >= 0.8) return 'success'; // High frequency
    if (weight >= 0.6) return 'info'; // Moderate-high
    if (weight >= 0.4) return 'warning'; // Moderate
    return 'default'; // Low
  };

  // Get mechanism score color
  const getMechanismScoreColor = (score) => {
    if (!score) return 'default';
    if (score >= 0.7) return 'success';
    if (score >= 0.5) return 'info';
    if (score >= 0.3) return 'warning';
    return 'default';
  };

  return (
    <Paper 
      sx={{ 
        p: 3, 
        bgcolor: 'background.paper',
        borderRadius: 2
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
        Mechanism of Action
      </Typography>

      <Grid container spacing={3}>
        {/* Targets Section */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ScienceIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Molecular Targets ({targets.length})
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Genes and proteins that this compound interacts with
            </Typography>

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {targets.map((target, index) => (
                <Box
                  key={index}
                  sx={{
                    opacity: 1,
                    transform: 'scale(1)',
                    transition: 'opacity 0.2s ease, transform 0.2s ease'
                  }}
                >
                  <Tooltip 
                    title={`Click to learn more about ${target}`}
                    arrow
                  >
                    <Chip
                      label={target}
                      color="primary"
                      variant="outlined"
                      onClick={() => setExpandedTarget(expandedTarget === target ? null : target)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'primary.light', color: 'white' }
                      }}
                    />
                    </Tooltip>
                  </Box>
                ))}
            </Stack>

            {/* Expanded Target Info */}
            {expandedTarget && (
              <Accordion 
                expanded={expandedTarget === expandedTarget} 
                sx={{ mt: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">
                    {expandedTarget} - Target Information
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    This compound interacts with the {expandedTarget} gene/protein,
                    which plays a role in cancer pathways. This interaction may
                    contribute to the compound's therapeutic effects.
                  </Typography>
                  <Typography 
                    variant="caption" 
                    component="a"
                    href={`https://www.ncbi.nlm.nih.gov/gene/?term=${expandedTarget}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                      display: 'block',
                      mt: 1
                    }}
                  >
                    View {expandedTarget} on NCBI Gene
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        </Grid>

        {/* Pathways Section */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AccountTreeIcon color="secondary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Cancer Pathways ({pathways.length})
              </Typography>
              {Object.keys(tcgaWeights).length > 0 && (
                <Tooltip 
                  title={
                    <Box>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>TCGA-Weighted Pathways</strong>
                      </Typography>
                      <Typography variant="body2">
                        Pathway frequencies are based on real mutation data from
                        The Cancer Genome Atlas (TCGA) for {disease || 'this cancer type'}.
                        Higher weights indicate pathways more commonly disrupted in this cancer.
                      </Typography>
                    </Box>
                  }
                  arrow
                >
                  <InfoIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
                </Tooltip>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Biological pathways affected by this compound
            </Typography>

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {pathways.map((pathway, index) => {
                const weight = getPathwayWeight(pathway);
                const weightPercent = weight ? (weight * 100).toFixed(0) : null;

                return (
                  <Box
                    key={index}
                    sx={{
                      opacity: 1,
                      transform: 'scale(1)',
                      transition: 'opacity 0.2s ease, transform 0.2s ease'
                    }}
                  >
                    <Tooltip
                      title={
                        <Box>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>{pathway}</strong>
                          </Typography>
                          {weight && (
                            <Typography variant="body2">
                              TCGA Frequency: {weightPercent}% of patients
                            </Typography>
                          )}
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            Click to learn more
                          </Typography>
                        </Box>
                      }
                      arrow
                    >
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span>{pathway}</span>
                            {weight && (
                              <Chip
                                label={`${weightPercent}%`}
                                size="small"
                                color={getPathwayWeightColor(weight)}
                                sx={{ 
                                  height: 18,
                                  fontSize: '0.65rem',
                                  ml: 0.5
                                }}
                              />
                            )}
                          </Box>
                        }
                        color="secondary"
                        variant="outlined"
                        onClick={() => setExpandedPathway(expandedPathway === pathway ? null : pathway)}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'secondary.light', color: 'white' }
                        }}
                      />
                    </Tooltip>
                  </Box>
                );
              })}
            </Stack>

            {/* Expanded Pathway Info */}
            {expandedPathway && (
              <Accordion 
                expanded={expandedPathway === expandedPathway} 
                sx={{ mt: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">
                    {expandedPathway} - Pathway Information
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    This compound affects the {expandedPathway} pathway, which plays
                    a critical role in cancer development and progression.
                  </Typography>
                  {getPathwayWeight(expandedPathway) && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        <strong>TCGA Data:</strong> This pathway is disrupted in{' '}
                        {getPathwayWeight(expandedPathway) * 100}% of patients with{' '}
                        {disease || 'this cancer type'}.
                      </Typography>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        </Grid>

        {/* Mechanisms Section */}
        {mechanisms && mechanisms.length > 0 && (
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <BuildIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Mechanisms of Action ({mechanisms.length})
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                How this compound works at the molecular level
              </Typography>

              <List>
                {mechanisms.map((mechanism, index) => {
                  const score = mechanismScores[mechanism] || mechanismScores[index];
                  
                  return (
                    <Box
                      key={index}
                      sx={{
                        opacity: 1,
                        transform: 'translateX(0)',
                        transition: 'opacity 0.3s ease, transform 0.3s ease'
                      }}
                    >
                      <ListItem
                        sx={{
                          bgcolor: 'background.default',
                          borderRadius: 1,
                          mb: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <ListItemIcon>
                          <BuildIcon color={getMechanismScoreColor(score)} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {mechanism}
                              </Typography>
                              {score !== undefined && (
                                <Chip
                                  label={`${(score * 100).toFixed(0)}%`}
                                  color={getMechanismScoreColor(score)}
                                  size="small"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              This mechanism contributes to the compound's therapeutic effects
                              through interaction with the identified targets and pathways.
                            </Typography>
                          }
                        />
                      </ListItem>
                    </Box>
                  );
                })}
              </List>
            </Box>
          </Grid>
        )}

        {/* TCGA Weights Legend */}
        {Object.keys(tcgaWeights).length > 0 && (
          <Grid item xs={12}>
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                <strong>TCGA Pathway Frequencies:</strong>
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  label="High (80-100%)" 
                  color="success" 
                  size="small" 
                  sx={{ fontSize: '0.65rem' }}
                />
                <Chip 
                  label="Moderate-High (60-80%)" 
                  color="info" 
                  size="small" 
                  sx={{ fontSize: '0.65rem' }}
                />
                <Chip 
                  label="Moderate (40-60%)" 
                  color="warning" 
                  size="small" 
                  sx={{ fontSize: '0.65rem' }}
                />
                <Chip 
                  label="Low (<40%)" 
                  color="default" 
                  size="small" 
                  sx={{ fontSize: '0.65rem' }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Percentages indicate how often this pathway is disrupted in patients with{' '}
                {disease || 'this cancer type'} based on TCGA mutation data.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}

