import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Alert,
  Chip,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Replay,
  CheckCircle,
  Science,
  Biotech,
  Psychology
} from '@mui/icons-material';
import useAppStore from '../store';

// Import existing tool components
import { hypothesisValidatorConfig } from '../config/toolconfigs';
import ThreatAssessmentDisplay from '../components/assessment/ThreatAssessmentDisplay';
import CrisprDesignDisplay from '../components/crispr/CrisprDesignDisplay';
import TranscriptionResults from '../components/transcription/TranscriptionResults';
import ProteinSynthesisResults from '../components/protein/ProteinSynthesisResults';
import StructurePredictionResults from '../components/structure/StructurePredictionResults';
import MyelomaResponseDisplay from '../components/myeloma/MyelomaResponseDisplay';
import DemoAnalysisResults from '../components/analysis/DemoAnalysisResults';

const BIOTECH_KILL_CHAIN = [
  {
    id: 'target_acquisition',
    label: '1. Target Acquisition',
    description: 'The Billion-Dollar Question: Is This Target Worth the Risk?',
    component: 'TargetAcquisition',
    duration: 20000, // 20 seconds
    biotechNarrative: "MISSION BRIEFING: Novel PIK3CA mutation flagged by your R&D team. High-risk, high-reward oncogene target. Before you commit $200M and 5 years to this target, we answer the billion-dollar question in 5 minutes.",
    savings: 0,
    demoData: {
      gene: 'PIK3CA',
      variant: 'E542K',
      target_class: 'Kinase - PI3K Pathway',
      therapeutic_area: 'Solid Tumors (Breast, Colorectal)',
      current_pipeline_status: 'Uncharacterized - Requires Validation',
      mutation_type: 'Missense - Helical Domain',
      clinical_significance: 'Unknown - VUS'
    }
  },
  {
    id: 'intelligence_gathering',
    label: '2. Target Validation',
    description: 'Go/No-Go Verdict: Zeta Oracle Eliminates Guesswork',
    component: 'IntelligenceGathering',
    duration: 30000, // 30 seconds
    biotechNarrative: "🎯 ZETA ORACLE DEPLOYED. Executing triumvirate threat assessment... VERDICT: PATHOGENIC. Kinase activity increased 340%. Oncogenic transformation confirmed. This is not a maybe - this is mathematical certainty. TARGET VALIDATED. Mission is GO.",
    savings: 50000000, // $50M in target validation
    demoData: {
      zeta_score: -18750.4,
      confidence: 96.8,
      functional_impact: 'Hyperactivation of PI3K/AKT pathway',
      target_validation: 'CONFIRMED HIGH-VALUE ONCOGENE',
      mechanism: 'Gain-of-function via helical domain disruption',
      kinase_activity: '+340% vs wild-type',
      oncogenic_potential: 'HIGH'
    }
  },
  {
    id: 'vulnerability_assessment',
    label: '3. Vulnerability Mapping',
    description: 'Identifying Therapeutic Attack Vectors',
    component: 'VulnerabilityAssessment',
    duration: 25000, // 25 seconds
    biotechNarrative: "🔍 VULNERABILITY SCAN COMPLETE. Target lock achieved. Critical attack vectors identified: ATP binding pocket, allosteric sites, protein degradation pathways. Multiple therapeutic modalities confirmed viable.",
    savings: 75000000, // Additional $25M in lead identification
    demoData: {
      therapeutic_modalities: ['Small Molecule Inhibitor', 'PROTAC Degrader', 'siRNA', 'Allosteric Modulator'],
      druggable_pockets: 4,
      intervention_confidence: 91.7,
      resistance_probability: 'Low (8%)',
      clinical_feasibility: 'High - Multiple FDA precedents',
      competitor_landscape: 'BYL719 (Alpelisib) - market validated'
    }
  },
  {
    id: 'weapon_forging',
    label: '4. Weapon Forging',
    description: 'In Silico Therapeutic Factory - Designing the Arsenal',
    component: 'WeaponForging',
    duration: 60000, // 60 seconds
    biotechNarrative: "⚔️ ZETA FORGE UNLEASHED. Designing therapeutic arsenal... Small molecule inhibitors optimized. PROTAC degrader engineered. siRNA sequences validated. Novel allosteric modulators designed. Complete modality coverage achieved.",
    savings: 150000000, // Additional $75M in lead optimization
    demoData: {
      small_molecule_leads: 5,
      protac_candidates: 2,
      sirna_sequences: 3,
      allosteric_modulators: 2,
      selectivity_ratio: '>100x vs PI3Kβ/γ/δ',
      ip_landscape: 'Freedom to operate confirmed',
      total_candidates: 12
    }
  },
  {
    id: 'structural_validation',
    label: '5. Structural Validation',
    description: 'The Gauntlet - Ensuring Therapeutic Viability',
    component: 'StructuralValidation',
    duration: 45000, // 45 seconds
    biotechNarrative: "🧬 STRUCTURAL GAUNTLET INITIATED. AlphaFold 3 predictions... Binding modes validated. ADMET properties predicted. Safety windows mapped. Lead candidates survive the gauntlet with flying colors.",
    savings: 200000000, // Additional $50M in preclinical validation
    demoData: {
      binding_affinity: 'IC50: 15 nM (wild-type: >10,000 nM)',
      selectivity_window: 'Excellent (>100x)',
      admet_score: 8.4,
      blood_brain_barrier: 'Permeable',
      metabolic_stability: 'High (T1/2 > 6h)',
      toxicity_prediction: 'Low risk'
    }
  },
  {
    id: 'lethality_assessment',
    label: '6. Efficacy Prediction',
    description: 'Clinical Success Probability Calculation',
    component: 'LethalityAssessment',
    duration: 30000, // 30 seconds
    biotechNarrative: "🎯 ASSASSIN SCORE CALCULATION. Fusing all intelligence: Target validation + Structural integrity + ADMET profile + Safety data... COMPOSITE LETHALITY: 92.7%. Clinical success probability: 87%. This beats industry average by 5X.",
    savings: 300000000, // Additional $100M in clinical failure avoidance
    demoData: {
      assassin_score: 92.7,
      clinical_success_probability: 87,
      efficacy_prediction: 'High (tumor regression >70%)',
      safety_prediction: 'Excellent (therapeutic window >50x)',
      market_potential: '$3.2B peak sales (breast cancer alone)',
      development_timeline: '3.8 years vs 12 years traditional'
    }
  },
  {
    id: 'battle_plan_delivery',
    label: '7. De-Risked Asset Delivery',
    description: 'Therapeutic Blueprint - Mission Complete',
    component: 'BattlePlanDelivery',
    duration: 30000, // 30 seconds
    biotechNarrative: "✅ MISSION COMPLETE. Delivering validated therapeutic blueprint... 12 candidates ranked by clinical potential. Development roadmap generated. Regulatory pathway optimized. You now possess what no biotech has ever had: a completely de-risked, validated therapeutic program.",
    savings: 350000000, // Total clinical trial failure avoidance
    demoData: {
      total_candidates: 12,
      top_candidate: 'Selective PI3Kα Inhibitor (CRP-PIK-001)',
      development_cost: '$65M vs $2.6B traditional',
      timeline_compression: '75% reduction',
      regulatory_strategy: 'Fast Track + Breakthrough Therapy',
      next_steps: 'IND-enabling studies ready',
      asset_value: 'Validated $800M+ program'
    }
  }
];

