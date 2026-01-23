/**
 * IntelligenceSection - Intelligence gathering section
 * 
 * Displays:
 * - Next Test Recommendations
 * - Hint Tiles
 * - Mechanism Map
 */

import React from 'react';
import { Box, Grid } from '@mui/material';
import NextTestCard from '../ayesha/NextTestCard';
import HintTilesPanel from '../ayesha/HintTilesPanel';
import MechanismChips from '../ayesha/MechanismChips';

const IntelligenceSection = ({
  result,
}) => {
  if (!result) return null;

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* Next Tests */}
      <Grid item xs={12} md={4}>
        {result.next_test_recommender && (
          <NextTestCard 
            recommendations={result.next_test_recommender.recommendations || []} 
          />
        )}
      </Grid>

      {/* Hint Tiles */}
      <Grid item xs={12} md={8}>
        {result.hint_tiles?.hint_tiles && result.hint_tiles.hint_tiles.length > 0 && (
          <HintTilesPanel tiles={result.hint_tiles.hint_tiles} />
        )}
      </Grid>

      {/* Mechanism Map */}
      {result.mechanism_map && (
        <Grid item xs={12}>
          <Box sx={{ mb: 3 }}>
            <MechanismChips mechanismMap={result.mechanism_map} />
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default IntelligenceSection;
