/**
 * SyntheticLethalityCard Component (Modularized)
 * 
 * Main orchestrator for synthetic lethality analysis display.
 * Composed of focused sub-components for maintainability.
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { Psychology } from '@mui/icons-material';

// Import sub-components
import { SLLoadingState } from './components/SLLoadingState';
import { SLEmptyState } from './components/SLEmptyState';
import { SLDetectionAlert } from './components/SLDetectionAlert';
import { SLPARPInhibitors } from './components/SLPARPInhibitors';
import { SLSuggestedTherapy } from './components/SLSuggestedTherapy';
import { SLEssentialityScores } from './components/SLEssentialityScores';
import { SLBrokenPathways } from './components/SLBrokenPathways';
import { SLEssentialPathways } from './components/SLEssentialPathways';
import { SLRecommendedDrugs } from './components/SLRecommendedDrugs';
import { SLExplanation } from './components/SLExplanation';

export const SyntheticLethalityCard = ({ slResult, loading = false }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  // Handle expanded section toggle
  const handleToggle = (section) => {
    setExpandedSection(section);
  };

  // Loading state
  if (loading) {
    return <SLLoadingState />;
  }

  // Empty state
  if (!slResult) {
    return <SLEmptyState />;
  }

  // Extract data
  const slDetected = slResult.synthetic_lethality_detected || false;
  const essentialityScores = slResult.essentiality_scores || [];
  const brokenPathways = slResult.broken_pathways || [];
  const essentialPathways = slResult.essential_pathways || [];
  const recommendedDrugs = slResult.recommended_drugs || [];
  const suggestedTherapy = slResult.suggested_therapy;

  return (
    <Card>
      <CardHeader
        avatar={<Psychology />}
        title="Synthetic Lethality Analysis"
        subheader={slDetected ? 'Synthetic Lethality Detected' : 'No Synthetic Lethality'}
      />
      <CardContent>
        {/* Detection Alerts */}
        <SLDetectionAlert 
          slDetected={slDetected}
          doubleHitDescription={slResult.double_hit_description}
        />

        {/* Top PARP Inhibitors */}
        <SLPARPInhibitors 
          recommendedDrugs={recommendedDrugs}
          slDetected={slDetected}
        />

        {/* Suggested Therapy */}
        <SLSuggestedTherapy suggestedTherapy={suggestedTherapy} />

        {/* Essentiality Scores */}
        <SLEssentialityScores
          essentialityScores={essentialityScores}
          expanded={expandedSection}
          onToggle={handleToggle}
        />

        {/* Broken Pathways */}
        <SLBrokenPathways
          brokenPathways={brokenPathways}
          expanded={expandedSection}
          onToggle={handleToggle}
        />

        {/* Essential Pathways */}
        <SLEssentialPathways
          essentialPathways={essentialPathways}
          expanded={expandedSection}
          onToggle={handleToggle}
        />

        {/* Recommended Drugs */}
        <SLRecommendedDrugs recommendedDrugs={recommendedDrugs} />

        {/* Explanation */}
        <SLExplanation explanation={slResult.explanation} />
      </CardContent>
    </Card>
  );
};