const RunxConquest = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [completedStages, setCompletedStages] = useState([]);
  const [stageResults, setStageResults] = useState({});
  const [progress, setProgress] = useState(0);
  const [narratorText, setNarratorText] = useState('Ready to validate PIK3CA E542K as a therapeutic target...');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);

  // Zustand store for cross-stage data
  const { activeMutation, setActiveMutation } = useAppStore();

  // Initialize PIK3CA mutation data for biotech demo
  useEffect(() => {
    setActiveMutation({
      gene: 'PIK3CA',
      variant: 'E542K',
      patient_id: 'TARGET-PIK3CA-E542K',
      genomic_coordinate: 'chr3:178936091G>A',
      timestamp: Date.now(),
      mutation_type: 'Missense',
      protein_change: 'p.Glu542Lys',
      clinical_significance: 'VUS - Requires Validation'
    });
  }, [setActiveMutation]);

  // Biotech kill chain progression timer
  useEffect(() => {
    let timer;
    if (isRunning && !isPaused && currentStage < BIOTECH_KILL_CHAIN.length) {
      const stage = BIOTECH_KILL_CHAIN[currentStage];
      const startTime = Date.now();
      
      timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const stageProgress = Math.min((elapsed / stage.duration) * 100, 100);
        setProgress(stageProgress);
        setElapsedTime(prev => prev + 100);

        // Update biotech narrator text
        if (stageProgress < 25) {
          setNarratorText(`🎯 ${stage.biotechNarrative}`);
        } else if (stageProgress < 50) {
          setNarratorText(`⚡ ${stage.label} in progress... Eliminating clinical trial risk...`);
        } else if (stageProgress < 75) {
          setNarratorText(`🔥 ${stage.label} processing... Converting uncertainty to validated assets...`);
        } else if (stageProgress < 100) {
          setNarratorText(`✨ ${stage.label} completing... Savings: $${(stage.savings / 1000000).toFixed(0)}M...`);
        }

        if (stageProgress >= 100) {
          // Stage complete - advance to next
          setCompletedStages(prev => [...prev, currentStage]);
          setStageResults(prev => ({
            ...prev,
            [stage.id]: stage.demoData
          }));
          setTotalSavings(stage.savings);
          
          if (currentStage < BIOTECH_KILL_CHAIN.length - 1) {
            setCurrentStage(prev => prev + 1);
            setProgress(0);
            setNarratorText(`💰 ${stage.label} COMPLETE! $${(stage.savings / 1000000).toFixed(0)}M in failures avoided. Advancing...`);
          } else {
            // Kill chain complete!
            setIsRunning(false);
            setNarratorText('🎯 VALIDATION CAMPAIGN COMPLETE! PIK3CA E542K therapeutic blueprint delivered - $800M+ validated program ready for IND!');
          }
        }
      }, 100);
    }

    return () => clearInterval(timer);
  }, [isRunning, isPaused, currentStage]);

  const startKillChain = () => {
    setIsRunning(true);
    setIsPaused(false);
    setCurrentStage(0);
    setCompletedStages([]);
    setStageResults({});
    setProgress(0);
    setElapsedTime(0);
    setTotalSavings(0);
    setNarratorText('🚀 Good morning. The reason 98% of clinical trials fail is because the war is lost before the first battle. We will replace that multi-million dollar gamble with mathematical certainty. Let\'s validate PIK3CA E542K...');
  };

  const pauseKillChain = () => {
    setIsPaused(!isPaused);
    setNarratorText(isPaused ? '▶️ Resuming validation campaign...' : '⏸️ Campaign paused');
  };

  const resetKillChain = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStage(0);
    setCompletedStages([]);
    setStageResults({});
    setProgress(0);
    setElapsedTime(0);
    setTotalSavings(0);
    setNarratorText('Ready to validate PIK3CA E542K as a therapeutic target...');
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderStageComponent = (stage, data) => {
    switch (stage.component) {
      case 'TargetAcquisition':
        return (
          <Card sx={{ mb: 2, border: '2px solid #1976d2' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                🎯 Target Acquired: PIK3CA E542K
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">Gene: <strong>{stage.demoData.gene}</strong></Typography>
                  <Typography variant="body2">Variant: <strong>{stage.demoData.variant}</strong></Typography>
                  <Typography variant="body2">Target Class: <strong>{stage.demoData.target_class}</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Therapeutic Area: <strong>{stage.demoData.therapeutic_area}</strong></Typography>
                  <Typography variant="body2">Status: <strong>{stage.demoData.current_pipeline_status}</strong></Typography>
                  <Typography variant="body2">Mutation Type: <strong>{stage.demoData.mutation_type}</strong></Typography>
                </Grid>
              </Grid>
              <Alert severity="warning" sx={{ mt: 2 }}>
                <strong>R&D Question:</strong> Is PIK3CA E542K worth a $200M investment? Let's find out...
              </Alert>
            </CardContent>
          </Card>
        );

      case 'IntelligenceGathering':
        return (
          <Card sx={{ mb: 2, border: '2px solid #f44336' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error">
                🔍 ZETA ORACLE VERDICT: PATHOGENIC
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">Zeta Score: <strong style={{color: '#f44336'}}>{stage.demoData.zeta_score}</strong></Typography>
                  <Typography variant="body2">Confidence: <strong>{stage.demoData.confidence}%</strong></Typography>
                  <Typography variant="body2">Kinase Activity: <strong>{stage.demoData.kinase_activity}</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Functional Impact: <strong>{stage.demoData.functional_impact}</strong></Typography>
                  <Typography variant="body2">Mechanism: <strong>{stage.demoData.mechanism}</strong></Typography>
                  <Typography variant="body2">Oncogenic Potential: <strong>{stage.demoData.oncogenic_potential}</strong></Typography>
                </Grid>
              </Grid>
              <Alert severity="error" sx={{ mt: 2 }}>
                <strong>VERDICT:</strong> {stage.demoData.target_validation} - Mission is GO!
              </Alert>
            </CardContent>
          </Card>
        );

      case 'VulnerabilityAssessment':
        return (
          <Card sx={{ mb: 2, border: '2px solid #ff9800' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="warning.main">
                🎯 Vulnerability Mapping Complete
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">Druggable Pockets: <strong>{stage.demoData.druggable_pockets}</strong></Typography>
                  <Typography variant="body2">Intervention Confidence: <strong>{stage.demoData.intervention_confidence}%</strong></Typography>
                  <Typography variant="body2">Resistance Risk: <strong>{stage.demoData.resistance_probability}</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Clinical Feasibility: <strong>{stage.demoData.clinical_feasibility}</strong></Typography>
                  <Typography variant="body2">Competitor Landscape: <strong>{stage.demoData.competitor_landscape}</strong></Typography>
                </Grid>
              </Grid>
              <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>
                Therapeutic Modalities Identified:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                {stage.demoData.therapeutic_modalities.map((modality, index) => (
                  <Chip key={index} label={modality} color="warning" size="small" />
                ))}
              </Box>
            </CardContent>
          </Card>
        );

      case 'WeaponForging':
        return (
          <Card sx={{ mb: 2, border: '2px solid #9c27b0' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="secondary">
                ⚔️ Therapeutic Arsenal Forged
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">Small Molecules: <strong>{stage.demoData.small_molecule_leads}</strong></Typography>
                  <Typography variant="body2">PROTAC Degraders: <strong>{stage.demoData.protac_candidates}</strong></Typography>
                  <Typography variant="body2">siRNA Sequences: <strong>{stage.demoData.sirna_sequences}</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Allosteric Modulators: <strong>{stage.demoData.allosteric_modulators}</strong></Typography>
                  <Typography variant="body2">Total Candidates: <strong>{stage.demoData.total_candidates}</strong></Typography>
                  <Typography variant="body2">Selectivity: <strong>{stage.demoData.selectivity_ratio}</strong></Typography>
                </Grid>
              </Grid>
              <Alert severity="success" sx={{ mt: 2 }}>
                <strong>IP Status:</strong> {stage.demoData.ip_landscape}
              </Alert>
            </CardContent>
          </Card>
        );

      case 'StructuralValidation':
        return (
          <Card sx={{ mb: 2, border: '2px solid #4caf50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="success.main">
                🧬 Structural Gauntlet Results
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">Binding Affinity: <strong>{stage.demoData.binding_affinity}</strong></Typography>
                  <Typography variant="body2">ADMET Score: <strong>{stage.demoData.admet_score}/10</strong></Typography>
                  <Typography variant="body2">BBB Permeability: <strong>{stage.demoData.blood_brain_barrier}</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Selectivity Window: <strong>{stage.demoData.selectivity_window}</strong></Typography>
                  <Typography variant="body2">Metabolic Stability: <strong>{stage.demoData.metabolic_stability}</strong></Typography>
                  <Typography variant="body2">Toxicity Risk: <strong>{stage.demoData.toxicity_prediction}</strong></Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 'LethalityAssessment':
        return (
          <Card sx={{ mb: 2, border: '2px solid #673ab7' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="secondary">
                📊 Clinical Success Prediction
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">Assassin Score: <strong style={{color: '#673ab7'}}>{stage.demoData.assassin_score}%</strong></Typography>
                  <Typography variant="body2">Success Probability: <strong>{stage.demoData.clinical_success_probability}%</strong></Typography>
                  <Typography variant="body2">Timeline: <strong>{stage.demoData.development_timeline}</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Efficacy: <strong>{stage.demoData.efficacy_prediction}</strong></Typography>
                  <Typography variant="body2">Safety: <strong>{stage.demoData.safety_prediction}</strong></Typography>
                  <Typography variant="body2">Market Potential: <strong>{stage.demoData.market_potential}</strong></Typography>
                </Grid>
              </Grid>
              <Alert severity="info" sx={{ mt: 2 }}>
                <strong>87% success rate beats industry average by 5X!</strong>
              </Alert>
            </CardContent>
          </Card>
        );

      case 'BattlePlanDelivery':
        return (
          <Card sx={{ mb: 2, border: '2px solid #2e7d32' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="success.main">
                🎯 Therapeutic Blueprint Delivered
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">Total Candidates: <strong>{stage.demoData.total_candidates}</strong></Typography>
                  <Typography variant="body2">Top Candidate: <strong>{stage.demoData.top_candidate}</strong></Typography>
                  <Typography variant="body2">Development Cost: <strong>{stage.demoData.development_cost}</strong></Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Timeline Compression: <strong>{stage.demoData.timeline_compression}</strong></Typography>
                  <Typography variant="body2">Regulatory Strategy: <strong>{stage.demoData.regulatory_strategy}</strong></Typography>
                  <Typography variant="body2">Asset Value: <strong>{stage.demoData.asset_value}</strong></Typography>
                </Grid>
              </Grid>
              <Alert severity="success" sx={{ mt: 2 }}>
                <strong>MISSION COMPLETE:</strong> {stage.demoData.next_steps}
              </Alert>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Alert severity="info">
            Stage {stage.label} component in development
          </Alert>
        );
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h3" gutterBottom align="center">
            🧬 CrisPRO.ai: R&D De-Risking Platform
          </Typography>
          <Typography variant="h6" align="center" sx={{ opacity: 0.9 }}>
            Live Demo: PIK3CA E542K Target Validation & Lead Generation
          </Typography>
          <Typography variant="body1" align="center" sx={{ mt: 2, opacity: 0.8 }}>
            From Uncertain Target → Validated $800M+ Therapeutic Asset in 5 minutes
          </Typography>
          <Typography variant="body2" align="center" sx={{ mt: 1, opacity: 0.7 }}>
            Eliminate $350M in clinical trial failures • 75% timeline compression • 87% success probability
          </Typography>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrow />}
                  onClick={startKillChain}
                  disabled={isRunning && !isPaused}
                  sx={{ fontWeight: 'bold' }}
                >
                  🚀 Begin Validation Campaign
                </Button>
                <Button
                  variant="outlined"
                  startIcon={isPaused ? <PlayArrow /> : <Pause />}
                  onClick={pauseKillChain}
                  disabled={!isRunning}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Replay />}
                  onClick={resetKillChain}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6">
                  Time Elapsed: {formatTime(elapsedTime)}
                </Typography>
                <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                  Clinical Trial Failures Avoided: ${(totalSavings / 1000000).toFixed(0)}M
                </Typography>
                <Chip 
                  icon={<Science />}
                  label={`Stage ${currentStage + 1} of ${BIOTECH_KILL_CHAIN.length}`}
                  color="primary"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Live Narrator */}
      <Card sx={{ mb: 3, border: '2px solid #ff9800' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🤖 AI Narrator
          </Typography>
          <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#ff9800' }}>
            {narratorText}
          </Typography>
          {isRunning && (
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ mt: 2, height: 8, borderRadius: 4 }}
            />
          )}
        </CardContent>
      </Card>

      {/* Pipeline Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={currentStage} alternativeLabel>
            {BIOTECH_KILL_CHAIN.map((stage, index) => (
              <Step key={stage.id} completed={completedStages.includes(index)}>
                <StepLabel
                  StepIconComponent={({ active, completed }) => (
                    completed ? (
                      <CheckCircle color="success" />
                    ) : active ? (
                      <Science color="error" />
                    ) : (
                      <Biotech color="disabled" />
                    )
                  )}
                >
                  {stage.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Current Stage Display */}
      {isRunning && (
        <Card sx={{ mb: 3, border: '2px solid #d32f2f' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom color="error.main">
              {BIOTECH_KILL_CHAIN[currentStage]?.label}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {BIOTECH_KILL_CHAIN[currentStage]?.description}
            </Typography>
            <Alert severity="warning" sx={{ my: 2 }}>
              <strong>Biotech Impact:</strong> {BIOTECH_KILL_CHAIN[currentStage]?.biotechNarrative}
            </Alert>
            <Divider sx={{ my: 2 }} />
            {renderStageComponent(
              BIOTECH_KILL_CHAIN[currentStage],
              stageResults[BIOTECH_KILL_CHAIN[currentStage]?.id]
            )}
          </CardContent>
        </Card>
      )}

      {/* Completed Stages Results */}
      {completedStages.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              🏆 Conquest Results
            </Typography>
            {completedStages.map(stageIndex => {
              const stage = BIOTECH_KILL_CHAIN[stageIndex];
              const results = stageResults[stage.id];
              return (
                <Box key={stage.id} sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom color="success.main">
                    ✅ {stage.label} - ${(stage.savings / 1000000).toFixed(0)}M Saved
                  </Typography>
                  {renderStageComponent(stage, results)}
                </Box>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Victory Celebration */}
      {completedStages.length === BIOTECH_KILL_CHAIN.length && (
        <Card sx={{ mt: 3, background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)', color: 'white' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom>
              🎯 VALIDATION CAMPAIGN COMPLETE! 🎯
            </Typography>
            <Typography variant="h5" gutterBottom>
              Total R&D Savings: $350M | Success Probability: 87% | Timeline: 75% Reduced
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>DE-RISKED THERAPEUTIC ASSET DELIVERED:</strong> Validated $800M+ PIK3CA program ready for IND
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              PIK3CA E542K: From uncertain VUS to validated therapeutic target with 12 lead candidates in 5 minutes.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default RunxConquest; 