/**
 * OpportunityScoreCard - Header opportunity score display
 * 
 * Reusable component for displaying opportunity score.
 */
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export const OpportunityScoreCard = ({ profile, result }) => {
  // Calculate opportunity score (unified scoring across all capabilities)
  const calculateOpportunityScore = () => {
    if (!result) return 0;
    
    let score = 0;
    let maxScore = 0;
    
    // Trials (20 points max)
    const trials = result.trials?.trials || [];
    if (trials.length > 0) {
      score += Math.min(trials.length * 2, 20);
    }
    maxScore += 20;
    
    // SOC (15 points)
    if (result.soc_recommendation?.confidence) {
      score += result.soc_recommendation.confidence * 15;
    }
    maxScore += 15;
    
    // CA-125 trackable (10 points)
    if (result.ca125_intelligence?.burden_class) {
      score += 10;
    }
    maxScore += 10;
    
    // Drug efficacy available (20 points)
    if (result.wiwfm?.drugs?.length > 0 || result.wiwfm?.status !== 'awaiting_ngs') {
      score += 20;
    } else if (result.wiwfm?.status === 'awaiting_ngs') {
      score += 5; // Partial credit for pathway-only
    }
    maxScore += 20;
    
    // SAE features (15 points)
    if (result.sae_features?.dna_repair_capacity !== undefined) {
      score += 15;
    }
    maxScore += 15;
    
    // Resistance playbook (10 points)
    if (result.resistance_playbook?.risks?.length > 0) {
      score += 10;
    }
    maxScore += 10;
    
    // Resistance prediction (10 points)
    if (result.resistance_prediction?.risk_level) {
      score += 10;
    }
    maxScore += 10;
    
    return Math.round((score / maxScore) * 100);
  };

  const opportunityScore = calculateOpportunityScore();

  return (
    <Box mb={4} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          {profile.patient?.display_name || 'Ayesha'}'s Complete Care Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Stage {profile.disease?.stage || 'IVB'} {profile.disease?.histology?.replace(/_/g, ' ') || 'High-Grade Serous Carcinoma'} ({profile.disease?.primary_site || 'Mullerian origin'}) • 
          {profile.tumor_context?.biomarkers?.pd_l1_status === 'POSITIVE' 
            ? ` PD-L1+ (CPS ${profile.tumor_context.biomarkers.pd_l1_cps || 'N/A'})` 
            : ' PD-L1-'} • 
          {profile.tumor_context?.biomarkers?.p53_status === 'MUTANT_TYPE' ? ' p53 mutant type' : ''}
        </Typography>
      </Box>
      <Paper sx={{ 
        p: 2, 
        bgcolor: opportunityScore >= 70 ? 'success.light' : opportunityScore >= 40 ? 'warning.light' : 'error.light' 
      }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          {opportunityScore}%
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center' }}>
          Opportunity Score
        </Typography>
      </Paper>
    </Box>
  );
};

export default OpportunityScoreCard;
