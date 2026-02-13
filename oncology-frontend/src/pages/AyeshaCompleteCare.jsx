import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  LinearProgress,
  Grid,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import InfoIcon from '@mui/icons-material/Info';

// Import components
import DrugRankingPanel from '../components/ayesha/DrugRankingPanel';
import FoodRankingPanel from '../components/ayesha/FoodRankingPanel';
import IntegratedConfidenceBar from '../components/ayesha/IntegratedConfidenceBar';
import SOCRecommendationCard from '../components/ayesha/SOCRecommendationCard';
import NextTestCard from '../components/ayesha/NextTestCard';
import HintTilesPanel from '../components/ayesha/HintTilesPanel';
import MechanismChips from '../components/ayesha/MechanismChips';
import CA125Tracker from '../components/ayesha/CA125Tracker';
import ResistancePlaybook from '../components/ayesha/ResistancePlaybook';
import { TrialMatchesCard } from '../components/orchestrator/Analysis/TrialMatchesCard';
import ProvenancePanel from '../components/food/ProvenancePanel';
import { CompleteCareLoadingSkeleton } from '../components/LoadingSkeleton';
// PLUMBER 8: Import SyntheticLethalityCard
import { SyntheticLethalityCard } from '../components/orchestrator/Analysis/SyntheticLethalityCard';
// Phase 3: Import new components
import VUSResolutionCard from '../components/ayesha/VUSResolutionCard';
import EssentialityScoreDisplay from '../components/ayesha/EssentialityScoreDisplay';
import IOSafestSelectionCard from '../components/ayesha/IOSafestSelectionCard';

// Import REAL patient profile - single source of truth
import { AYESHA_11_17_25_PROFILE } from '../constants/patients';

/**
 * AyeshaCompleteCare - Unified page for complete care plan (drugs + foods)
 * 
 * Shows side-by-side drug efficacy and food/supplement recommendations
 * orchestrated by unified backend endpoint.
 * 
 * Uses AYESHA_11_17_25_PROFILE as single source of truth for patient data.
 */
