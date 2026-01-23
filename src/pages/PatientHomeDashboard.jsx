/**
 * PatientHomeDashboard - Comprehensive 360-Degree Patient View
 * 
 * Patient-first landing experience for /home.
 * Provides a clean, comprehensive view of the patient's complete care plan.
 * 
 * Design principles:
 * - Clean, patient-friendly layout
 * - Comprehensive 360-degree view of care
 * - All MOAT capabilities integrated
 * - Modular, reusable components
 * - DRY - works for all patients
 * 
 * MODULARIZED: Uses reusable components for maintainability
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Typography,
  Alert,
  AlertTitle,
  Grid,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

// Import patient profile
import { AYESHA_11_17_25_PROFILE } from '../constants/patients';

// Import custom hook for data fetching
import { useCompleteCarePlan } from '../hooks/useCompleteCarePlan';

// Import modular components
import CarePlanHeader from '../components/patient/CarePlanHeader';
import CarePlanSection from '../components/patient/CarePlanSection';
import IntelligenceSection from '../components/patient/IntelligenceSection';
import TrialSection from '../components/patient/TrialSection';
import DrugFoodSection from '../components/patient/DrugFoodSection';
import ResistanceSection from '../components/patient/ResistanceSection';
import PatientDashboardInsights from '../components/patient/PatientDashboardInsights';
import PatientJourneyEnhanced from '../components/patient/PatientJourneyEnhanced';
import { CompleteCareLoadingSkeleton } from '../components/LoadingSkeleton';

export default function PatientHomeDashboard() {
  const [patientProfile] = useState(AYESHA_11_17_25_PROFILE);
  const navigate = useNavigate();
  
  // Use custom hook for data fetching
  const { result, loading, error, fetchCarePlan } = useCompleteCarePlan();

  // Auto-load on mount
  useEffect(() => {
    fetchCarePlan(patientProfile);
  }, [patientProfile, fetchCarePlan]);

  // Handlers
  const handleRefresh = () => {
    fetchCarePlan(patientProfile);
  };

  const handleExport = () => {
    if (!result) return;
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `care_plan_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handlers for PatientDashboardInsights
  const handleViewCarePlan = () => {
    navigate('/ayesha-complete-care');
  };

  const handleViewTrials = () => {
    navigate('/ayesha-trials');
  };

  const handleUploadTest = (testName) => {
    navigate('/patient/profile', { state: { uploadTest: testName } });
  };

  // Count trials from result
  const trialCount = result?.trials?.trials?.length || 0;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Header - Modular Component */}
      <CarePlanHeader
        patientProfile={patientProfile}
        loading={loading}
        onRefresh={handleRefresh}
        onExport={handleExport}
        result={result}
      />

      {/* Loading */}
      {loading && <CompleteCareLoadingSkeleton />}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error Loading Care Plan</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Results - Comprehensive 360-Degree View */}
      {result && !loading && (
        <Grid container spacing={3}>
          {/* Left Column: Patient Insights & Journey */}
          <Grid item xs={12} md={4}>
            {/* Patient Dashboard Insights - Integrated from PatientDashboard */}
            <PatientDashboardInsights
              patientProfile={patientProfile}
              carePlan={result} // Pass result as carePlan for now
              trialCount={trialCount}
              onViewCarePlan={handleViewCarePlan}
              onViewTrials={handleViewTrials}
              onUploadTest={handleUploadTest}
            />

            {/* Patient Journey Timeline - Integrated from PatientDashboard */}
            <Box sx={{ mt: 3 }}>
              <PatientJourneyEnhanced patientProfile={patientProfile} />
            </Box>
          </Grid>

          {/* Right Column: Complete Care Plan */}
          <Grid item xs={12} md={8}>
            {/* Core Care Plan Section - Modular Component */}
            <CarePlanSection
              result={result}
              patientProfile={patientProfile}
            />

            {/* Intelligence Section - Modular Component */}
            <IntelligenceSection result={result} />

            {/* Trial Section - Modular Component with Enhanced Research View */}
            <TrialSection result={result} patientProfile={patientProfile} />

            {/* Drug & Food Section - Modular Component */}
            <DrugFoodSection result={result} />

            {/* Resistance Section - Modular Component */}
            <ResistanceSection result={result} />

            {/* Provenance - Subtle Footer */}
            {result.provenance && (
              <Card sx={{ p: 2, bgcolor: 'grey.50', mt: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Last updated: {result.provenance.generated_at 
                    ? new Date(result.provenance.generated_at).toLocaleString() 
                    : 'Just now'} 
                  {result.provenance.run_id && ` • Run ID: ${result.provenance.run_id.substring(0, 16)}...`}
                </Typography>
              </Card>
            )}
          </Grid>
        </Grid>
      )}

      {/* Empty State - No Results Yet */}
      {!result && !loading && !error && (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Welcome to Your Care Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Click "Refresh Care Plan" to generate your comprehensive care plan.
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            size="large"
          >
            Generate Care Plan
          </Button>
        </Card>
      )}
    </Box>
  );
}
