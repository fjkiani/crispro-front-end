/**
 * DDRStatusPage
 * 
 * Main page for DDR_bin status calculation and display.
 * Allows users to input patient data and view DDR classification results.
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import { useDDRStatus } from '../hooks/useDDRStatus';
import DDRInputForm from '../components/ddr/DDRInputForm';
import DDRStatusCard from '../components/ddr/DDRStatusCard';
import DDRFeatureBreakdown from '../components/ddr/DDRFeatureBreakdown';
import HRDPanel from '../components/ddr/HRDPanel';
import DDRMutationSummary from '../components/ddr/DDRMutationSummary';
import DDRRecommendationsPanel from '../components/ddr/DDRRecommendationsPanel';
import DDRTreatmentEligibility from '../components/ddr/DDRTreatmentEligibility';
import { useNavigate } from 'react-router-dom';
// Optional: Use patient context if available
// import { usePatient } from '../context/PatientContext';

const DDRStatusPage = () => {
  const { ddrStatus, loading, error, calculateDDRStatus, reset } = useDDRStatus();
  // Optional: Use patient context if available
  // const { patientProfile } = usePatient();
  const patientProfile = null; // Placeholder - can be enabled when PatientContext is available
  const navigate = useNavigate();
  const [inputMutations, setInputMutations] = useState([]);

  // Pre-fill form from patient profile if available
  useEffect(() => {
    if (patientProfile && !ddrStatus) {
      // Extract mutations from patient profile
      const somaticMutations = patientProfile.tumor_context?.somatic_mutations || [];
      const germlineMutations = patientProfile.germline?.mutations || [];
      
      const allMutations = [
        ...somaticMutations.map(m => ({
          gene_symbol: m.gene,
          variant_classification: m.classification || 'pathogenic',
          variant_type: m.type || 'SNV'
        })),
        ...germlineMutations.map(m => ({
          gene_symbol: m.gene,
          variant_classification: m.classification || 'pathogenic',
          variant_type: m.type || 'SNV'
        }))
      ];

      if (allMutations.length > 0) {
        setInputMutations(allMutations);
      }
    }
  }, [patientProfile, ddrStatus]);

  const handleSubmit = async (requestData) => {
    try {
      setInputMutations(requestData.mutations || []);
      await calculateDDRStatus(requestData);
    } catch (err) {
      console.error('[DDRStatusPage] Error calculating DDR status:', err);
    }
  };

  const handleViewTrials = () => {
    navigate('/ayesha-trials');
  };

  const handleReset = () => {
    reset();
    setInputMutations([]);
  };

  // Pre-fill initial data from patient profile
  const getInitialData = () => {
    if (!patientProfile) return null;

    return {
      patient_id: patientProfile.patient?.patient_id || 'AK',
      disease_site: patientProfile.disease?.type?.replace('_cancer_hgs', '').replace('_', '') || 'ovary',
      tumor_subtype: patientProfile.disease?.histology?.toUpperCase() || 'HGSOC',
      mutations: inputMutations
    };
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          DDR Status Calculator
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Pan-solid-tumor DNA Damage Repair (DDR) deficiency classifier. Determines DDR_defective, DDR_proficient, or unknown status based on genomic variants and HRD assay results.
        </Typography>
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Research Use Only:</strong> This tool is for research purposes only and should not be used for clinical decision-making without consultation with a qualified oncologist.
          </Typography>
        </Alert>
      </Box>

      {/* Input Form */}
      {!ddrStatus && (
        <DDRInputForm
          onSubmit={handleSubmit}
          initialData={getInitialData()}
          loading={loading}
        />
      )}

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Calculating DDR status...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            <strong>Error:</strong> {error}
          </Typography>
          <Typography variant="body2">
            Please check your input and try again. If the problem persists, contact support.
          </Typography>
        </Alert>
      )}

      {/* Results */}
      {ddrStatus && !loading && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              DDR Status Results
            </Typography>
            <Button
              variant="outlined"
              onClick={handleReset}
            >
              Calculate New Status
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Left Column - Status and Features */}
            <Grid item xs={12} md={8}>
              <DDRStatusCard ddrStatus={ddrStatus} />
              <DDRFeatureBreakdown ddrStatus={ddrStatus} />
              <HRDPanel ddrStatus={ddrStatus} />
              <DDRMutationSummary mutations={inputMutations} />
            </Grid>

            {/* Right Column - Recommendations */}
            <Grid item xs={12} md={4}>
              <DDRTreatmentEligibility
                ddrStatus={ddrStatus}
                onViewTrials={handleViewTrials}
              />
              <DDRRecommendationsPanel ddrStatus={ddrStatus} />
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default DDRStatusPage;
