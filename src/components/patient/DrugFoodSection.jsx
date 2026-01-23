/**
 * DrugFoodSection - Drug and food recommendations section
 * 
 * Displays:
 * - Drug recommendations (WIWFM)
 * - Food/supplement recommendations
 * Side-by-side layout
 */

import React from 'react';
import { Box, Grid } from '@mui/material';
import DrugRankingPanel from '../ayesha/DrugRankingPanel';
import FoodRankingPanel from '../ayesha/FoodRankingPanel';

const DrugFoodSection = ({
  result,
}) => {
  if (!result) return null;

  const hasDrugs = result.drug_recommendations && result.drug_recommendations.length > 0;
  const hasFoods = result.food_recommendations && result.food_recommendations.length > 0;

  if (!hasDrugs && !hasFoods) return null;

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* Drug Recommendations */}
      <Grid item xs={12} md={6}>
        {hasDrugs && (
          <DrugRankingPanel drugs={result.drug_recommendations} />
        )}
      </Grid>

      {/* Food Recommendations */}
      <Grid item xs={12} md={6}>
        {hasFoods && (
          <FoodRankingPanel foods={result.food_recommendations} />
        )}
      </Grid>
    </Grid>
  );
};

export default DrugFoodSection;
