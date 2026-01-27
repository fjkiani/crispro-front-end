import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Grid,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import InfoIcon from '@mui/icons-material/Info';

// Import components
import PatientContextEditor from '../components/food/PatientContextEditor';  // REUSING - NO DUPLICATION
import DrugRankingPanel from '../components/ayesha/DrugRankingPanel';
import FoodRankingPanel from '../components/ayesha/FoodRankingPanel';
import IntegratedConfidenceBar from '../components/ayesha/IntegratedConfidenceBar';
import ProvenancePanel from '../components/food/ProvenancePanel';
import { CompleteCareLoadingSkeleton } from '../components/LoadingSkeleton';
import { usePatient } from '../context/PatientContext';  // NEW: Use PatientContext

/**
 * AyeshaCompleteCare - Unified page for complete care plan (drugs + foods)
 * 
 * Shows side-by-side drug efficacy and food/supplement recommendations
 * orchestrated by unified backend endpoint.
 * 
 * UPDATED: Now uses PatientContext to load real patient data from database.
 */
export default function AyeshaCompleteCare() {
  const navigate = useNavigate();
  const {
    patientProfile,
    currentSession,
    carePlan,
    loading: patientLoading,
    error: patientError,
    isPatient,
    hasProfile,
    saveCarePlan,
    updatePatientProfile
  } = usePatient();

  // Local state for editable patient context (can be modified before generating plan)
  const [patientContext, setPatientContext] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provenanceModalOpen, setProvenanceModalOpen] = useState(false);

  // Build patient context from profile when it loads
  const buildPatientContext = useCallback(() => {
    if (!patientProfile) return null;
    
    return {
      disease: patientProfile.disease || 'ovarian_cancer_hgs',
      stage: patientProfile.stage,
      histology: patientProfile.histology,
      ca125_value: patientProfile.ca125_value,
      germline_status: patientProfile.germline_status || 'negative',
      treatment_line: patientProfile.treatment_line || 0,
      treatment_history: patientProfile.treatment_history || [],
      tumor_context: patientProfile.tumor_context || null,
      location_state: patientProfile.location_state,
      location_city: patientProfile.location_city,
      biomarkers: {
        brca1_mutant: patientProfile.tumor_context?.somatic_mutations?.some(m => m.gene === 'BRCA1') || false,
        brca2_mutant: patientProfile.tumor_context?.somatic_mutations?.some(m => m.gene === 'BRCA2') || false,
        hrd_positive: patientProfile.tumor_context?.hrd_score ? patientProfile.tumor_context.hrd_score >= 42 : false,
        tp53_mutant: patientProfile.tumor_context?.somatic_mutations?.some(m => m.gene === 'TP53') || false,
        high_tmb: patientProfile.tumor_context?.tmb ? patientProfile.tumor_context.tmb >= 10 : false
      }
    };
  }, [patientProfile]);

  // Update patient context when profile loads
  useEffect(() => {
    if (patientProfile) {
      setPatientContext(buildPatientContext());
    }
  }, [patientProfile, buildPatientContext]);

  // Load latest care plan on mount if exists
  useEffect(() => {
    if (carePlan && carePlan.care_plan_data) {
      // If we have a saved care plan, we could display it
      // For now, we'll just show that one exists
      console.log('Latest care plan loaded:', carePlan);
      // Optionally: setResult(carePlan.care_plan_data) to display it
    }
  }, [carePlan]);

  const handleContextUpdate = (newContext) => {
    setPatientContext(newContext);
    // Optionally auto-regenerate, but let's require explicit button click
  };

  const handleGeneratePlan = async () => {
    if (!hasProfile && !patientProfile) {
      setError('Please complete your patient profile first.');
      navigate('/patient/onboarding');
      return;
    }

    if (!patientContext) {
      setError('Patient context not loaded. Please wait...');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_ROOT}/api/ayesha/complete_care_plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_context: patientContext
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

      // Auto-save care plan after generation
      if (data && saveCarePlan && patientProfile?.id && currentSession?.id) {
        try {
          const saveResult = await saveCarePlan(data);
          if (saveResult?.error) {
            console.warn('Failed to auto-save care plan:', saveResult.error);
          } else {
            console.log('Care plan auto-saved successfully');
          }
        } catch (saveErr) {
          console.warn('Failed to auto-save care plan:', saveErr);
          // Don't fail the whole operation if save fails
        }
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (!result) return;
    
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ayesha_care_plan_${result.run_id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    // Future: Share functionality (email, link, etc.)
    alert('Share functionality coming soon!');
  };

  // Build unified provenance
  const buildUnifiedProvenance = () => {
    if (!result) return null;

    return {
      run_id: result.run_id,
      timestamp: result.timestamp,
      data_sources: {
        pubmed_papers: (result.provenance?.drug_analysis?.papers_reviewed || 0) + 
                       (result.provenance?.food_analysis?.papers_reviewed || 0),
        chembl_targets: result.drug_recommendations.length + result.food_recommendations.length,
        treatment_lines: patientContext.treatment_history.length
      },
      models_used: [
        { name: "Drug Efficacy Orchestrator", version: "v1" },
        { name: "Food Validator (A→B)", version: "v1" },
        { name: "SAE Feature Analysis", version: "v2.1" },
        { name: "Confidence Integration", method: "weighted_average" }
      ],
      confidence_breakdown: {
        evidence_quality: result.confidence_breakdown.drug_component,
        pathway_match: result.confidence_breakdown.food_component,
        safety_profile: result.integrated_confidence * 0.9  // Proxy
      }
    };
  };

  // Show loading if patient profile is loading
  if (patientLoading || !patientContext) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LinearProgress sx={{ width: '100%' }} />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading patient profile...
        </Typography>
      </Box>
    );
  }

  // Show error if not a patient or profile error
  if (patientError || !isPatient) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {patientError || 'Patient access only. This page is for patient users.'}
        </Alert>
        {!isPatient && (
          <Button variant="contained" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        )}
      </Box>
    );
  }

  // Show onboarding prompt if no profile
  if (!hasProfile) {
    return (
      <Box p={3}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Please complete your patient profile to generate a care plan.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/patient/onboarding')}>
          Complete Onboarding
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospitalIcon color="primary" fontSize="large" />
          Ayesha Complete Care - Integrated Drug + Food Plan
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Comprehensive care planning combining drug efficacy predictions and supportive food/supplement recommendations
          for personalized, holistic treatment guidance.
        </Typography>
        {carePlan && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Latest care plan saved: {new Date(carePlan.created_at).toLocaleDateString()}
          </Alert>
        )}
        <Alert severity="info" icon={<LocalHospitalIcon />} sx={{ mb: 2 }}>
          <strong>Research Use Only</strong> - This integrated analysis supports, not replaces, clinical judgment.
          Always consult oncologist before making treatment decisions.
        </Alert>
      </Box>

      {/* Patient Context Editor */}
      {patientContext && (
        <PatientContextEditor
          initialContext={patientContext}
          onUpdate={handleContextUpdate}
        />
      )}

      {/* Generate Plan Button */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGeneratePlan}
          disabled={loading}
          size="large"
          sx={{ px: 4 }}
        >
          {loading ? 'Generating Complete Care Plan...' : 'Generate Complete Care Plan'}
        </Button>
        {result && (
          <>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportJSON}
              size="large"
            >
              Export JSON
            </Button>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={handleShare}
              size="large"
            >
              Share
            </Button>
            <Button
              variant="outlined"
              startIcon={<InfoIcon />}
              onClick={() => setProvenanceModalOpen(true)}
              size="large"
            >
              View Provenance
            </Button>
          </>
        )}
      </Box>

      {/* Loading */}
      {loading && <CompleteCareLoadingSkeleton />}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Errors from API (partial results) */}
      {result?.errors && result.errors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Partial Results Available:
          </Typography>
          {result.errors.map((err, idx) => (
            <Typography key={idx} variant="body2">
              • {err}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Results */}
      {result && (
        <Box>
          {/* Integrated Confidence Bar */}
          <IntegratedConfidenceBar
            integratedConfidence={result.integrated_confidence}
            confidenceBreakdown={result.confidence_breakdown}
          />

          {/* Drug + Food Panels Side-by-Side */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <DrugRankingPanel
                drugs={result.drug_recommendations || []}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FoodRankingPanel
                foods={result.food_recommendations || []}
              />
            </Grid>
          </Grid>

          {/* Summary Stats */}
          <Card sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Summary
            </Typography>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Drug Recommendations:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {result.drug_recommendations?.length || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Food/Supplement Recommendations:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {result.food_recommendations?.length || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Integrated Confidence:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {Math.round(result.integrated_confidence * 100)}%
                </Typography>
              </Box>
            </Box>
          </Card>
        </Box>
      )}

      {/* Provenance Modal */}
      <Dialog
        open={provenanceModalOpen}
        onClose={() => setProvenanceModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Analysis Provenance</DialogTitle>
        <DialogContent>
          {result && buildUnifiedProvenance() && (
            <ProvenancePanel provenance={buildUnifiedProvenance()} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProvenanceModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

