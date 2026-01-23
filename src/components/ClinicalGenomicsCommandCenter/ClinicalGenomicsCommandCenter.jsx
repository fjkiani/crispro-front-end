/**
 * ⚔️ CLINICAL GENOMICS COMMAND CENTER ⚔️
 * 
 * Unified platform for clinical genomics capabilities:
 * - Variant Interpretation (ACMG, PharmGKB)
 * - Treatment Planning (Resistance, NCCN)
 * - Clinical Trials Matching
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  Button,
  Alert,
  Paper
} from '@mui/material';
import { Biotech, LocalHospital, Science, Analytics } from '@mui/icons-material';

// Context
import { ClinicalGenomicsProvider, useClinicalGenomicsContext } from './context/ClinicalGenomicsContext';

// Inputs
import VariantInput from './inputs/VariantInput';
import PatientProfile from './inputs/PatientProfile';

// Hooks
import { useACMG } from './hooks/useACMG';
import { usePharmGKB } from './hooks/usePharmGKB';
import { useClinicalTrials } from './hooks/useClinicalTrials';
import { useResistance } from './hooks/useResistance';
import { useNCCN } from './hooks/useNCCN';

// Cards
import { ACMGCard } from './cards/ACMGCard';
import { PharmGKBCard } from './cards/PharmGKBCard';
import { ResistanceCard } from './cards/ResistanceCard';
import { NCCNCard } from './cards/NCCNCard';
import { TrialsListCard } from './cards/TrialsListCard';

// Tabs
import { MechanisticEvidenceTab } from './tabs/MechanisticEvidenceTab';

// Utils
import { generateRunId } from './utils/genomicsUtils';

// CoPilot Integration
import { 
  useClinicalGenomicsCoPilot, 
  ClinicalGenomicsQuickActions,
  ClinicalGenomicsSuggestedQuestions 
} from './integrations/ClinicalGenomicsCoPilotIntegration';

const ClinicalGenomicsContent = () => {
  const { variant, patientProfile, activeTab, setActiveTab, updateProvenance } = useClinicalGenomicsContext();
  
  // Hooks
  const acmg = useACMG();
  const pharmgkb = usePharmGKB();
  const trials = useClinicalTrials();
  const resistance = useResistance();
  const nccn = useNCCN();

  const [analyzing, setAnalyzing] = useState(false);

  // CoPilot Integration
  const copilot = useClinicalGenomicsCoPilot();

  const handleAnalyzeVariant = async (variant) => {
    setAnalyzing(true);
    const runId = generateRunId();
    updateProvenance({ run_id: runId, timestamp: new Date().toISOString() });

    try {
      // ACMG Classification (always run)
      await acmg.classify(variant);

      // PharmGKB if we have diplotype info
      if (variant.gene === 'CYP2D6' || variant.gene === 'CYP2C19') {
        // Stub: would need diplotype from variant
      }

      // Trials if we have cancer type
      if (patientProfile.cancer_type) {
        const mutations = [{ gene: variant.gene, hgvs_p: variant.hgvs_p }];
        await trials.matchTrials(mutations, patientProfile.cancer_type);
      }

      // Switch to Interpretation tab to show results
      setActiveTab(0);

    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzeResistance = async (drugClass) => {
    if (!variant.gene) return;
    
    const mutations = [{
      gene: variant.gene,
      hgvs_p: variant.hgvs_p,
      consequence: variant.consequence
    }];

    await resistance.predictResistance(drugClass, mutations);
  };

  const handleCheckGuideline = async (therapy) => {
    if (!patientProfile.cancer_type) return;
    
    const mutations = [{
      gene: variant.gene,
      hgvs_p: variant.hgvs_p
    }];

    await nccn.checkGuideline(patientProfile.cancer_type, therapy, mutations);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ⚔️ Clinical Genomics Command Center
        </Typography>
        <Typography variant="body1" color="text.secondary">
          AI-powered clinical genomics analysis for precision medicine
        </Typography>
      </Box>

      {/* Inputs */}
      <VariantInput onSubmit={handleAnalyzeVariant} />
      <PatientProfile />

      {/* CoPilot Quick Actions */}
      <ClinicalGenomicsQuickActions />

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<Biotech />} label="Variant Interpretation" />
          <Tab icon={<LocalHospital />} label="Treatment Planning" />
          <Tab icon={<Science />} label="Clinical Trials" />
          <Tab icon={<Analytics />} label="Mechanistic Evidence" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>🧬 Variant Interpretation</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ACMGCard result={acmg.result} loading={acmg.loading} error={acmg.error} />
            <PharmGKBCard result={pharmgkb.result} loading={pharmgkb.loading} error={pharmgkb.error} />
            
            {/* CoPilot Suggested Questions */}
            <ClinicalGenomicsSuggestedQuestions />
          </Box>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>💊 Treatment Planning</Typography>
          
          {/* Quick Actions */}
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleAnalyzeResistance('proteasome_inhibitor')}
              disabled={!variant.gene}
            >
              Check Proteasome Inhibitor Resistance
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleCheckGuideline('trastuzumab deruxtecan')}
              disabled={!patientProfile.cancer_type}
            >
              Check NCCN Guidelines (T-DXd)
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ResistanceCard result={resistance.result} loading={resistance.loading} error={resistance.error} />
            <NCCNCard result={nccn.result} loading={nccn.loading} error={nccn.error} />
          </Box>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>🔬 Clinical Trials</Typography>
          {!patientProfile.cancer_type && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Please set cancer type in Patient Profile to match clinical trials
            </Alert>
          )}
          <TrialsListCard result={trials.result} loading={trials.loading} error={trials.error} />
        </Box>
      )}

      {activeTab === 3 && (
        <MechanisticEvidenceTab />
      )}

      {/* Research Use Disclaimer */}
      <Alert severity="warning" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>RESEARCH USE ONLY</strong> - Not for clinical diagnosis or treatment decisions. 
          All analyses must be reviewed by qualified healthcare professionals.
        </Typography>
      </Alert>
    </Container>
  );
};

export const ClinicalGenomicsCommandCenter = () => {
  return (
    <ClinicalGenomicsProvider>
      <ClinicalGenomicsContent />
    </ClinicalGenomicsProvider>
  );
};

export default ClinicalGenomicsCommandCenter;

