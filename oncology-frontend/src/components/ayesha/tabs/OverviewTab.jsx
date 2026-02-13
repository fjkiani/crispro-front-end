import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import SOCRecommendationCard from '../SOCRecommendationCard';
import NextTestCard from '../NextTestCard';
import MechanismVectorVisualization from '../MechanismVectorVisualization';
import PathwayDisruptionCard from '../PathwayDisruptionCard';
import EssentialPathwaysCard from '../EssentialPathwaysCard';
import AdvancedDrawers from './AdvancedDrawers';


const OverviewTab = ({
  profile,
  slResult,
  socRecommendation,
  nextTestRecommender,
  hintTiles,
  mechanismMap,
  saeFeatures
}) => {
  return (
    <Box>
      {/* Mechanism Intelligence Section */}
      <Box mb={3}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            mb: 2,
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          🧬 Mechanism Intelligence
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Identifying active drivers (Left) and functional vulnerabilities (Right).
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 2 }}>
          <Grid item xs={12} md={6}>
            <MechanismVectorVisualization
              mechanismVector={saeFeatures?.mechanism_vector}
              provenance={saeFeatures?.provenance || null}
              mutations={[
                ...(profile.germline?.mutations || []),
                ...(profile.tumor_context?.somatic_mutations || [])
              ]}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <PathwayDisruptionCard brokenPathways={slResult?.broken_pathways} />
          </Grid>
          {slResult?.essential_pathways && slResult.essential_pathways.length > 0 && (
            <Grid item xs={12}>
              <EssentialPathwaysCard essentialPathways={slResult.essential_pathways} />
            </Grid>
          )}
        </Grid>
      </Box>

      {/* SOC Recommendation */}
      {socRecommendation && (
        <Box mb={3}>
          <SOCRecommendationCard {...socRecommendation} />
        </Box>
      )}

      {/* Primary Next Steps (The "What Now") */}
      <Box mb={3}>
        <NextTestCard recommendations={nextTestRecommender?.recommendations || []} />
      </Box>

      {/* Advanced Intelligence Drawer (The "Deep Dive") */}
      <AdvancedDrawers
        mechanismMap={mechanismMap}
        saeFeatures={saeFeatures}
        hintTiles={hintTiles}
      />
    </Box>
  );
};

export default OverviewTab;
