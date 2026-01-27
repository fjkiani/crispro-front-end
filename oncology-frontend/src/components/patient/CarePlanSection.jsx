/**
 * CarePlanSection - Core care plan recommendations section
 * 
 * Displays:
 * - SOC Recommendation
 * - CA-125 Intelligence
 * - Synthetic Lethality
 * - IO Safest Selection
 * - VUS Resolution
 * - Essentiality Scores
 */

import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import IntegratedConfidenceBar from '../ayesha/IntegratedConfidenceBar';
import SOCRecommendationCard from '../ayesha/SOCRecommendationCard';
import CA125Tracker from '../ayesha/CA125Tracker';
import { SyntheticLethalityCard } from '../orchestrator/Analysis/SyntheticLethalityCard';
import IOSafestSelectionCard from '../ayesha/IOSafestSelectionCard';
import VUSResolutionCard from '../ayesha/VUSResolutionCard';
import EssentialityScoreDisplay from '../ayesha/EssentialityScoreDisplay';

const CarePlanSection = ({
  result,
  patientProfile,
}) => {
  if (!result) return null;

  return (
    <Box>
      {/* Confidence Bar */}
      {(result.integrated_confidence || result.summary?.confidence_level) && (
        <Box sx={{ mb: 3 }}>
          <IntegratedConfidenceBar
            integratedConfidence={result.integrated_confidence || 0.7}
            confidenceBreakdown={result.confidence_breakdown || {
              drug_component: 0.7,
              food_component: 0.6,
              safety_component: 0.8
            }}
          />
        </Box>
      )}

      {/* SOC Recommendation - First Priority */}
      {result.soc_recommendation && (
        <Box sx={{ mb: 3 }}>
          <SOCRecommendationCard {...result.soc_recommendation} />
        </Box>
      )}

      {/* CA-125 Intelligence */}
      {result.ca125_intelligence && (
        <Box sx={{ mb: 3 }}>
          <CA125Tracker {...result.ca125_intelligence} />
        </Box>
      )}

      {/* Synthetic Lethality */}
      {result.synthetic_lethality && (
        <Box sx={{ mb: 3 }}>
          <SyntheticLethalityCard 
            slResult={result.synthetic_lethality}
            loading={false}
          />
        </Box>
      )}

      {/* IO Safest Selection */}
      {result.io_selection && result.io_selection.eligible && (
        <Box sx={{ mb: 3 }}>
          <IOSafestSelectionCard ioSelection={result.io_selection} />
        </Box>
      )}

      {/* VUS Resolution */}
      {result.vus_results && Object.keys(result.vus_results).length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Variant of Uncertain Significance (VUS) Analysis
            </Typography>
            {Object.entries(result.vus_results).map(([gene, vusData]) => {
              const vusMutation = patientProfile?.germline?.mutations?.find(
                m => m.gene === gene && m.classification === 'VUS'
              );
              if (!vusMutation) return null;
              
              return (
                <VUSResolutionCard
                  key={gene}
                  variant={{
                    gene: gene,
                    hgvs_c: vusMutation.variant,
                    hgvs_p: vusMutation.protein_change
                  }}
                  vusData={vusData}
                />
              );
            })}
          </Card>
        </Box>
      )}

      {/* Essentiality Scores */}
      {((result.essentiality_scores && result.essentiality_scores.length > 0) || 
        (result.synthetic_lethality?.essentiality_scores && result.synthetic_lethality.essentiality_scores.length > 0)) && (
        <Box sx={{ mb: 3 }}>
          <EssentialityScoreDisplay 
            essentialityScores={(result.essentiality_scores && result.essentiality_scores.length > 0) 
              ? result.essentiality_scores 
              : result.synthetic_lethality.essentiality_scores}
            title="Gene Essentiality Analysis"
          />
        </Box>
      )}
    </Box>
  );
};

export default CarePlanSection;
