
import React, { useMemo, useState } from 'react';
import { Container, Grid, Box, Alert, CircularProgress, Typography, Tabs, Tab } from '@mui/material';
import { useTumorBoardBundle } from '../../hooks/useTumorBoardBundle';
import { useAyeshaScenarios } from '../../hooks/useAyeshaTherapyFitBundle';
import DrugRankingPanel from '../../components/ayesha/DrugRankingPanel';

// Tumor Board Components
import BoardHeader from '../../components/ayesha/tumor-board/BoardHeader';
import IntelligencePanel from '../../components/ayesha/tumor-board/IntelligencePanel';
import SimulationControl from '../../components/ayesha/tumor-board/SimulationControl';
import OpportunityPanel from '../../components/ayesha/tumor-board/OpportunityPanel';
import EvidenceVault from '../../components/ayesha/tumor-board/EvidenceVault';

function safeArray(v) { return Array.isArray(v) ? v : []; }
function safeObj(v) { return v && typeof v === 'object' ? v : {}; }

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PatientStrategyBoard() {
  // State Management
  const [level, setLevel] = useState('l1');
  const [scenarioId, setScenarioId] = useState(null);
  const [l3ScenarioId, setL3ScenarioId] = useState(null);
  const [efficacyMode] = useState('comprehensive');
  const [activeTab, setActiveTab] = useState(0);

  // Data Fetching
  const { data: scenariosData, isLoading: scenariosLoading, error: scenariosError } = useAyeshaScenarios();
  const { data: bundle, isLoading: bundleLoading, error: bundleError } = useTumorBoardBundle({
    level,
    scenarioId,
    l3ScenarioId,
    includeSyntheticLethality: true,
    efficacyMode,
  });

  // Data Transformation
  const levelsObj = safeObj(bundle?.levels);
  const activeKey = String(level || 'l1').toUpperCase();
  const activeLevelData = safeObj(levelsObj?.[activeKey]);

  const completeness = safeObj(activeLevelData?.completeness);
  const missing = safeArray(completeness?.missing);
  const drugs = safeArray(activeLevelData?.efficacy?.drugs);
  const slPayload = activeLevelData?.synthetic_lethality;
  const resistanceGate = activeLevelData?.resistance_gate;
  const testsNeeded = useMemo(() => safeArray(bundle?.tests_needed), [bundle]);
  const isPreview = Boolean(activeLevelData?.is_preview);

  const l2Scenarios = useMemo(() => safeArray(scenariosData?.l2_scenarios), [scenariosData]);
  const l3Scenarios = useMemo(() => safeArray(scenariosData?.l3_scenarios), [scenariosData]);

  const headerMeta = useMemo(() => ({
    patient_id: bundle?.patient_id || '—',
    contract_version: bundle?.contract_version || bundle?.contractVersion || '—',
    generated_at: bundle?.generated_at || bundle?.generatedAt,
    requested_levels: safeArray(bundle?.requested_levels),
    run_id: activeLevelData?.efficacy?.provenance?.run_id,
    efficacy_mode: efficacyMode,
  }), [bundle, activeLevelData, efficacyMode]);

  // Handlers
  const handleSelectL1 = () => { setLevel('l1'); setScenarioId(null); setL3ScenarioId(null); };
  const handleRunL2 = (sid) => { setLevel('l2'); setScenarioId(sid); setL3ScenarioId(null); };
  const handleRunL3 = (l2BaseId, l3Id) => { setLevel('l3'); setScenarioId(l2BaseId); setL3ScenarioId(l3Id); };

  if (bundleError || scenariosError) {
    return (
      <Container maxWidth="xl" sx={{ py: 6, bgcolor: '#020617', minHeight: '100vh', color: 'white' }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Strategy System Offline</Typography>
        {bundleError && <Alert severity="error" sx={{ mb: 2 }}>Bundle Error: {bundleError.message}</Alert>}
        {scenariosError && <Alert severity="warning">Scenario Error: {scenariosError.message}</Alert>}
      </Container>
    )
  }

  if (bundleLoading || scenariosLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6, bgcolor: '#020617', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#6366f1', mb: 4 }} />
          <Typography variant="h5" sx={{ color: '#94a3b8', fontWeight: 600 }}>Loading Strategic Intel...</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Box sx={{ bgcolor: '#020617', minHeight: '100vh', py: 4, px: { xs: 2, md: 4 } }}>
      <Container maxWidth="2xl">

        {/* 1. Header */}
        <BoardHeader metadata={headerMeta} isPreview={isPreview} rawBundle={bundle} title="Zeta Strategy Board" />

        {/* 2. Top Controls */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <IntelligencePanel completeness={completeness} missing={missing} />
          </Grid>
          <Grid item xs={12} md={6}>
            <SimulationControl
              level={level}
              onSelectL1={handleSelectL1}
              onSelectL2={handleRunL2}
              onSelectL3={handleRunL3}
              scenarioId={scenarioId}
              l3ScenarioId={l3ScenarioId}
            />
          </Grid>
        </Grid>

        {/* 3. Tabbed Content */}
        <Box sx={{
          bgcolor: '#0f172a',
          borderRadius: 3,
          border: '1px solid #1e293b',
          overflow: 'hidden',
        }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              bgcolor: '#0f172a',
              borderBottom: '1px solid #1e293b',
              px: 2, pt: 1,
              '& .MuiTab-root': {
                color: '#64748b',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.95rem',
                minHeight: 48,
                '&.Mui-selected': { color: '#c7d2fe' },
              },
              '& .MuiTabs-indicator': { bgcolor: '#6366f1', height: 3 },
            }}
          >
            <Tab label={`Strategy (${drugs.length} drugs)`} />
            <Tab label="Opportunity" />
            <Tab label="Evidence" />
          </Tabs>

          {/* Tab 1: Strategy — Drug Rankings */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ px: 2, pb: 3 }}>
              <DrugRankingPanel
                drugs={drugs}
                context={{
                  level: activeKey,
                  scenario: level !== 'l1' ? `${scenarioId || '—'}${l3ScenarioId ? `/${l3ScenarioId}` : ''}` : 'Baseline',
                  inputs: activeLevelData?.inputs_used,
                  provenance: activeLevelData?.efficacy?.provenance,
                }}
                title="ARSENAL (DRUG RANKING)"
              />
            </Box>
          </TabPanel>

          {/* Tab 2: Opportunity — SL + Resistance + Tests */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ px: 2, pb: 3 }}>
              <OpportunityPanel
                slPayload={slPayload}
                resistanceGate={resistanceGate}
                levelKey={activeKey}
                testsNeeded={testsNeeded}
                missing={missing}
              />
            </Box>
          </TabPanel>

          {/* Tab 3: Evidence — Inputs, Scenarios, Provenance */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ px: 2, pb: 3 }}>
              <EvidenceVault
                levelData={activeLevelData}
                activeKey={activeKey}
                level={level}
                drugsCount={drugs.length}
                l2Scenarios={l2Scenarios}
                l3Scenarios={l3Scenarios}
                onRunL2={handleRunL2}
                onRunL3={handleRunL3}
                isPreview={isPreview}
                rawBundle={bundle}
              />
            </Box>
          </TabPanel>
        </Box>

      </Container>
    </Box>
  );
}
