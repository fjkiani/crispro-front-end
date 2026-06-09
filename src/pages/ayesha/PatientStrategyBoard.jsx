
import React, { useMemo, useState } from 'react';
import { Container, Grid, Box, Chip, Alert, CircularProgress, Typography, Tabs, Tab } from '@mui/material';
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
  const rssResult = activeLevelData?.rss; // { rss, rs_high, confidence, triggers } | null
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
      <Container maxWidth="xl" sx={{ py: 6, minHeight: '100vh' }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Tumor Board — Offline</Typography>
        {bundleError && <Alert severity="error" sx={{ mb: 2 }}>Bundle Error: {bundleError.message}</Alert>}
        {scenariosError && <Alert severity="warning">Scenario Error: {scenariosError.message}</Alert>}
      </Container>
    )
  }

  if (bundleLoading || scenariosLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 4 }} />
          <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 600 }}>Loading Tumor Board...</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4, px: { xs: 2, md: 4 } }}>
      <Container maxWidth="2xl">

        {/* 1. Header */}
        <BoardHeader metadata={headerMeta} isPreview={isPreview} rawBundle={bundle} title="Tumor Board" />

        {/* 2. Top Controls */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <IntelligencePanel completeness={completeness} missing={missing} />
            {/* RS classification badge — shown when backend returns rss data */}
            {rssResult?.rss != null && (
              <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={rssResult.rs_high ? 'RS-High' : 'RS-Low'}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    bgcolor: rssResult.rs_high ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)',
                    color: rssResult.rs_high ? '#f59e0b' : '#818cf8',
                    border: `1px solid ${rssResult.rs_high ? 'rgba(245,158,11,0.3)' : 'rgba(99,102,241,0.3)'}`,
                  }}
                />
                <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.65rem' }}>
                  rss={rssResult.rss?.toFixed(2)} · {rssResult.confidence}
                  {rssResult.triggers?.length > 0 && ` · ${rssResult.triggers.join(', ')}`}
                </Typography>
              </Box>
            )}
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
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              bgcolor: '#f8fafc',
              borderBottom: '1px solid',
              borderColor: 'divider',
              px: 2, pt: 1,
              '& .MuiTab-root': {
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                minHeight: 48,
                '&.Mui-selected': { color: 'primary.main' },
              },
              '& .MuiTabs-indicator': { bgcolor: 'primary.main', height: 3 },
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
                title="Treatment Rankings"
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
