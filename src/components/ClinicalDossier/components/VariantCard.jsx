import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  ExpandMore,
  Science,
  Warning,
  CheckCircle,
  Info
} from '@mui/icons-material';

/**
 * VariantCard Component
 * 
 * Reusable card for displaying variant-level analysis
 * 
 * @param {Object} props
 * @param {Object} props.variant - Variant data object
 */
const VariantCard = ({ variant }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!variant) return null;
  
  const {
    gene = 'Unknown',
    hgvs_p = 'N/A',
    classification = 'Unknown',
    inheritance = 'Unknown',
    functional_impact = {},
    rationale = '',
    affects_drug_response = 0,
    hotspot_status = false
  } = variant;

  // Classification color
  const getClassificationColor = (classification) => {
    const upper = classification?.toUpperCase() || '';
    if (upper.includes('PATHOGENIC')) return 'error';
    if (upper.includes('LIKELY PATHOGENIC')) return 'warning';
    if (upper.includes('VUS')) return 'default';
    if (upper.includes('BENIGN')) return 'success';
    return 'default';
  };

  // Inheritance color
  const getInheritanceColor = (inheritance) => {
    const upper = inheritance?.toUpperCase() || '';
    if (upper.includes('GERMLINE')) return 'info';
    if (upper.includes('SOMATIC')) return 'secondary';
    return 'default';
  };

  // Driver status (HIGH/MODERATE/LOW based on functional impact)
  const getDriverStatus = () => {
    const functionality = functional_impact?.functionality_change ?? 1;
    const essentiality = functional_impact?.gene_essentiality ?? 0;
    
    if (functionality <= 0.2 && essentiality >= 0.7) return { level: 'HIGH', color: 'error' };
    if (functionality <= 0.5 || essentiality >= 0.5) return { level: 'MODERATE', color: 'warning' };
    return { level: 'LOW', color: 'default' };
  };

  const driverStatus = getDriverStatus();

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        mb: 2,
        borderLeft: `4px solid ${
          driverStatus.color === 'error' ? '#d32f2f' :
          driverStatus.color === 'warning' ? '#ed6c02' :
          '#757575'
        }`
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {gene}
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: 'monospace', color: 'text.secondary', mb: 1 }}>
            {hgvs_p}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {hotspot_status && (
            <Chip
              label="Hotspot"
              color="error"
              size="small"
              icon={<Warning />}
            />
          )}
          <Chip
            label={classification}
            color={getClassificationColor(classification)}
            size="small"
          />
          <Chip
            label={inheritance}
            color={getInheritanceColor(inheritance)}
            size="small"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Driver Status */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Driver Status:
          </Typography>
          <Chip
            label={`${driverStatus.level} PROBABILITY`}
            color={driverStatus.color}
            size="small"
          />
        </Box>
      </Box>

      {/* Functional Impact Scores */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Functionality Change
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress
                variant="determinate"
                value={(1 - (functional_impact?.functionality_change ?? 1)) * 100}
                sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                color={functional_impact?.functionality_change <= 0.2 ? 'error' : 'warning'}
              />
              <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'right' }}>
                {((1 - (functional_impact?.functionality_change ?? 1)) * 100).toFixed(0)}%
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {functional_impact?.functionality_change <= 0.2 ? 'Complete loss' : 
               functional_impact?.functionality_change <= 0.5 ? 'Partial loss' : 'Minimal impact'}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Gene Essentiality
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress
                variant="determinate"
                value={(functional_impact?.gene_essentiality ?? 0) * 100}
                sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                color={(functional_impact?.gene_essentiality ?? 0) >= 0.7 ? 'error' : 'warning'}
              />
              <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'right' }}>
                {((functional_impact?.gene_essentiality ?? 0) * 100).toFixed(0)}%
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {(functional_impact?.gene_essentiality ?? 0) >= 0.7 ? 'Highly essential' : 
               (functional_impact?.gene_essentiality ?? 0) >= 0.5 ? 'Moderately essential' : 'Low essentiality'}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Regulatory Impact
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress
                variant="determinate"
                value={(functional_impact?.regulatory_impact ?? 0) * 100}
                sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                color="default"
              />
              <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'right' }}>
                {((functional_impact?.regulatory_impact ?? 0) * 100).toFixed(0)}%
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {(functional_impact?.regulatory_impact ?? 0) >= 0.5 ? 'High impact' : 'Low impact'}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Affects Drug Response */}
      {affects_drug_response > 0 && (
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={<Science />}
            label={`Affects ${affects_drug_response} drug${affects_drug_response !== 1 ? 's' : ''} response`}
            color="info"
            size="small"
            variant="outlined"
          />
        </Box>
      )}

      {/* Biological Rationale (Expandable) */}
      {rationale && (
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Biological Rationale
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {rationale}
            </Typography>
          </AccordionDetails>
        </Accordion>
      )}
    </Paper>
  );
};

export default VariantCard;


