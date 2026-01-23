import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Button,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  LocalPharmacy,
  Science,
  CheckCircle,
  GetApp,
  Share
} from '@mui/icons-material';

/**
 * ExecutiveSummaryCard Component
 * 
 * Displays key findings at a glance: DDR burden, top drug, TMB, actionability
 * 
 * @param {Object} props
 * @param {Object} props.executiveSummary - Executive summary data
 * @param {Function} props.onJumpToRecommendations - Callback to jump to recommendations
 * @param {Function} props.onExport - Callback to export dossier
 */
const ExecutiveSummaryCard = ({ 
  executiveSummary, 
  onJumpToRecommendations,
  onExport 
}) => {
  const {
    ddr_pathway_burden = 0,
    top_drug = 'N/A',
    top_drug_alignment = 0,
    tmb = 0,
    actionability = 'LOW'
  } = executiveSummary || {};

  // Color coding for actionability
  const getActionabilityColor = (actionability) => {
    switch (actionability) {
      case 'HIGH': return 'success';
      case 'MODERATE': return 'warning';
      case 'LOW': return 'error';
      default: return 'default';
    }
  };

  // TMB status
  const tmbStatus = tmb >= 20 ? 'HIGH' : tmb >= 10 ? 'MODERATE' : 'LOW';
  const tmbColor = tmb >= 20 ? 'success' : tmb >= 10 ? 'warning' : 'error';

  return (
    <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Executive Summary
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<GetApp />}
            onClick={() => onExport?.('pdf')}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Share />}
            onClick={() => onExport?.('share')}
          >
            Share
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* DDR Pathway Burden */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                DDR Pathway Burden
              </Typography>
              <Tooltip title="Homologous Recombination Deficiency pathway disruption score (0-1)">
                <Science fontSize="small" color="action" />
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: ddr_pathway_burden >= 0.8 ? 'error.main' : 'text.primary' }}>
                {(ddr_pathway_burden * 100).toFixed(0)}%
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={ddr_pathway_burden * 100}
                  sx={{
                    height: 12,
                    borderRadius: 1,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: ddr_pathway_burden >= 0.8 ? 'error.main' : 
                                      ddr_pathway_burden >= 0.5 ? 'warning.main' : 'success.main'
                    }
                  }}
                />
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {ddr_pathway_burden >= 0.8 ? 'MAXIMUM disruption' : 
               ddr_pathway_burden >= 0.5 ? 'HIGH disruption' : 'Moderate disruption'}
            </Typography>
          </Box>
        </Grid>

        {/* Top Drug Recommendation */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Top Recommended Drug
              </Typography>
              <Tooltip title="Highest mechanism alignment score">
                <LocalPharmacy fontSize="small" color="action" />
              </Tooltip>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {top_drug}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" color="primary">
                {(top_drug_alignment * 100).toFixed(0)}% Alignment
              </Typography>
              <Chip
                label="Mechanism Alignment Score"
                size="small"
                color="info"
                variant="outlined"
              />
            </Box>
            <Button
              variant="text"
              size="small"
              onClick={onJumpToRecommendations}
              sx={{ mt: 1 }}
            >
              View all recommendations →
            </Button>
          </Box>
        </Grid>

        {/* TMB Indicator */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tumor Mutational Burden (TMB)
              </Typography>
              <Tooltip title="Mutations per megabase (Mb). FDA threshold: ≥20 for IO eligibility">
                <TrendingUp fontSize="small" color="action" />
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {tmb.toFixed(1)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                mut/Mb
              </Typography>
              <Chip
                label={tmbStatus}
                color={tmbColor}
                size="small"
                icon={<CheckCircle />}
              />
            </Box>
            {tmb >= 20 && (
              <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                ✓ FDA threshold met (≥20 mut/Mb) - IO eligible
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Actionability */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Overall Actionability
              </Typography>
              <Tooltip title="Based on pathway disruption, drug alignment, and TMB">
                <CheckCircle fontSize="small" color="action" />
              </Tooltip>
            </Box>
            <Chip
              label={actionability}
              color={getActionabilityColor(actionability)}
              size="large"
              sx={{ 
                fontSize: '1.2rem',
                fontWeight: 700,
                height: 48,
                px: 2
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Based on pathway disruption, drug alignment, and biomarkers
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Quick Actions:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={onJumpToRecommendations}
          >
            View Drug Recommendations
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onExport?.('pdf')}
          >
            Export PDF
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onExport?.('json')}
          >
            Export JSON
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ExecutiveSummaryCard;


