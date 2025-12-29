import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  ExpandMore,
  Science,
  Info
} from '@mui/icons-material';

/**
 * DNARepairCapacityGauge Component
 *
 * Circular gauge showing DNA repair capacity (0.60/1.00)
 * Color zones: Green (0.8-1.0), Yellow (0.5-0.8), Red (<0.5)
 *
 * @param {Object} props
 * @param {number} props.capacity - DNA repair capacity score (0-1)
 * @param {Object} props.formula - Optional formula breakdown object
 */
const DNARepairCapacityGauge = ({ capacity = 0, formula = null }) => {
  const [expanded, setExpanded] = useState(false);

  // Validate capacity range
  const normalizedCapacity = Math.max(0, Math.min(1, capacity));
  const percent = Math.round(normalizedCapacity * 100);

  // Get color based on capacity
  const getColor = () => {
    if (normalizedCapacity >= 0.8) return '#2e7d32'; // Green
    if (normalizedCapacity >= 0.5) return '#ed6c02'; // Yellow/Orange
    return '#d32f2f'; // Red
  };

  // Get capacity label
  const getCapacityLabel = () => {
    if (normalizedCapacity >= 0.8) return 'High Capacity';
    if (normalizedCapacity >= 0.5) return 'Moderate Capacity';
    return 'Low Capacity';
  };

  // Get risk level
  const getRiskLevel = () => {
    if (normalizedCapacity >= 0.8) return 'Low Risk';
    if (normalizedCapacity >= 0.5) return 'Moderate Risk';
    return 'High Risk';
  };

  const color = getColor();
  const label = getCapacityLabel();
  const riskLevel = getRiskLevel();

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          DNA Repair Capacity
        </Typography>
        <Tooltip title="DNA repair capacity reflects the tumor's ability to repair DNA damage. Lower capacity may indicate increased sensitivity to DNA-damaging agents like platinum chemotherapy and PARP inhibitors.">
          <Info fontSize="small" color="action" />
        </Tooltip>
      </Box>

      {/* Circular Gauge */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            variant="determinate"
            value={percent}
            size={120}
            thickness={6}
            sx={{
              color: color,
              transform: 'rotate(-90deg)',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round'
              }
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
              {percent}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {normalizedCapacity.toFixed(2)}/1.00
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Capacity Status */}
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2, flexWrap: 'wrap' }}>
        <Chip
          label={label}
          sx={{
            backgroundColor: color,
            color: 'white',
            fontWeight: 600
          }}
        />
        <Chip
          label={riskLevel}
          variant="outlined"
          sx={{
            borderColor: color,
            color: color,
            fontWeight: 600
          }}
        />
      </Box>

      {/* Color Zones Legend */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          Capacity Zones:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="High (80-100%)"
            size="small"
            sx={{ backgroundColor: '#2e7d32', color: 'white' }}
          />
          <Chip
            label="Moderate (50-79%)"
            size="small"
            sx={{ backgroundColor: '#ed6c02', color: 'white' }}
          />
          <Chip
            label="Low (<50%)"
            size="small"
            sx={{ backgroundColor: '#d32f2f', color: 'white' }}
          />
        </Box>
      </Box>

      {/* Clinical Interpretation */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {normalizedCapacity >= 0.8 && (
            <>
              <strong>High DNA repair capacity</strong> suggests the tumor may be less sensitive 
              to DNA-damaging agents. Consider alternative mechanisms or combination strategies.
            </>
          )}
          {normalizedCapacity >= 0.5 && normalizedCapacity < 0.8 && (
            <>
              <strong>Moderate DNA repair capacity</strong> indicates potential sensitivity to 
              DNA-damaging agents like platinum chemotherapy and PARP inhibitors. 
              Monitor for resistance development.
            </>
          )}
          {normalizedCapacity < 0.5 && (
            <>
              <strong>Low DNA repair capacity</strong> suggests high sensitivity to DNA-damaging 
              agents. PARP inhibitors and platinum chemotherapy may be particularly effective. 
              Monitor for DNA repair restoration mechanisms.
            </>
          )}
        </Typography>
      </Box>

      {/* Formula Breakdown (Expandable) */}
      {formula && (
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Science fontSize="small" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Formula Breakdown
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontFamily: 'monospace' }}>
                DNA Repair Capacity = f(DDR pathway, TP53 pathway, HRD status)
              </Typography>
              {formula.components && (
                <Box sx={{ mt: 2 }}>
                  {Object.entries(formula.components).map(([component, value]) => (
                    <Box key={component} sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {component}: {typeof value === 'number' ? value.toFixed(3) : value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
              {formula.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {formula.description}
                </Typography>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Disclaimer */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          This capacity estimate is based on pathway disruption analysis and is not a validated 
          outcome prediction. Clinical response depends on multiple factors beyond DNA repair capacity.
        </Typography>
      </Box>
    </Paper>
  );
};

export default DNARepairCapacityGauge;














