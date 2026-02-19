/**
 * Ayesha 360° Command Center (Zeta Protocol v3)
 * 
 * "The War Room"
 * 
 * Philosophy:
 * - Hierarchy of Fire: Radar -> Primary Directive -> Reinforcements.
 * - Brutal Honesty: Show evidence levels (L1/L2/L3) and missing inputs.
 * - No Noise: Only actionable intelligence.
 */
import React, { useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Grid,
  Typography,
  Paper,
  Alert,
  Fade,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Bolt as SLIcon,
  Timeline as VelocityIcon,
  Shield as IOIcon,
  Warning as ResistanceIcon,
  CheckCircle as ValidatedIcon,
} from '@mui/icons-material';

// Hooks
import { useAyeshaProfile } from '../../hooks/ayesha/useAyeshaProfile';
import { useAyeshaCareData } from '../../hooks/ayesha/useAyeshaCareData';
import { useSyntheticLethality } from '../../hooks/useSyntheticLethality';
import { usePatientStatus } from '../../hooks/usePatientStatus';

// Zeta Components
import {
  ZetaSignalCard,
  ZetaPrimaryDirective,
  ZetaTrialCard,
  IntelGapsList,
} from './ZetaDashboardComponents';

import { WarRoomLoadingSkeleton } from '../../components/LoadingSkeleton';
import { ErrorState } from '../../components/orchestrator/Common/index';

// ----------------------------------------------------------------------
// LOGIC HELPER: PRIMARY DIRECTIVE
// ----------------------------------------------------------------------
const getPrimaryDirective = (slResult, resistanceAlert, trialCount, socRecommendation, profile) => {
  // 1. HIGHEST PRIORITY: Synthetic Lethality (The "Silver Bullet")
  if (slResult?.synthetic_lethality_detected) {
    const drug = slResult.recommended_drugs?.[0];
    const inputs = ['NGS (Somatic)', 'Pathway Map'];
    if (profile.germline?.mutations?.length > 0) inputs.push('Germline');

    return {
      headline: `DEPLOY ${drug ? drug.drug_name.toUpperCase() : 'TARGETED THERAPY'}`,
      subheadline: `Synthetic Lethality Detected: ${slResult.double_hit_description?.split('→')[0]}`,
      reasoning: [
        `Double-hit mechanism verified in ${slResult.broken_pathways?.[0] || 'DDR'} pathway`,
        drug?.confidence ? `predicted sensitivity > ${Math.round(drug.confidence * 100)}%` : "High mechanism alignment detected",
      ],
      receipts: {
        level: 'L3', // SL engine is high-fidelity
        inputs: inputs,
        missing: [],
      },
      actionLabel: 'OPEN DIGITAL TWIN',
      actionRoute: '/ayesha-digital-twin',
      color: 'secondary', // Mars Rules: Purple/Pink for SL
    };
  }

  // 2. HIGH PRIORITY: Critical Resistance (The "Shield Breaker")
  if (resistanceAlert?.alert_triggered) {
    return {
      headline: "SWITCH STRATEGY: PLATINUM RESISTANCE",
      subheadline: "Resistance Signals Detected",
      reasoning: [
        resistanceAlert.message,
        "Avoid standard Carboplatin regimens",
      ],
      receipts: {
        level: 'L2', // Resistance rule derived
        inputs: ['Clinical History', 'Time to Progression'],
        missing: ['ctDNA Series'],
      },
      actionLabel: 'OPEN RESISTANCE LAB',
      actionRoute: '/resistance-lab',
      color: 'error', // Mars Rules: Red for Danger
    };
  }

  // 3. PRIORITY: Trial Hunter (if good matches found)
  if (trialCount > 0) {
    return {
      headline: "ENGAGE CLINICAL TRIALS",
      subheadline: `${trialCount} High-Fidelity Matches Found`,
      reasoning: [
        "Multiple pathway-aligned options available",
        "Standard of Care options limited or exhausted",
      ],
      receipts: {
        level: 'L2',
        inputs: ['NGS', 'Clinical Profile', 'Trial Protocol'],
        missing: [],
      },
      actionLabel: 'VIEW ALL TRIALS',
      actionRoute: '/ayesha/trials-full',
      color: 'primary',
    };
  }

  // 4. FALLBACK: Standard of Care
  return {
    headline: "CONTINUE STANDARD OF CARE",
    subheadline: socRecommendation?.regimen || "Monitoring Phase",
    reasoning: [
      socRecommendation?.reasoning || "No actionable deviations detected",
    ],
    receipts: {
      level: 'L1', // Guideline based
      inputs: ['Disease Stage', 'Treatment Line'],
      missing: [],
    },
    actionLabel: 'VIEW THERAPY FIT',
    actionRoute: '/ayesha/therapy-fit',
    color: 'info',
  };
};


// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------
const AyeshaTrialExplorer = () => {
  const navigate = useNavigate();
  const { profile } = useAyeshaProfile();
  const { missingTests } = usePatientStatus(profile);

  const { result, loading, error, refresh } = useAyeshaCareData({
    include_trials: true,
    max_trials: 50, // We only show top 3, but fetch enough to be sure
    include_sl: true,
    include_ca125: true,
    include_resistance: true,
    include_io_selection: true,
  });

  // Synthetic Lethality (Parallel Load)
  const { slResult, analyzeSL } = useSyntheticLethality();
  useEffect(() => { analyzeSL(profile); }, [profile, analyzeSL]);

  // Extract Signals
  const ca125 = result?.ca125_intelligence;
  const resistance = result?.resistance_alert;
  const io = result?.io_selection;
  const trials = result?.trials?.trials || [];

  // Directive Logic
  const directive = useMemo(() =>
    getPrimaryDirective(slResult, resistance, trials.length, result?.soc_recommendation, profile),
    [slResult, resistance, trials.length, result, profile]);

  if (loading) return <WarRoomLoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <Fade in>
      <Box sx={{ p: 3, maxWidth: '1600px', mx: 'auto' }}>

        {/* 1. THE THREAT BOARD (RADAR) */}
        <Typography variant="overline" fontWeight="900" color="text.secondary" letterSpacing={2} mb={1} display="block">
          SECTOR 1: THREAT RADAR
        </Typography>
        <Grid container spacing={2} mb={4}>
          {/* SL Signal */}
          <Grid item xs={12} md={3}>
            <ZetaSignalCard
              title="Synthetic Lethality"
              icon={<SLIcon fontSize="small" />}
              status={slResult?.synthetic_lethality_detected ? "LOCKED" : "SCANNING"}
              color={slResult?.synthetic_lethality_detected ? "secondary" : "default"}
              evidenceLevel={slResult?.synthetic_lethality_detected ? "L3" : "L1"}
              evidenceText={slResult?.synthetic_lethality_detected
                ? `${slResult.double_hit_description?.split('→')[0]} Detected`
                : "No Mechanistic Vulnerability"}
              inputsUsed="NGS • Pathway Map"
              actionLabel="Digital Twin"
              onAction={() => navigate('/ayesha-digital-twin')}
            />
          </Grid>

          {/* Velocity Signal */}
          <Grid item xs={12} md={3}>
            <ZetaSignalCard
              title="Tumor Velocity"
              icon={<VelocityIcon fontSize="small" />}
              status={ca125?.burden_class || "UNKNOWN"}
              color={ca125?.burden_class === 'EXTENSIVE' ? "error" : ca125?.burden_class === 'SIGNIFICANT' ? "warning" : "success"}
              evidenceLevel="L2"
              evidenceText={ca125?.forecast
                ? `Doubling Time: ${ca125.doubling_time || 'N/A'}`
                : "Insufficient Kinetic Data"}
              inputsUsed={`CA-125 Series (${profile.ca125_history?.length || 1} pts)`}
              actionLabel="View Kinetics"
              onAction={() => navigate('/ayesha')} // Or expand modal
            />
          </Grid>

          {/* IO Signal */}
          <Grid item xs={12} md={3}>
            <ZetaSignalCard
              title="Immune Profile"
              icon={<IOIcon fontSize="small" />}
              status={io?.eligible ? "HOT" : "COLD"}
              color={io?.eligible ? "success" : "default"}
              evidenceLevel={profile.tumor_context?.biomarkers?.tmb ? "L2" : "L1"}
              evidenceText={io?.eligible
                ? "Immunotherapy Eligible"
                : "Low Immune Markers"}
              inputsUsed={profile.tumor_context?.biomarkers?.tmb ? "TMB • PD-L1 Verified" : "Markers Missing"}
              actionLabel="Therapy Fit"
              onAction={() => navigate('/ayesha/therapy-fit')}
            />
          </Grid>

          {/* Resistance Signal */}
          <Grid item xs={12} md={3}>
            <ZetaSignalCard
              title="Resistance"
              icon={<ResistanceIcon fontSize="small" />}
              status={resistance?.alert_triggered ? "CRITICAL" : "LOW"}
              color={resistance?.alert_triggered ? "error" : "success"}
              evidenceLevel={resistance?.ctdna_trend ? "L3" : "L2"}
              evidenceText={resistance?.alert_triggered
                ? resistance.message
                : "No Overt Resistance"}
              inputsUsed="Clinical History"
              actionLabel="Resistance Lab"
              onAction={() => navigate('/resistance-lab')}
            />
          </Grid>
        </Grid>

        {/* 2. THE PRIMARY DIRECTIVE */}
        <Typography variant="overline" fontWeight="900" color="text.secondary" letterSpacing={2} mb={1} display="block">
          SECTOR 2: PRIMARY DIRECTIVE
        </Typography>
        <Box mb={4}>
          <ZetaPrimaryDirective
            {...directive}
            onAction={() => navigate(directive.actionRoute)}
          />
        </Box>

        {/* 3. REINFORCEMENTS */}
        <Typography variant="overline" fontWeight="900" color="text.secondary" letterSpacing={2} mb={1} display="block">
          SECTOR 3: REINFORCEMENTS
        </Typography>
        <Grid container spacing={3}>
          {/* Top Trials */}
          <Grid item xs={12} md={8}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%', bgcolor: 'grey.50' }}>
              <Box display="flex" justify="space-between" mb={2}>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                  HIGHEST PROBABILITY TRIALS ({trials.length} Matches)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => navigate('/ayesha/trials-full')}
                >
                  View All →
                </Typography>
              </Box>

              {trials.length === 0 ? (
                <Alert severity="info">No matches found. Check criteria.</Alert>
              ) : (
                trials.slice(0, 3).map((trial, i) => (
                  <ZetaTrialCard
                    key={trial.nct_id || i}
                    trial={trial}
                    rank={i + 1}
                    onClick={() => navigate('/ayesha/trials-full')} // Or specific detail view
                  />
                ))
              )}

              {trials.length > 3 && (
                <Button fullWidth size="small" onClick={() => navigate('/ayesha/trials-full')}>
                  View {trials.length - 3} More Targets
                </Button>
              )}
            </Paper>
          </Grid>

          {/* Intel Gaps */}
          <Grid item xs={12} md={4}>
            <IntelGapsList
              missingTests={missingTests}
              onUpload={(test) => navigate(`/ayesha/tests?upload=${encodeURIComponent(test)}`)}
            />
          </Grid>
        </Grid>

        {/* Disclaimer Footer */}
        <Box mt={4} textAlign="center" color="text.secondary">
          <Typography variant="caption">
            ZETA PROTOCOL v3.0 • RESEARCH USE ONLY • UNAUTHORIZED ACCESS PROHIBITED
          </Typography>
        </Box>

      </Box>
    </Fade>
  );
};

export default AyeshaTrialExplorer;
