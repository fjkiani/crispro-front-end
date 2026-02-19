import React, { useEffect, useMemo, useState } from 'react';
import { Box, Stack, Button, Alert, Typography, Switch, FormControlLabel, Dialog, IconButton, Tooltip } from '@mui/material';
import { History as HistoryIcon, Save as SaveIcon } from '@mui/icons-material';
import LiveJobBanner from '../components/myeloma/LiveJobBanner';
import VariantInputList from '../components/myeloma/VariantInputList';
import MyelomaResponseDisplay from '../components/myeloma/MyelomaResponseDisplay';
import ModelSelector from '../components/myeloma/ModelSelector';
import AssistantPanel from '../components/myeloma/AssistantPanel';
import EfficacyPanel from '../features/efficacy/components/EfficacyPanel';
import SavedAnalysesPanel from '../components/myeloma/SavedAnalysesPanel';
import { useAnalysisHistory } from '../context/AnalysisHistoryContext';
import { useCoPilotIntegration } from '../components/CoPilot/hooks';
import { MyelomaDigitalTwinIntegration } from '../components/CoPilot/integrations';

// ⚔️ TREATMENT LINE INTEGRATION - Ayesha's Hereditary Pathway
import TreatmentHistoryForm from '../components/TreatmentHistoryForm';
import TreatmentLineProvenance from '../components/TreatmentLineProvenance';
import SAETreatmentLineChips from '../components/SAETreatmentLineChips';

// 🧬 RESISTANCE PREDICTION - MM Resistance Analysis
import ResistancePanel from '../components/myeloma/ResistancePanel';
import { API_ROOT as API_BASE_URL } from '../lib/apiConfig';


