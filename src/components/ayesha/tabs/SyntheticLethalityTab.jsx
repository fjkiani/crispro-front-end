import React from 'react';
import { Box, Typography, Alert, CircularProgress, Grid } from '@mui/material';
import SyntheticLethalityCard from '../SyntheticLethalityCard';
import EssentialPathwaysCard from '../EssentialPathwaysCard';
import SLDrugRecommendations from '../SLDrugRecommendations';
import PathwayDisruptionCard from '../PathwayDisruptionCard';

const SyntheticLethalityTab = ({ slResult, slLoading, slError, onShowTrials }) => {
  return (
    <Box>
      {slLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Analyzing synthetic lethality opportunities...
          </Typography>
        </Box>
      )}

      {slError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Error:</strong> {slError}
          </Typography>
        </Alert>
      )}

      {slResult && !slLoading && (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Full SL Analysis Card */}
          <Grid item xs={12}>
            <SyntheticLethalityCard data={slResult} onShowTrials={onShowTrials} />
          </Grid>

          {/* Essential Pathways */}
          {slResult.essential_pathways && slResult.essential_pathways.length > 0 && (
            <Grid item xs={12} md={6}>
              <EssentialPathwaysCard essentialPathways={slResult.essential_pathways} />
            </Grid>
          )}

          {/* SL Drug Recommendations */}
          {slResult.recommended_drugs && slResult.recommended_drugs.length > 0 && (
            <Grid item xs={12} md={6}>
              <SLDrugRecommendations recommendedDrugs={slResult.recommended_drugs} />
            </Grid>
          )}

          {/* Pathway Disruption (if not shown in Overview) */}
          {slResult.broken_pathways && slResult.broken_pathways.length > 0 && (
            <Grid item xs={12}>
              <PathwayDisruptionCard brokenPathways={slResult.broken_pathways} />
            </Grid>
          )}
        </Grid>
      )}

      {!slResult && !slLoading && !slError && (
        <Alert severity="info">
          <Typography variant="body2">
            No synthetic lethality analysis available. Click "Analyze" to run SL detection.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default SyntheticLethalityTab;