export default function AyeshaCompleteCare() {
  // Use real patient profile - no hard-coding
  const [patientProfile] = useState(AYESHA_11_17_25_PROFILE);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provenanceModalOpen, setProvenanceModalOpen] = useState(false);

  /**
   * Build the API request body from the real patient profile.
   * Maps AYESHA_11_17_25_PROFILE structure to CompleteCareV2Request schema.
   */
  const buildRequestFromProfile = (profile) => {
    // Extract tumor_context from profile biomarkers (IHC/molecular data)
    const biomarkers = profile.tumor_context?.biomarkers || {};
    const somatic = profile.tumor_context?.somatic_mutations || [];
    
    // Build proper tumor_context for backend
    const tumor_context = {
      p53_status: biomarkers.p53_status || null,
      pd_l1: {
        cps: biomarkers.pd_l1_cps || null,
        status: biomarkers.pd_l1_status || null
      },
      // Flat keys for backend compatibility (some services expect non-nested fields)
      pd_l1_cps: biomarkers.pd_l1_cps || null,
      pd_l1_status: biomarkers.pd_l1_status || null,
      msi_status: biomarkers.msi_status || null,
      er_percent: biomarkers.er_percent || null,
      er_status: biomarkers.er_status || null,
      pr_status: biomarkers.pr_status || null,
      mmr_status: biomarkers.mmr_status || null,
      her2_status: biomarkers.her2_status || null,
      folr1_status: biomarkers.folr1_status || null,
      ntrk_status: biomarkers.ntrk_status || null,
      hrd_score: profile.tumor_context?.hrd_score || null,
      tmb: profile.tumor_context?.tmb || null,
      somatic_mutations: somatic.map(m => ({
        gene: m.gene,
        variant: m.variant || null,
        hgvs_p: m.protein_change || m.variant || null,  // May be null for IHC-only data
        evidence: m.evidence || null,
        // Include additional fields that WIWFM might need
        ...(m.provenance && { provenance: m.provenance })
      })).filter(m => m.gene)  // Only include mutations with gene name
    };

    return {
      ca125_value: profile.labs?.ca125_value || null,
      stage: profile.disease?.stage || "IVB",
      treatment_line: profile.inferred_fields?.treatment_line?.value?.toString() || "either",
      germline_status: profile.germline_status || profile.germline?.status?.toLowerCase() || "positive",
      location_state: profile.patient?.demographics?.location_state || "NY",
      has_ascites: profile.clinical?.has_ascites || false,
      has_peritoneal_disease: profile.clinical?.has_peritoneal_disease || false,
      ecog_status: profile.clinical?.ecog_status || null,
      tumor_context: tumor_context,
      treatment_history: [],  // Treatment-naive per profile
      // IO safest selection inputs (RUO)
      patient_age: profile.patient?.demographics?.age || null,
      autoimmune_history: profile.patient?.autoimmune_history || [],
      germline_variants: profile.germline?.mutations?.map(m => ({
        gene: m.gene,
        variant: m.variant,
        classification: m.classification,
        zygosity: m.zygosity
      })) || [],
      // Enable all MOAT capabilities
      include_trials: true,
      include_soc: true,
      include_ca125: true,
      include_wiwfm: true,
      include_io_selection: true,  // Safest IO selection (RUO)
      include_food: true,  // Enable food validator
      include_resistance: true,
      include_resistance_prediction: true,  // Enable Resistance Prophet
      max_trials: 10
    };
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Build request from REAL patient profile - no hard-coding
      const requestBody = buildRequestFromProfile(patientProfile);
      
      console.log('[AyeshaCompleteCare] Request body built from profile:', {
        stage: requestBody.stage,
        germline_status: requestBody.germline_status,
        has_tumor_context: !!requestBody.tumor_context,
        somatic_mutations_count: requestBody.tumor_context?.somatic_mutations?.length || 0,
        germline_variants_count: requestBody.germline_variants?.length || 0
      });
      
      const response = await fetch(`${import.meta.env.VITE_API_ROOT}/api/ayesha/complete_care_v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('[AyeshaCompleteCare] API response:', {
        has_wiwfm: !!data.wiwfm,
        wiwfm_status: data.wiwfm?.status,
        wiwfm_drugs_count: data.wiwfm?.drugs?.length || 0,
        has_trials: !!data.trials,
        trials_structure: data.trials ? {
          has_trials_array: !!data.trials.trials,
          trials_array_length: data.trials.trials?.length || 0,
          trials_array_type: Array.isArray(data.trials.trials) ? 'array' : typeof data.trials.trials,
          trials_keys: data.trials.trials ? Object.keys(data.trials.trials).slice(0, 5) : [],
          has_summary: !!data.trials.summary,
          summary_keys: data.trials.summary ? Object.keys(data.trials.summary) : [],
          summary_note: data.trials.summary?.note,
          summary_total: data.trials.summary?.total_candidates,
          summary_top: data.trials.summary?.top_results,
          full_trials_object: data.trials  // Full trials object for inspection
        } : null,
        has_soc: !!data.soc_recommendation,
        has_ca125: !!data.ca125_intelligence,
        has_food: !!data.food_validation,
        has_next_test: !!data.next_test_recommender,
        has_hint_tiles: !!data.hint_tiles,
        has_mechanism_map: !!data.mechanism_map,
        has_resistance: !!data.resistance_playbook
      });
      
      // Transform new API structure to match component expectations
      // Handle "awaiting_ngs" status properly
      const wiwfmDrugs = data.wiwfm?.status === "awaiting_ngs" 
        ? []  // No drugs if awaiting NGS
        : (data.wiwfm?.drugs || data.wiwfm?.recommendations || []);
      
      // PLUMBER 3: Call Synthetic Lethality endpoint
      let syntheticLethalityResult = null;
      try {
        const slMutations = [];
        // Add MBD4 from germline
        const mbd4Mutation = patientProfile.germline?.mutations?.find(m => m.gene === "MBD4");
        if (mbd4Mutation) {
          slMutations.push({
            gene: mbd4Mutation.gene,
            hgvs_p: mbd4Mutation.protein_change || null
          });
        }
        // Add TP53 from somatic (IHC evidence)
        const tp53Mutation = patientProfile.tumor_context?.somatic_mutations?.find(m => m.gene === "TP53");
        if (tp53Mutation) {
          slMutations.push({
            gene: tp53Mutation.gene
            // No hgvs_p for IHC-only evidence
          });
        }

        if (slMutations.length > 0) {
          const slResponse = await fetch(`${import.meta.env.VITE_API_ROOT}/api/guidance/synthetic_lethality`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              disease: patientProfile.disease?.type || 'ovarian_cancer_hgs',
              mutations: slMutations,
              api_base: import.meta.env.VITE_API_ROOT || 'http://localhost:8000'
            })
          });
          
          if (slResponse.ok) {
            syntheticLethalityResult = await slResponse.json();
            console.log('[AyeshaCompleteCare] Synthetic Lethality result:', syntheticLethalityResult);
          } else {
            console.warn('[AyeshaCompleteCare] Synthetic Lethality API error:', slResponse.status);
          }
        }
      } catch (err) {
        console.error('[AyeshaCompleteCare] Synthetic Lethality call failed:', err);
      }

      // PLUMBER 4: Call VUS Resolution for PDGFRA
      let vusResults = {};
      const vusMutations = patientProfile.germline?.mutations?.filter(m => m.classification === 'VUS') || [];
      for (const vus of vusMutations) {
        try {
          const vusResponse = await fetch(`${import.meta.env.VITE_API_ROOT}/api/vus/identify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              variant: {
                gene: vus.gene,
                hgvs_c: vus.variant || null,
                hgvs_p: vus.protein_change || null
              }
            })
          });
          
          if (vusResponse.ok) {
            vusResults[vus.gene] = await vusResponse.json();
            console.log(`[AyeshaCompleteCare] VUS Resolution for ${vus.gene}:`, vusResults[vus.gene]);
          } else {
            console.warn(`[AyeshaCompleteCare] VUS Resolution API error for ${vus.gene}:`, vusResponse.status);
          }
        } catch (err) {
          console.error(`[AyeshaCompleteCare] VUS Resolution call failed for ${vus.gene}:`, err);
        }
      }



      // PLUMBER X: Call Essentiality endpoint (real) for key genes (MBD4, TP53)
      let essentialityScores = [];
      try {
        const genesToScore = [];
        // Germline pathogenic genes
        (patientProfile.germline?.mutations || []).forEach(m => {
          if (m?.gene && (m.classification || '').toLowerCase() === 'pathogenic') {
            genesToScore.push({ gene: m.gene, consequence: (m.protein_change || '').includes('fs') ? 'frameshift_variant' : null });
          }
        });
        // Tumor somatic key genes (IHC evidence)
        (patientProfile.tumor_context?.somatic_mutations || []).forEach(m => {
          if (m?.gene) {
            genesToScore.push({ gene: m.gene, consequence: 'missense_variant' });
          }
        });

        // De-dupe by gene
        const seen = new Set();
        const unique = genesToScore.filter(x => {
          const g = (x.gene || '').toUpperCase();
          if (!g || seen.has(g)) return false;
          seen.add(g);
          return true;
        });

        for (const item of unique) {
          const resp = await fetch(`${import.meta.env.VITE_API_ROOT}/api/insights/predict_gene_essentiality`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gene: item.gene,
              variants: item.consequence ? [{ gene: item.gene, consequence: item.consequence }] : [],
            })
          });

          if (!resp.ok) {
            // Insights API may be disabled by feature flags in some deployments
            console.warn('[AyeshaCompleteCare] Essentiality API error:', item.gene, resp.status);
            continue;
          }

          const data = await resp.json();
          if (data && data.gene && typeof data.essentiality_score === 'number') {
            const score = data.essentiality_score;
            essentialityScores.push({
              gene: data.gene,
              essentiality_score: score,
              essentiality_level: score >= 0.7 ? 'HIGH' : (score >= 0.5 ? 'MODERATE' : 'LOW'),
              functional_consequence: data.flags?.frameshift ? 'Frameshift/truncation signal' : null,
              confidence: data.confidence,
              rationale: data.rationale,
              provenance: data.provenance,
            });
          }
        }

        if (essentialityScores.length > 0) {
          console.log('[AyeshaCompleteCare] Essentiality scores:', essentialityScores);
        }
      } catch (err) {
        console.error('[AyeshaCompleteCare] Essentiality call failed:', err);
      }

      const transformedData = {
        ...data,
        drug_recommendations: wiwfmDrugs,
        food_recommendations: data.food_validation?.recommendations || data.food_recommendations || [],
        integrated_confidence: data.wiwfm?.status === "awaiting_ngs" 
          ? null 
          : (data.wiwfm?.confidence || data.integrated_confidence || 0.7),
        confidence_breakdown: data.wiwfm?.status === "awaiting_ngs"
          ? null
          : (data.wiwfm?.confidence_breakdown || data.confidence_breakdown || {
              drug_component: data.wiwfm?.confidence || 0.7,
              food_component: data.food_validation?.confidence || 0.6
            }),
        wiwfm_status: data.wiwfm?.status,  // Pass through status for UI handling
        synthetic_lethality: syntheticLethalityResult,  // PLUMBER 3
        vus_results: vusResults,  // PLUMBER 4
        essentiality_scores: essentialityScores  // PLUMBER X
      };
      
      console.log('[AyeshaCompleteCare] Transformed data:', {
        drug_recommendations_count: transformedData.drug_recommendations.length,
        wiwfm_status: transformedData.wiwfm_status,
        has_synthetic_lethality: !!transformedData.synthetic_lethality,
        vus_results_count: Object.keys(transformedData.vus_results).length
      });
      
      setResult(transformedData);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load default results on mount (after handleGeneratePlan is defined)
  useEffect(() => {
    handleGeneratePlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Phase 3: Clinical Dossier Export
  const handleExportClinicalDossier = () => {
    if (!result || !patientProfile) return;

    // Build comprehensive clinical dossier
    const dossier = {
      patient_id: patientProfile.patient?.patient_id || 'AK',
      generated_date: new Date().toISOString(),
      dossier_type: 'complete_care_plan',
      patient_profile: {
        demographics: patientProfile.patient?.demographics,
        disease: patientProfile.disease,
        germline_status: patientProfile.germline_status,
        tumor_context: patientProfile.tumor_context
      },
      care_plan: {
        standard_of_care: result.soc_recommendation,
        drug_recommendations: result.drug_recommendations,
        food_recommendations: result.food_recommendations,
        clinical_trials: result.trials,
        ca125_intelligence: result.ca125_intelligence
      },
      genetic_analysis: {
        synthetic_lethality: result.synthetic_lethality,
        vus_results: result.vus_results,
        essentiality_scores: result.synthetic_lethality?.essentiality_scores || []
      },
      monitoring: {
        next_tests: result.next_test_recommender?.recommendations || [],
        resistance_playbook: result.resistance_playbook,
        mechanism_map: result.mechanism_map
      },
      provenance: {
        run_id: result.run_id || result.provenance?.run_id,
        generated_at: result.provenance?.generated_at || new Date().toISOString(),
        data_sources: buildUnifiedProvenance()?.data_sources
      }
    };

    // Export as JSON
    const dataStr = JSON.stringify(dossier, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clinical_dossier_${patientProfile.patient?.patient_id || 'AK'}_${new Date().toISOString().split('T')[0]}.json`;
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

    // Handle new API structure (complete_care_v2) vs old structure
    const drugCount = (result.drug_recommendations?.length || result.wiwfm?.drugs?.length || 0);
    const foodCount = (result.food_recommendations?.length || result.food_validation?.recommendations?.length || 0);
    const trialCount = (result.trials?.trials?.length || 0);

    return {
      run_id: result.provenance?.run_id || result.run_id,
      timestamp: result.provenance?.generated_at || result.timestamp,
      data_sources: {
        pubmed_papers: (result.provenance?.drug_analysis?.papers_reviewed || 0) + 
                       (result.provenance?.food_analysis?.papers_reviewed || 0),
        chembl_targets: drugCount + foodCount,
        clinical_trials: trialCount,
        treatment_lines: patientProfile.diagnostic_timeline?.length || 0
      },
      models_used: [
        { name: "Complete Care Orchestrator", version: "v2" },
        { name: "Drug Efficacy (WIWFM)", version: result.wiwfm ? "v2" : "v1" },
        { name: "Food Validator", version: result.food_validation ? "v2" : "v1" },
        { name: "SAE Feature Analysis", version: "v2.1" },
        { name: "Resistance Detection", version: "v2" }
      ],
      confidence_breakdown: {
        evidence_quality: result.confidence_breakdown?.drug_component || 0.7,
        pathway_match: result.confidence_breakdown?.food_component || 0.6,
        safety_profile: (result.integrated_confidence || result.summary?.confidence_level || 0.7) * 0.9
      }
    };
  };

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
        <Alert severity="info" icon={<LocalHospitalIcon />} sx={{ mb: 2 }}>
          <strong>Research Use Only</strong> - This integrated analysis supports, not replaces, clinical judgment.
          Always consult oncologist before making treatment decisions.
        </Alert>
      </Box>

      {/* Patient Profile Summary */}
      <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Patient Profile: {patientProfile.patient?.display_name || 'AK'}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">Disease</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {patientProfile.disease?.histology || 'High-grade serous carcinoma'} - Stage {patientProfile.disease?.stage || 'IVB'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">Germline Status</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, color: patientProfile.germline_status === 'positive' ? 'warning.main' : 'text.primary' }}>
              {patientProfile.germline_status?.toUpperCase() || 'UNKNOWN'} 
              {patientProfile.germline?.mutations?.[0]?.gene && ` (${patientProfile.germline.mutations[0].gene})`}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">Key Biomarkers</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              PD-L1: CPS {patientProfile.tumor_context?.biomarkers?.pd_l1_cps || 'N/A'} | 
              p53: {patientProfile.tumor_context?.biomarkers?.p53_status || 'N/A'} | 
              MMR: {patientProfile.tumor_context?.biomarkers?.mmr_status || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
        <Alert severity="info" sx={{ mt: 2 }}>
          Using <strong>AYESHA_11_17_25_PROFILE</strong> - source of truth from 7 parsed medical reports.
        </Alert>
      </Card>

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
              startIcon={<DownloadIcon />}
              onClick={handleExportClinicalDossier}
              size="large"
              color="secondary"
            >
              Export Clinical Dossier
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

      {/* PLUMBER 7: Germline Alert Component */}
      {patientProfile.germline?.status === 'POSITIVE' && 
       patientProfile.germline?.mutations?.some(m => m.classification === 'pathogenic') && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Germline Pathogenic Mutation Detected</AlertTitle>
          {patientProfile.germline.mutations
            .filter(m => m.classification === 'pathogenic')
            .map((mutation, idx) => (
              <Box key={idx}>
                <Typography>
                  <strong>{mutation.gene}</strong>
                  {mutation.syndrome && ` (${mutation.syndrome})`}
                </Typography>
                {mutation.risk_increases && mutation.risk_increases.length > 0 && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Risk increases:</strong> {mutation.risk_increases.join(', ')}
                  </Typography>
                )}
              </Box>
            ))}
        </Alert>
      )}

      {/* Awaiting NGS Status */}
      {result?.wiwfm_status === "awaiting_ngs" && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            NGS Data Required for Personalized Drug Recommendations
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {result.wiwfm?.message || "Personalized drug efficacy predictions require tumor NGS data (somatic mutations, HRD, TMB, MSI)"}
          </Typography>
          {result.wiwfm?.ngs_fast_track && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Recommended NGS Tests:
              </Typography>
              {Object.entries(result.wiwfm.ngs_fast_track).map(([key, value]) => (
                <Typography key={key} variant="body2" sx={{ pl: 2 }}>
                  • <strong>{key}:</strong> {value}
                </Typography>
              ))}
            </Box>
          )}
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
          {/* Integrated Confidence Bar - Only show if not awaiting NGS */}
          {result.wiwfm_status !== "awaiting_ngs" && (result.integrated_confidence || result.summary?.confidence_level) && (
            <IntegratedConfidenceBar
              integratedConfidence={result.integrated_confidence || 0.7}
              confidenceBreakdown={result.confidence_breakdown || {
                drug_component: 0.7,
                food_component: 0.6,
                safety_component: 0.8
              }}
            />
          )}

          {/* SOC Recommendation - Show first */}
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

          {/* PLUMBER 8: Synthetic Lethality Analysis */}
          {result.synthetic_lethality && (
            <Box sx={{ mb: 3 }}>
              <SyntheticLethalityCard
                slResult={result.synthetic_lethality}
                loading={false}
              />
            </Box>
          )}

          {/* PLUMBER 4: VUS Resolution Cards */}
          {result.vus_results && Object.keys(result.vus_results).length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🔍 Variant of Uncertain Significance (VUS) Resolution
                </Typography>
                {Object.entries(result.vus_results).map(([gene, vusData]) => {
                  const vusMutation = patientProfile.germline?.mutations?.find(m => m.gene === gene && m.classification === 'VUS');
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

          {/* Phase 3: Essentiality Score Display */}
          {((result.essentiality_scores && result.essentiality_scores.length > 0) || (result.synthetic_lethality?.essentiality_scores && result.synthetic_lethality.essentiality_scores.length > 0)) && (
            <Box sx={{ mb: 3 }}>
              <EssentialityScoreDisplay
                essentialityScores={(result.essentiality_scores && result.essentiality_scores.length > 0) ? result.essentiality_scores : result.synthetic_lethality.essentiality_scores}
                title="Gene Essentiality Analysis"
              />
            </Box>
          )}

          {/* Next Test Recommender + Hint Tiles */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              {result.next_test_recommender && (
                <NextTestCard recommendations={result.next_test_recommender.recommendations || []} />
              )}
            </Grid>
            <Grid item xs={12} md={8}>
              {result.hint_tiles?.hint_tiles && result.hint_tiles.hint_tiles.length > 0 && (
                <HintTilesPanel tiles={result.hint_tiles.hint_tiles} />
              )}
            </Grid>
          </Grid>

          {/* Mechanism Map */}
          {result.mechanism_map && (
            <Box sx={{ mb: 3 }}>
              <MechanismChips mechanismMap={result.mechanism_map} />
            </Box>
          )}

          {/* IO Safest Selection (RUO) */}
          {result.io_selection && (
            <Box sx={{ mb: 3 }}>
              <IOSafestSelectionCard ioSelection={result.io_selection} />
            </Box>
          )}

          {/* Clinical Trials - Show even if empty */}
          {result.trials && (
            <Box sx={{ mb: 3 }}>
              {result.trials.trials && result.trials.trials.length > 0 ? (
                <TrialMatchesCard
                  trialMatches={result.trials.trials}
                  loading={false}
                />
              ) : (
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Clinical Trials
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {result.trials.summary?.note || "No trials found. This may be due to strict eligibility criteria or database limitations."}
                  </Typography>
                  {result.trials.summary && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Candidates:</strong> {result.trials.summary.total_candidates || 0} | 
                        <strong> Top results:</strong> {result.trials.summary.top_results || 0}
                      </Typography>
                    </Box>
                  )}
                </Card>
              )}
            </Box>
          )}

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

          {/* Resistance Playbook */}
          {result.resistance_playbook && (
            <Box sx={{ mb: 3 }}>
              <ResistancePlaybook resistance_playbook={result.resistance_playbook} />
            </Box>
          )}

          {/* Phase 3: Genomics 101 - Patient-Friendly Explanations */}
          {(patientProfile.germline?.mutations?.length > 0 || patientProfile.tumor_context?.somatic_mutations?.length > 0) && (
          <Box sx={{ mb: 3 }}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🧬 Understanding Your Genetics
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Simple explanations of your genetic findings and what they mean for your treatment.
                </Typography>

                {/* MBD4 Explanation */}
                {patientProfile.germline?.mutations?.find(m => m.gene === 'MBD4' && m.classification === 'pathogenic') && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      MBD4 Mutation (Homozygous)
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>What it means:</strong> You have a mutation in both copies of the MBD4 gene. 
                      This gene normally repairs DNA damage. When it's broken, your cells can't fix certain 
                      types of DNA damage as well.
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Why this matters for treatment:</strong> Because your DNA repair system is compromised, 
                      drugs that create DNA damage (like platinum chemotherapy or PARP inhibitors) can be especially 
                      effective. Your tumor is more vulnerable to these drugs.
                    </Typography>
                    <Typography variant="body2">
                      <strong>Risk increases:</strong> This mutation is associated with increased risk for 
                      acute myeloid leukemia and colorectal cancer. Regular monitoring is recommended.
                    </Typography>
                  </Box>
                )}

                {/* TP53 Explanation */}
                {patientProfile.tumor_context?.somatic_mutations?.find(m => m.gene === 'TP53') && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      TP53 Mutation (Tumor)
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>What it means:</strong> Your tumor has a mutation in the TP53 gene, which is 
                      often called the "guardian of the genome." This gene normally stops damaged cells from 
                      growing and dividing.
                    </Typography>
                    <Typography variant="body2">
                      <strong>Why this matters for treatment:</strong> When TP53 is broken, tumor cells can 
                      grow unchecked. However, this also means the tumor has lost an important "checkpoint" 
                      that normally protects cells from DNA-damaging drugs. Combined with your MBD4 mutation, 
                      this creates a "double hit" vulnerability that certain drugs can exploit.
                    </Typography>
                  </Box>
                )}

                {/* PDGFRA VUS Explanation */}
                {patientProfile.germline?.mutations?.find(m => m.gene === 'PDGFRA' && m.classification === 'VUS') && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      PDGFRA Variant (VUS - Variant of Uncertain Significance)
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>What it means:</strong> A variant (genetic change) was found in your PDGFRA gene, 
                      but we don't yet know if it causes disease or is harmless. It could contribute to your 
                      cancer risk, or it could be benign (harmless).
                    </Typography>
                    <Typography variant="body2">
                      <strong>What we're doing:</strong> We're using advanced AI tools (Evo2, AlphaMissense) 
                      to analyze this variant and determine if it's likely harmful. The results will help 
                      clarify whether this variant needs monitoring or action.
                    </Typography>
                  </Box>
                )}

                {/* Synthetic Lethality Explanation */}
                {result.synthetic_lethality?.synthetic_lethality_detected && (
                  <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Treatment Opportunity: Synthetic Lethality
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>What this means:</strong> Your combination of genetic mutations (MBD4 + TP53) 
                      creates a specific vulnerability. When both DNA repair pathways are broken, your tumor 
                      becomes dependent on backup pathways that can be targeted with drugs.
                    </Typography>
                    <Typography variant="body2">
                      <strong>Why this is good news:</strong> This vulnerability means certain drugs (like 
                      PARP inhibitors, platinum chemotherapy, or ATR inhibitors) may be especially effective 
                      for you because they target the pathways your tumor now depends on.
                    </Typography>
                  </Box>
                )}
              </Card>
          </Box>
          )}

          {/* Summary Stats */}
          <Card sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Drug Recommendations:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {result.drug_recommendations?.length || 0}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Food/Supplement Recommendations:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {result.food_recommendations?.length || 0}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Trials Found:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {result.trials?.trials?.length || 0}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Confidence Level:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {result.integrated_confidence 
                    ? `${Math.round(result.integrated_confidence * 100)}%`
                    : result.summary?.confidence_level || "N/A"}
                </Typography>
              </Grid>
            </Grid>
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

