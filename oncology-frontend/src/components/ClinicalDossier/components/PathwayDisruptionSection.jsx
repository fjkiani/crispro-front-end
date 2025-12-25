import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
  LinearProgress,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import {
  ExpandMore,
  Science,
  Warning,
  CheckCircle,
  Info
} from '@mui/icons-material';
import DDRBinGauge from '../../pathway/DDRBinGauge';

/**
 * PathwayDisruptionSection Component
 *
 * Displays pathway disruption scores with visual indicators
 * Shows DDR, TP53, and other pathway scores
 *
 * @param {Object} props
 * @param {Object} props.pathwayScores - Object with pathway scores (e.g., { ddr: 1.0, tp53: 0.8 })
 * @param {number} props.dnaRepairCapacity - Optional DNA repair capacity score (0-1)
 */
const PathwayDisruptionSection = ({ pathwayScores = {}, dnaRepairCapacity = null, ddrBinScore = null, saeSource = null }) => {
  const [expandedPathway, setExpandedPathway] = useState(null);

  // Normalize pathway names for display
  const pathwayDisplayNames = {
    ddr: 'DNA Damage Response (DDR)',
    tp53: 'TP53 Pathway',
    ras_mapk: 'RAS/MAPK Pathway',
    pi3k: 'PI3K/AKT/mTOR Pathway',
    vegf: 'VEGF Pathway',
    her2: 'HER2 Pathway',
    efflux: 'Drug Efflux'
  };

  // Get pathway color based on score
  const getPathwayColor = (score) => {
    if (score >= 0.8) return 'error'; // Red - Maximum disruption
    if (score >= 0.5) return 'warning'; // Orange - High disruption
    if (score >= 0.2) return 'info'; // Blue - Moderate disruption
    return 'default'; // Gray - Low disruption
  };

  // Get pathway severity label
  const getPathwaySeverity = (score) => {
    if (score >= 0.8) return 'MAXIMUM';
    if (score >= 0.5) return 'HIGH';
    if (score >= 0.2) return 'MODERATE';
    return 'LOW';
  };

  // Sort pathways by score (highest first)
  const sortedPathways = Object.entries(pathwayScores || {})
    .filter(([_, score]) => score !== undefined && score !== null)
    .sort(([_, a], [__, b]) => b - a);

  if (sortedPathways.length === 0) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          3. Pathway Disruption Analysis
        </Typography>
        <Alert severity="info">
          <Typography variant="body2">
            No pathway disruption data available. Pathway analysis requires variant data.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }} id="pathway-disruption">
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        3. Pathway Disruption Analysis
      </Typography>

      {/* DDR_bin Gauge (if TRUE SAE is used) */}
      {saeSource === "true_sae" && ddrBinScore !== null && ddrBinScore !== undefined && (
        <Box sx={{ mb: 3 }}>
          <DDRBinGauge score={ddrBinScore} showLabel={true} />
        </Box>
      )}

      {/* Pathway Cards Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {sortedPathways.map(([pathway, score]) => {
          const displayName = pathwayDisplayNames[pathway] || pathway.toUpperCase();
          const severity = getPathwaySeverity(score);
          const color = getPathwayColor(score);
          const percent = Math.round(score * 100);

          return (
            <Grid item xs={12} sm={6} md={4} key={pathway}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: '100%',
                  borderLeft: `4px solid ${
                    color === 'error' ? '#d32f2f' :
                    color === 'warning' ? '#ed6c02' :
                    color === 'info' ? '#0288d1' :
                    '#757575'
                  }`
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {displayName}
                    </Typography>
                    <Chip
                      label={severity}
                      color={color}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  </Box>
                  <Tooltip title={`Pathway disruption score: ${score.toFixed(3)} (${percent}%)`}>
                    <Info fontSize="small" color="action" />
                  </Tooltip>
                </Box>

                {/* Progress Bar */}
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, percent)}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor:
                        color === 'error' ? '#d32f2f' :
                        color === 'warning' ? '#ed6c02' :
                        color === 'info' ? '#0288d1' :
                        '#757575'
                    }
                  }}
                />

                {/* Score Display */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Disruption Score
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {score.toFixed(2)}/1.00
                  </Typography>
                </Box>

                {/* Clinical Interpretation */}
                <Accordion
                  expanded={expandedPathway === pathway}
                  onChange={() => setExpandedPathway(expandedPathway === pathway ? null : pathway)}
                  sx={{ mt: 1, boxShadow: 'none' }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />} sx={{ minHeight: 32, py: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                      Clinical Interpretation
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {pathway === 'ddr' && (
                        <>
                          High DDR pathway disruption indicates DNA repair deficiency, 
                          which may confer sensitivity to PARP inhibitors and platinum-based chemotherapy.
                        </>
                      )}
                      {pathway === 'tp53' && (
                        <>
                          TP53 pathway disruption suggests loss of tumor suppressor function, 
                          potentially affecting checkpoint control and apoptosis pathways.
                        </>
                      )}
                      {pathway === 'ras_mapk' && (
                        <>
                          RAS/MAPK pathway activation may indicate sensitivity to MEK inhibitors 
                          or BRAF inhibitors (if BRAF mutations present).
                        </>
                      )}
                      {pathway === 'pi3k' && (
                        <>
                          PI3K pathway disruption may indicate sensitivity to PI3K/AKT/mTOR inhibitors.
                        </>
                      )}
                      {!['ddr', 'tp53', 'ras_mapk', 'pi3k'].includes(pathway) && (
                        <>
                          Pathway disruption score reflects cumulative impact of variants 
                          affecting this pathway. Higher scores indicate greater pathway burden.
                        </>
                      )}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* DNA Repair Capacity Gauge (if provided) */}
      {dnaRepairCapacity !== null && dnaRepairCapacity !== undefined && (
        <Box sx={{ mb: 3 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              DNA Repair Capacity
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Estimated Capacity
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {(dnaRepairCapacity * 100).toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={dnaRepairCapacity * 100}
                  sx={{
                    height: 12,
                    borderRadius: 1,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor:
                        dnaRepairCapacity >= 0.8 ? '#2e7d32' :
                        dnaRepairCapacity >= 0.5 ? '#ed6c02' :
                        '#d32f2f'
                    }
                  }}
                />
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={
                      dnaRepairCapacity >= 0.8 ? 'High Capacity' :
                      dnaRepairCapacity >= 0.5 ? 'Moderate Capacity' :
                      'Low Capacity'
                    }
                    color={
                      dnaRepairCapacity >= 0.8 ? 'success' :
                      dnaRepairCapacity >= 0.5 ? 'warning' :
                      'error'
                    }
                    size="small"
                  />
                  <Tooltip title="DNA repair capacity reflects the tumor's ability to repair DNA damage. Lower capacity may indicate increased sensitivity to DNA-damaging agents.">
                    <Chip
                      icon={<Info />}
                      label="Learn More"
                      size="small"
                      variant="outlined"
                      clickable
                    />
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Summary Alert */}
      <Alert severity="info" icon={<Science />}>
        <Typography variant="body2">
          <strong>Pathway Disruption Analysis:</strong> These scores reflect the cumulative 
          impact of genomic variants on key cancer pathways. Higher scores indicate greater 
          pathway burden, which may inform mechanism-aligned treatment selection. 
          <strong> These are mechanism alignment indicators, not validated outcome predictions.</strong>
        </Typography>
      </Alert>
    </Box>
  );
};

export default PathwayDisruptionSection;



















