/**
 * TrialSection - Enhanced Clinical trials section with Research capabilities
 *
 * Displays:
 * - Clinical trial matches with mechanism-fit scores
 * - Enhanced research view with detailed analysis
 * - Action suggestions and follow-up task creation
 */

import React, { useState, useMemo } from 'react';
import { Box, Card, Typography, Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { TrialMatchesCard } from '../orchestrator/Analysis/TrialMatchesCard';
import Research from '../../pages/Research';

/**
 * Adapter function to convert Ayesha's trial format to Research component format
 */
const adaptTrialsForResearch = (trials) => {
  if (!trials || !Array.isArray(trials)) return [];
  
  return trials.map(trial => ({
    nct_id: trial.nct_id || trial.id,
    title: trial.title || 'No Title',
    status: trial.status || 'UNKNOWN',
    phase: trial.phases || trial.phase || 'N/A',
    conditions: trial.conditions || '',
    interventions: trial.interventions || '',
    source_url: trial.source_url || `https://clinicaltrials.gov/ct2/show/${trial.nct_id || trial.id}`,
    // Map Ayesha's scoring to Research component format
    score: trial.score || trial.total_score || 0,
    keyword_matches: trial.keyword_matches || {},
    combo_matches: trial.combo_matches || [],
    reasoning: trial.reasoning || '',
    // Create interpreted_result structure for eligibility analysis
    interpreted_result: {
      eligibility_assessment: trial.score >= 0.7 ? 'Likely Eligible' : 
                              trial.score >= 0.5 ? 'Unclear - Review Needed' : 
                              'Likely Ineligible - Low Match Score',
      narrative_summary: trial.reasoning || `Trial match score: ${(trial.score || 0).toFixed(2)}. ${trial.combo_matches?.length ? `Key combinations: ${trial.combo_matches.join(', ')}. ` : ''}${Object.keys(trial.keyword_matches || {}).length ? `Matched keywords: ${Object.keys(trial.keyword_matches).join(', ')}.` : ''}`,
      llm_eligibility_analysis: {
        eligibility_assessment: {
          met_criteria: Object.keys(trial.keyword_matches || {}).map(keyword => ({
            criterion: `${keyword} pathway match`,
            reasoning: `Patient profile aligns with ${keyword} targeted therapy`,
            confidence: 'HIGH'
          })),
          unmet_criteria: [],
          unclear_criteria: []
        }
      }
    },
    // Include original Ayesha-specific fields
    ayesha_data: {
      score: trial.score,
      keyword_matches: trial.keyword_matches,
      combo_matches: trial.combo_matches,
      reasoning: trial.reasoning
    }
  }));
};

const TrialSection = ({
  result,
  patientProfile,
}) => {
  const [viewMode, setViewMode] = useState('compact'); // 'compact' or 'research'

  if (!result || !result.trials) return null;

  // Adapt trials for Research component
  const adaptedTrials = useMemo(() => {
    if (result.trials?.trials) {
      return adaptTrialsForResearch(result.trials.trials);
    }
    return [];
  }, [result.trials?.trials]);

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* View Mode Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
          Clinical Trials
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="compact">Compact View</ToggleButton>
          <ToggleButton value="research">Research Portal</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewMode === 'compact' ? (
        // Original compact view
        result.trials.trials && result.trials.trials.length > 0 ? (
          <TrialMatchesCard
            trialMatches={result.trials.trials}
            loading={false}
          />
        ) : (
          <Card sx={{ p: 3 }}>
            <Typography variant="body1" color="text.secondary">
              {result.trials.summary?.note || "No trials found at this time. Your care team will monitor for new opportunities."}
            </Typography>
          </Card>
        )
      ) : (
        // Enhanced Research Portal view
        <Card sx={{ p: 0, overflow: 'hidden' }}>
          <Research
            patientId={patientProfile?.patientId || 'ayesha'}
            embedded={true}
            initialTrials={adaptedTrials}
          />
        </Card>
      )}
    </Box>
  );
};

export default TrialSection;
