import React from 'react';
import { Box, Typography, Alert, CircularProgress, Grid } from '@mui/material';
import SOCRecommendationCard from '../SOCRecommendationCard';
import DrugRankingPanel from '../DrugRankingPanel';
import FoodRankingPanel from '../FoodRankingPanel';
import {
  TimingFeaturesCard,
  TreatmentHistoryTimeline,
  ChemosensitivityFeaturesCard,
} from '../../timing';

const TreatmentTab = ({
  socRecommendation,
  wiwfm,
  foodValidation,
  timingFeatures,
  timingLoading,
  timingError,
  treatmentHistory
}) => {

  // Helper to determine if we should show the "treatment naive" alert
  const showNaiveAlert = !treatmentHistory || treatmentHistory.length === 0;

  return (
    <Box>
      {/* SOC */}
      {socRecommendation && (
        <Box mb={3}>
          <SOCRecommendationCard {...socRecommendation} />
        </Box>
      )}

      {/* Treatment History & Timing Features */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          ⏱️ Treatment History & Timing
        </Typography>

        {showNaiveAlert && (
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Treatment-Naive Patient:</strong> Timing features (PFI, PTPI, TFI, PFS, OS, KELIM)
              will be available once treatment begins. These metrics help assess treatment response
              and guide future therapy decisions.
            </Typography>
          </Alert>
        )}

        {/* Loading State */}
        {timingLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Computing timing and chemosensitivity features...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {timingError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Error computing timing features:</strong> {timingError}
            </Typography>
          </Alert>
        )}

        {/* Render Results */}
        {!showNaiveAlert && !timingLoading && !timingError && timingFeatures?.timing_features_table?.length > 0 && (
          <Grid container spacing={3}>
            {/* Timeline View */}
            <Grid item xs={12}>
              <TreatmentHistoryTimeline
                timingFeaturesTable={timingFeatures.timing_features_table}
                orientation="vertical"
                showTFI={true}
                showPFI={true}
                showPTPI={true}
              />
            </Grid>

            {/* Individual Regimen Cards */}
            {timingFeatures.timing_features_table.map((features, idx) => (
              <Grid item xs={12} md={6} key={features.regimen_id || idx}>
                <TimingFeaturesCard
                  timingFeatures={features}
                  showDetails={true}
                  highlightPFI={true}
                  highlightPTPI={true}
                />
                {/* KELIM/CA-125 Features */}
                {features.has_ca125_data && (
                  <ChemosensitivityFeaturesCard
                    kelimFeatures={{
                      kelim_k_value: features.kelim_k_value,
                      kelim_category: features.kelim_category,
                      ca125_percent_change_day21: features.ca125_percent_change_day21,
                      ca125_percent_change_day42: features.ca125_percent_change_day42,
                      ca125_time_to_50pct_reduction_days: features.ca125_time_to_50pct_reduction_days,
                      ca125_normalized_by_cycle3: features.ca125_normalized_by_cycle3,
                    }}
                    diseaseSite={features.disease_site || 'ovary'}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Drug Efficacy (WIWFM) */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          💊 Drug Efficacy Ranking (WIWFM)
        </Typography>
        {wiwfm?.status === 'awaiting_ngs' ? (
          <Alert severity="warning">
            <Typography variant="body2">
              <strong>Awaiting NGS Data:</strong> {wiwfm.message}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              NGS Fast-Track: {wiwfm.ngs_fast_track?.ctDNA}
            </Typography>
          </Alert>
        ) : wiwfm?.drugs ? (
          <DrugRankingPanel drugs={wiwfm.drugs} />
        ) : (
          <Alert severity="info">Drug efficacy data not available</Alert>
        )}
      </Box>

      {/* Food Validation */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          🥗 Food/Supplement Validation
        </Typography>
        {foodValidation ? (
          <FoodRankingPanel foods={[foodValidation]} />
        ) : (
          <Alert severity="info">
            Food validation not requested. Enable with a specific food query (e.g., "curcumin").
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default TreatmentTab;