const MyelomaDigitalTwin = () => {
  const [mutations, setMutations] = useState([]); // [{gene,hgvs_p,variant_info,build}]
  const [modelId, setModelId] = useState('evo2_1b'); // ⚔️ FIXED: Use 1B model (not 7B)
  const [dualCompare, setDualCompare] = useState(false);
  const [results, setResults] = useState(null);
  const [jobStatus, setJobStatus] = useState(null); // { run_signature, state, events, summary }
  const [polling, setPolling] = useState(false);
  const [usePriors, setUsePriors] = useState(true);
  const [synthesizeLit, setSynthesizeLit] = useState(false);
  const [showSavedAnalyses, setShowSavedAnalyses] = useState(false);
  const [analysisName, setAnalysisName] = useState('');
  const [efficacyData, setEfficacyData] = useState(null);
  
  // ⚔️ TREATMENT LINE INTEGRATION - State management (modularized for all diseases)
  const [treatmentHistory, setTreatmentHistory] = useState(null);
  const [disease, setDisease] = useState(null); // ⚔️ FIXED: Let TreatmentHistoryForm set disease dynamically

  // Analysis history integration
  const {
    saveAnalysis,
    hasAnalysis,
    getRecentAnalyses,
    loadAnalysis: loadSavedAnalysis
  } = useAnalysisHistory();

  // CoPilot integration - tell it about the current analysis context
  const currentVariant = validMutations.length > 0 ? {
    gene: validMutations[0].gene,
    hgvs_p: validMutations[0].hgvs_p,
    variant_info: validMutations[0].variant_info
  } : null;

  // ⚔️ FIXED: Use dynamic disease + TREATMENT LINE INTEGRATION
  useCoPilotIntegration({
    page: 'myeloma-digital-twin',
    variant: currentVariant,
    disease: disease || 'multiple_myeloma',
    treatmentHistory: treatmentHistory  // ⚔️ NEW: Pass treatment history to CoPilot
  });

  useEffect(() => {
    try { window.__mdt_model_id = modelId; } catch (_) {}
  }, [modelId]);

  useEffect(() => {
    try { window.__mdt_mutations = mutations; } catch (_) {}
  }, [mutations]);

  useEffect(() => {
    try { window.__mdt_synthesize_lit = synthesizeLit; } catch (_) {}
  }, [synthesizeLit]);

  const validMutations = useMemo(() => (Array.isArray(mutations) ? mutations.filter(m => m && m.variant_info && m.variant_info.trim()) : []), [mutations]);

  const handleWarmup = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/evo/warmup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_id: modelId })
      });
    } catch (_) {}
  };

  const runPredict = async () => {
    setResults(null);

    // Check if we already have this analysis
    const options = { dual_compare: dualCompare, use_priors: usePriors, hotspot_relaxation: true };
    const hasExistingAnalysis = await hasAnalysis(modelId, validMutations, options);
    if (hasExistingAnalysis) {
      const analysisKey = generateAnalysisKey(modelId, validMutations, options);
      const existing = await loadSavedAnalysis(analysisKey);
      if (existing && existing.results) {
        setResults(existing.results);
        console.log('Loaded existing analysis:', existing.name);
        return;
      }
    }

    try {
      // ⚔️ FIXED: Remove hardcoded use_case_id, make disease-agnostic
      const payload = {
        model_id: modelId,
        mutations: validMutations,
        options,
        // ⚔️ TREATMENT LINE INTEGRATION - Pass treatment history to backend
        disease: disease,
        treatment_history: treatmentHistory
      };
      const r = await fetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.detail || 'Predict failed');
      setResults(j);

      // Automatically save the analysis
      if (j && !j.error) {
        const analysisKey = await saveAnalysis({
          modelId,
          mutations: validMutations,
          results: j,
          options,
          name: analysisName || `Myeloma Analysis ${new Date().toLocaleString()}`
        });
        console.log('Analysis saved with key:', analysisKey);
        setAnalysisName(''); // Reset name for next analysis
      }
    } catch (e) {
      setResults({ error: String(e) });
    }
  };

  // Auto-run variant analysis when valid mutations exist so insight cards always appear
  useEffect(() => {
    if (validMutations.length > 0 && !results) {
      runPredict();
    }
  }, [validMutations.length]);

  // Helper function to generate analysis key (matching the context)
  const generateAnalysisKey = (modelId, mutations, options = {}) => {
    const mutationString = JSON.stringify(
      mutations
        .filter(m => m && m.variant_info)
        .sort((a, b) => (a.variant_info || '').localeCompare(b.variant_info || ''))
    );
    const optionsString = JSON.stringify(options);
    return btoa(`${modelId}:${mutationString}:${optionsString}`).slice(0, 32);
  };

  // Load a saved analysis
  const handleLoadAnalysis = (analysis) => {
    try {
      console.log('Loading analysis:', analysis);
      console.log('Raw mutations from analysis:', analysis.mutations);

      // Ensure mutations is an array
      const loadedMutations = Array.isArray(analysis.mutations)
        ? analysis.mutations
        : [];

      console.log('Loaded mutations array:', loadedMutations);

      // Process mutations to ensure they have the correct structure
      // The mutations should have: { gene, hgvs_p, variant_info, build }
      const processedMutations = loadedMutations.map((mutation, index) => {
        console.log(`Processing mutation ${index}:`, mutation);

        // Handle different mutation formats that might be saved
        let processed = {
          gene: mutation.gene || '',
          hgvs_p: mutation.hgvs_p || '',
          variant_info: mutation.variant_info || '',
          build: mutation.build || 'hg19'
        };

        // If variant_info is missing but we have other info, try to construct it
        if (!processed.variant_info && (mutation.chrom || mutation.pos || mutation.ref || mutation.alt)) {
          // This might be in the backend format
          processed.variant_info = `chr${mutation.chrom || ''}:${mutation.pos || ''} ${mutation.ref || ''}>${mutation.alt || ''}`;
        }

        // If gene is missing but we can extract it from other fields
        if (!processed.gene && processed.variant_info) {
          // Try to extract gene from variant_info if it contains gene name
          const geneMatch = processed.variant_info.match(/[A-Z]{3,10}/);
          if (geneMatch) {
            processed.gene = geneMatch[0];
          }
        }

        console.log(`Final processed mutation ${index}:`, processed);
        return processed;
      });

      console.log('Final processed mutations:', processedMutations);

      // Update state
      // ⚔️ FIXED: Use 1B model fallback (not 7B)
      setModelId(analysis.modelId || 'evo2_1b');
      setMutations(processedMutations);
      setDualCompare(analysis.options?.dual_compare || false);
      setUsePriors(analysis.options?.use_priors !== false);
      setResults(analysis.results || null);
      setEfficacyData(analysis.efficacyData || null); // Restore efficacy data
      setShowSavedAnalyses(false);

      console.log('Analysis loaded successfully');

      // Show success message
      alert(`Analysis "${analysis.name}" loaded successfully!`);

    } catch (error) {
      console.error('Error loading analysis:', error);
      alert(`Error loading analysis: ${error.message}\n\nPlease check the browser console for more details.`);
    }
  };

  // Manual save function
  const handleSaveAnalysis = async () => {
    if (!results || results.error) return;

    const options = { dual_compare: dualCompare, use_priors: usePriors, hotspot_relaxation: true };
    const analysisKey = await saveAnalysis({
      modelId,
      mutations: validMutations,
      results,
      options,
      efficacyData, // Include processed efficacy data
      name: analysisName || `Myeloma Analysis ${new Date().toLocaleString()}`
    });
    console.log('Analysis manually saved with key:', analysisKey);
    setAnalysisName('');
  };

  // Callback to receive efficacy data from EfficacyPanel
  const handleEfficacyData = (data) => {
    console.log('Received efficacy data:', data);
    setEfficacyData(data);

    // Auto-save when efficacy data is available (optional enhancement)
    if (data && results && !results.error) {
      const options = { dual_compare: dualCompare, use_priors: usePriors, hotspot_relaxation: true };
      saveAnalysis({
        modelId,
        mutations: validMutations,
        results,
        options,
        efficacyData: data,
        name: `Myeloma Analysis ${new Date().toLocaleString()}`
      }).then(key => {
        console.log('Analysis auto-saved with efficacy data:', key);
      });
    }
  };

  const submitJob = async () => {
    try {
      const payload = { model_id: modelId, mutations: validMutations, dual_compare: dualCompare };
      const r = await fetch(`${API_BASE_URL}/api/twin/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.detail || 'Submit failed');
      setJobStatus({ run_signature: j.run_signature, state: j.status, events: [], summary: null });
      startPolling(j.run_signature);
    } catch (e) {
      setJobStatus({ run_signature: null, state: 'error', events: [], summary: { error: String(e) } });
    }
  };

  const startPolling = (runSig) => {
    if (!runSig) return;
    setPolling(true);
    const tick = async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/api/twin/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ run_signature: runSig }),
        });
        const j = await r.json();
        if (r.ok) {
          setJobStatus(j);
          // When completed and summary exists, stop polling
          const state = j?.state || '';
          if (state === 'complete' || state === 'failed' || state === 'error') {
            setPolling(false);
          }
        }
      } catch (_) {}
    };
    // simple interval polling
    const id = setInterval(tick, 2500);
    // fire one immediately
    tick();
    // stop polling when unmounting or when setPolling(false)
    const stop = () => clearInterval(id);
    // store stop for later (not exposing globally to keep simple)
    return stop;
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Error Boundary */}
      {(() => {
        try {
          // Validate mutations structure
          const validMutationsCheck = Array.isArray(mutations) && mutations.every(m =>
            m && typeof m === 'object' && (m.variant_info || m.gene)
          );

          if (!validMutationsCheck && mutations.length > 0) {
            console.error('Invalid mutations structure:', mutations);
            return (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body1">
                  Error: Invalid mutation data structure detected.
                </Typography>
                <Typography variant="body2">
                  Please check the browser console for details.
                </Typography>
                <Button
                  onClick={() => setMutations([])}
                  sx={{ mt: 1 }}
                >
                  Reset Mutations
                </Button>
              </Alert>
            );
          }

          return null;
        } catch (error) {
          console.error('Error in validation:', error);
          return (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body1">
                Unexpected error in component validation.
              </Typography>
              <Typography variant="body2">
                {error.message}
              </Typography>
            </Alert>
          );
        }
      })()}

      {/* Job Status Ribbon */}
      {jobStatus && (
        <Alert
          severity={jobStatus.state === 'complete' ? 'success' : jobStatus.state === 'failed' || jobStatus.state === 'error' ? 'error' : 'info'}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2">
            <strong>Job {jobStatus.run_signature?.slice(0, 8) || 'n/a'}:</strong> {jobStatus.state || 'unknown'}
            {jobStatus.events && jobStatus.events.length > 0 && (
              <span> • Latest: {jobStatus.events[jobStatus.events.length - 1]?.stage}</span>
            )}
          </Typography>
        </Alert>
      )}

      {/* Controls */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
        <ModelSelector value={modelId} onChange={setModelId} />
        <FormControlLabel
          control={<Switch checked={dualCompare} onChange={(e)=>setDualCompare(e.target.checked)} />}
          label="Dual Model Compare"
        />
        <FormControlLabel
          control={<Switch checked={usePriors} onChange={(e)=>setUsePriors(e.target.checked)} />}
          label="Use Evidence Priors"
        />
        <FormControlLabel
          control={<Switch checked={synthesizeLit} onChange={(e)=>setSynthesizeLit(e.target.checked)} />}
          label="Synthesize Literature"
        />

        {/* Analysis History Controls */}
        <Tooltip title="View Saved Analyses">
          <IconButton
            onClick={() => {
              console.log('Current mutations in state:', mutations);
              console.log('Current results:', results);
              setShowSavedAnalyses(true);
            }}
            color="primary"
          >
            <HistoryIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Save Current Analysis">
          <span>
            <IconButton
              onClick={handleSaveAnalysis}
              disabled={!results}
              color="success"
            >
              <SaveIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Button variant="contained" onClick={runPredict} disabled={validMutations.length === 0}>
          Run Twin Analysis
        </Button>
        <Button variant="outlined" onClick={submitJob} disabled={validMutations.length === 0 || polling}>
          Submit as Job
        </Button>
      </Stack>

      <LiveJobBanner />

      {/* ⚔️ TREATMENT LINE INTEGRATION - Treatment History Form */}
      <Box sx={{ mb: 3 }}>
        <TreatmentHistoryForm
          disease={disease}
          onDiseaseChange={setDisease}
          onHistoryChange={setTreatmentHistory}
        />
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <VariantInputList value={mutations} onChange={setMutations} />
        </Box>
        <Box sx={{ width: { xs: '100%', md: 360 } }}>
          <AssistantPanel modelId={modelId} onWarmup={handleWarmup} results={results} onRunProfileAll={()=>{}} onRunProbeAll={()=>{}} />
        </Box>
      </Stack>

      <EfficacyPanel
        modelId={modelId}
        mutations={mutations}
        onEfficacyData={handleEfficacyData}
      />

      {/* 🧬 RESISTANCE PREDICTION - MM Resistance Analysis */}
      {validMutations.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            🧬 Resistance Analysis
          </Typography>
          <ResistancePanel
            mutations={validMutations}
            disease={disease || 'myeloma'}
            treatmentLine={treatmentHistory?.treatment_line || 1}
            priorTherapies={treatmentHistory?.prior_therapies}
            drugClass={treatmentHistory?.current_drug_class}
            currentRegimen={treatmentHistory?.current_regimen}
            autoFetch={true}
          />
        </Box>
      )}

      {/* CoPilot Integration - AI Clinical Assistant */}
      {/* ⚔️ FIXED: Use dynamic disease instead of hardcoded */}
      {currentVariant && (
        <MyelomaDigitalTwinIntegration
          variant={currentVariant}
          disease={disease || 'multiple_myeloma'}
          analysisResults={results}
        />
      )}

      {results && (
        <>
          {/* ⚔️ TREATMENT LINE INTEGRATION - Display Provenance & SAE Features */}
          {results.drugs && results.drugs.length > 0 && results.drugs[0].treatment_line_provenance && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                ⚔️ Treatment Line Context
              </Typography>
              
              {/* SAE Feature Chips */}
              <Box sx={{ mb: 2 }}>
                <SAETreatmentLineChips features={results.drugs[0].treatment_line_provenance} />
              </Box>
              
              {/* Detailed Provenance */}
              <TreatmentLineProvenance provenance={results.drugs[0].treatment_line_provenance} />
            </Box>
          )}
          
          <MyelomaResponseDisplay results={results} />
        </>
      )}

      {/* Saved Analyses Dialog */}
      <Dialog
        open={showSavedAnalyses}
        onClose={() => setShowSavedAnalyses(false)}
        maxWidth="md"
        fullWidth
      >
        <SavedAnalysesPanel
          onLoadAnalysis={handleLoadAnalysis}
          onClose={() => setShowSavedAnalyses(false)}
        />
      </Dialog>
    </Box>
  );
};

export default MyelomaDigitalTwin; 