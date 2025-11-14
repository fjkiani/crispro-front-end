import React from 'react';
import { Chip, Stack, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

/**
 * TrialBiomarkerBadge Component (Day 5 - Module M5)
 * 
 * Displays biomarker match badges for clinical trials.
 * Shows if trial matches patient's tumor biomarkers (TMB, MSI, HRD).
 * 
 * Critical for Ayesha: Quick visual indication of trial eligibility.
 * 
 * Props:
 * - trial: Trial object with biomarker requirements
 * - tumorContext: Patient's TumorContext from SporadicContext
 */
export default function TrialBiomarkerBadge({ trial, tumorContext }) {
  if (!tumorContext) {
    return null; // No tumor context available
  }

  const { tmb, msi_status, hrd_score } = tumorContext;

  // Parse trial biomarker requirements (simple keyword matching for Phase 1)
  const trialDescription = (trial.description || '').toLowerCase();
  const trialCriteria = (trial.eligibility_criteria || '').toLowerCase();
  const trialText = `${trialDescription} ${trialCriteria}`;

  // Check for biomarker mentions
  const requiresTmbHigh = trialText.includes('tmb') || trialText.includes('tumor mutational burden') || trialText.includes('high tmb');
  const requiresMsiHigh = trialText.includes('msi-h') || trialText.includes('msi-high') || trialText.includes('microsatellite instability');
  const requiresHrdHigh = trialText.includes('hrd') || trialText.includes('homologous recombination deficiency') || trialText.includes('brca');
  const requiresGermline = trialText.includes('germline') || trialText.includes('hereditary') || trialText.includes('inherited');

  // If trial requires germline, mark as not eligible for sporadic patients
  if (requiresGermline) {
    return (
      <Tooltip title="Trial requires germline mutation (hereditary cancer) - Not eligible for sporadic patients">
        <Chip
          icon={<CancelIcon />}
          label="Germline Required"
          size="small"
          color="error"
          variant="outlined"
          sx={{ fontSize: '0.7rem' }}
        />
      </Tooltip>
    );
  }

  // Calculate biomarker matches
  const matches = [];
  const mismatches = [];

  if (requiresTmbHigh) {
    if (tmb !== null && tmb !== undefined && tmb >= 20) {
      matches.push('TMB-High');
    } else if (tmb !== null && tmb !== undefined) {
      mismatches.push('TMB (too low)');
    } else {
      mismatches.push('TMB (unknown)');
    }
  }

  if (requiresMsiHigh) {
    if (msi_status === 'MSI-High') {
      matches.push('MSI-High');
    } else if (msi_status) {
      mismatches.push('MSI (not high)');
    } else {
      mismatches.push('MSI (unknown)');
    }
  }

  if (requiresHrdHigh) {
    if (hrd_score !== null && hrd_score !== undefined && hrd_score >= 42) {
      matches.push('HRD-High');
    } else if (hrd_score !== null && hrd_score !== undefined) {
      mismatches.push('HRD (too low)');
    } else {
      mismatches.push('HRD (unknown)');
    }
  }

  // If no biomarker requirements, don't show badges
  if (matches.length === 0 && mismatches.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {/* Matches */}
      {matches.map((match) => (
        <Tooltip key={match} title={`Trial requires ${match} - You qualify!`}>
          <Chip
            icon={<CheckCircleIcon />}
            label={match}
            size="small"
            color="success"
            variant="filled"
            sx={{ fontSize: '0.7rem', height: '20px' }}
          />
        </Tooltip>
      ))}

      {/* Mismatches */}
      {mismatches.map((mismatch) => (
        <Tooltip key={mismatch} title={`Trial requires biomarker data - Check eligibility`}>
          <Chip
            icon={<HelpOutlineIcon />}
            label={mismatch}
            size="small"
            color="warning"
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: '20px' }}
          />
        </Tooltip>
      ))}
    </Stack>
  );
}



