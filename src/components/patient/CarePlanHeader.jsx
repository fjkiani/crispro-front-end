/**
 * CarePlanHeader - Header section for patient care plan dashboard
 * 
 * Displays:
 * - Patient name and diagnosis summary
 * - Key biomarker chips
 * - Action buttons (Refresh, Export)
 */

import React from 'react';
import {
  Box,
  Button,
  Typography,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';

const CarePlanHeader = ({
  patientProfile,
  loading,
  onRefresh,
  onExport,
  result,
}) => {
  const biomarkers = patientProfile?.tumor_context?.biomarkers || {};

  return (
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}
      >
        <LocalHospitalIcon color="primary" fontSize="large" />
        {patientProfile?.patient?.display_name || 'AK'} - Complete Care Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        {patientProfile?.disease?.diagnosis_summary || 'Your comprehensive care plan'}
      </Typography>

      {/* Key Patient Info - Clean Chips */}
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip 
          label={`Stage ${patientProfile?.disease?.stage || 'IVB'}`} 
          color="primary" 
          variant="outlined" 
        />
        <Chip 
          label={patientProfile?.disease?.type || 'Ovarian Cancer'} 
          variant="outlined" 
        />
        {biomarkers.pd_l1_cps && (
          <Chip 
            label={`PD-L1: CPS ${biomarkers.pd_l1_cps}`} 
            variant="outlined" 
          />
        )}
        {biomarkers.p53_status && (
          <Chip 
            label={`p53: ${biomarkers.p53_status}`} 
            variant="outlined" 
          />
        )}
        {biomarkers.mmr_status && (
          <Chip 
            label={`MMR: ${biomarkers.mmr_status}`} 
            variant="outlined" 
          />
        )}
        {biomarkers.er_percent && (
          <Chip 
            label={`ER: ${biomarkers.er_percent}%`} 
            variant="outlined" 
          />
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
          onClick={onRefresh}
          disabled={loading}
          size="large"
        >
          {loading ? 'Updating Care Plan...' : 'Refresh Care Plan'}
        </Button>
        {result && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onExport}
            size="large"
          >
            Export Care Plan
          </Button>
        )}
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Your Complete Care Dashboard</strong> - This view provides a comprehensive 360-degree look at your care plan, 
        including treatment recommendations, clinical trials, genetic insights, and monitoring strategies. 
        All information is personalized to your specific profile.
      </Alert>
    </Box>
  );
};

export default CarePlanHeader;
