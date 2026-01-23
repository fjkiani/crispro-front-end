import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import { useClinicalGenomicsContext } from '../context/ClinicalGenomicsContext';
import { useEfficacy } from '../hooks/useEfficacy';
import { useToxicity, useOffTarget } from '../hooks/useToxicity';
import { EfficacyCard } from '../cards/EfficacyCard';
import { EvidenceBand } from '../cards/EvidenceBand';
import { ToxicityRiskCard } from '../cards/ToxicityRiskCard';
import { OffTargetPreviewCard } from '../cards/OffTargetPreviewCard';
import { KGContextCard } from '../cards/KGContextCard';
import { SAEFeaturesCard } from '../cards/SAEFeaturesCard';
import { ClinicalGenomicsQuickActions } from '../integrations/ClinicalGenomicsCoPilotIntegration';

export const MechanisticEvidenceTab = () => {
  const { variant, patientProfile } = useClinicalGenomicsContext();
  const { result, loading, error, predict } = useEfficacy();
  const { 
    result: toxicityResult, 
    loading: toxicityLoading, 
    error: toxicityError, 
    assessRisk 
  } = useToxicity();
  const {
    result: offTargetResult,
    loading: offTargetLoading,
    error: offTargetError,
    previewGuides
  } = useOffTarget();
  const [profile, setProfile] = useState('baseline');
  
  const handleDeepAnalysis = async () => {
    if (!patientProfile.mutations || patientProfile.mutations.length === 0) {
      return;
    }
    
    try {
      // Run efficacy prediction
      await predict(
        patientProfile.mutations,
        patientProfile.cancer_type,
        profile
      );
      
      // Parallel: Toxicity assessment with mock germline variants for demo
      // In production, these would come from patient's germline profile
      const mockGermline = [
        { chrom: "1", pos: 97450058, ref: "C", alt: "T", gene: "DPYD" }, // Example pharmacogene
      ];
      
      await assessRisk(
        mockGermline,
        patientProfile.mutations,
        "platinum_agent", // Example MoA - in production, derive from top drug
        patientProfile.cancer_type
      );
      
      // Parallel: Off-target preview with mock guide RNAs
      // In production, these would come from CRISPR design tool
      const mockGuides = [
        { seq: "AGCTGCTAGCTGCTAGCTGC", pam: "NGG" },
        { seq: "GCTGATCGATCGATCGATCG", pam: "NGG" },
      ];
      
      await previewGuides(mockGuides);
    } catch (e) {
      console.error('Deep analysis failed:', e);
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Mechanistic Evidence (S/P/E Analysis)
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Deep analysis using Sequence/Pathway/Evidence framework with confidence scoring
      </Typography>
      
      {/* Profile toggle with tooltips */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Analysis Profile</InputLabel>
          <Select
            value={profile}
            label="Analysis Profile"
            onChange={(e) => setProfile(e.target.value)}
          >
            <Tooltip 
              title="Fast mode: Evo2 1B model, delta-only scoring, <10s response. Best for rapid triage and demos." 
              placement="right" 
              arrow
            >
              <MenuItem value="baseline">Baseline (Evo2 1B, Fast)</MenuItem>
            </Tooltip>
            
            <Tooltip 
              title="Richer Sequence: Multi-window + exon-context scoring for higher accuracy. ~20-30s response." 
              placement="right" 
              arrow
            >
              <MenuItem value="richer">Richer S (Multi-window)</MenuItem>
            </Tooltip>
            
            <Tooltip 
              title="Fusion mode: Baseline + AlphaMissense structural context. Highest confidence for GRCh38 missense variants." 
              placement="right" 
              arrow
            >
              <MenuItem value="fusion">Fusion (+ AlphaMissense)</MenuItem>
            </Tooltip>
          </Select>
        </FormControl>
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
          {profile === 'baseline' && '⚡ Evo2 1B, Delta-only scoring (~10s) - Best for demos & rapid triage'}
          {profile === 'richer' && '🎯 Multi-window + Exon context (~30s) - Higher accuracy, more compute'}
          {profile === 'fusion' && '🔬 Baseline + AlphaMissense fusion (~30s) - Highest confidence for missense variants'}
        </Typography>
      </Box>
      
      {/* Deep Analysis Button */}
      {!result && (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 6, 
            bgcolor: 'grey.50', 
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'grey.300'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Ready for Deep Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            This will run comprehensive S/P/E analysis including confidence scoring, 
            evidence tier classification, and mechanistic insights.
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleDeepAnalysis}
            disabled={loading || !patientProfile.mutations?.length}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Analyzing...' : '🧬 Run Deep Analysis'}
          </Button>
          {!patientProfile.mutations?.length && (
            <Typography variant="caption" display="block" color="error" sx={{ mt: 2 }}>
              Please enter variant information first
            </Typography>
          )}
        </Box>
      )}
      
      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
          Analysis failed: {error}
          <Button size="small" onClick={handleDeepAnalysis} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      )}
      
      {/* Results display */}
      {result && (
        <Box>
          {/* CoPilot Quick Actions - NEW P1 */}
          <ClinicalGenomicsQuickActions 
            additionalResults={{
              toxicity: toxicityResult,
              offtarget: offTargetResult,
              efficacy: result
            }}
          />
          
          {/* Evidence Band - Top priority confidence visualization */}
          <EvidenceBand result={result} />
          
          {/* SAE Features - Explainability FIRST for doctor trust */}
          <SAEFeaturesCard result={result} />
          
          {/* Main Efficacy Results */}
          <EfficacyCard result={result} />
          
          {/* Toxicity Risk */}
          <ToxicityRiskCard 
            result={toxicityResult} 
            loading={toxicityLoading} 
            error={toxicityError} 
          />
          
          {/* Off-Target Preview */}
          <OffTargetPreviewCard 
            result={offTargetResult}
            loading={offTargetLoading}
            error={offTargetError}
          />
          
          {/* KG Context */}
          <KGContextCard result={result} />
          
          {/* Re-run button */}
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={handleDeepAnalysis}
              disabled={loading}
            >
              Re-run Analysis
            </Button>
            <Button 
              variant="text"
              onClick={() => {
                // TODO: Export functionality
                console.log('Export:', result);
              }}
            >
              Export Results
            </Button>
          </Box>
        </Box>
      )}
      
      {/* RUO disclaimer */}
      <Alert severity="warning" sx={{ mt: 4 }}>
        <strong>Research Use Only</strong> - Not for clinical diagnosis or treatment decisions
      </Alert>
    </Box>
  );
};


