import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Grid, CircularProgress, Typography } from '@mui/material';
import SentinelDashboard from '../../components/ayesha/sentinel/SentinelDashboard';
import ScenarioSelector from '../../components/ayesha/context_center/ScenarioSelector';
import TruthTable from '../../components/ayesha/context_center/TruthTable';
import ActionDeck from '../../components/ayesha/context_center/ActionDeck';
import ContextGuide from '../../components/ayesha/context_center/ContextGuide';
import {
    AYESHA_DEFAULT_CONTRACT_VERSION,
    buildAyeshaTherapyFitBundleUrl,
    getAyeshaTherapyFitScenariosUrl,
    mergeTherapyFitBundleWithScenarios,
} from '../../utils/ayeshaApi';

const PrognosisSentinel = () => {
    const [bundle, setBundle] = useState(null);
    const [scenarios, setScenarios] = useState({ l2_scenarios: [], l3_scenarios: [] });
    const [loading, setLoading] = useState(true);
    const lastL2IdRef = useRef(null);

    const [activeLevel, setActiveLevel] = useState('L1');
    const [activeScenarioId, setActiveScenarioId] = useState(null);

    const fetchBundle = useCallback(async ({ apiLevel = 'l1', scenarioId = null, l3ScenarioId = null }) => {
        setLoading(true);
        try {
            const [bundleRes, scRes] = await Promise.all([
                fetch(buildAyeshaTherapyFitBundleUrl({
                    level: apiLevel,
                    scenarioId,
                    l3ScenarioId,
                    includeSyntheticLethality: true,
                }), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}),
                }),
                fetch(getAyeshaTherapyFitScenariosUrl()),
            ]);

            if (!bundleRes.ok) throw new Error(`Sentinel check failed: ${bundleRes.statusText}`);

            const bundleJson = await bundleRes.json();
            let scJson = { l2_scenarios: [], l3_scenarios: [] };
            try {
                if (scRes.ok) scJson = await scRes.json();
            } catch {
                // keep defaults
            }
            setScenarios(scJson);
            setBundle(mergeTherapyFitBundleWithScenarios(bundleJson, scJson));
        } catch (err) {
            console.error('Bundle Fetch Failed:', err);
            setBundle(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBundle({ apiLevel: 'l1', scenarioId: null, l3ScenarioId: null }).catch((err) => {
            console.error('Initialization Failed:', err);
        });
    }, [fetchBundle]);

    const handleContextSelect = (levelNorm, id) => {
        setActiveLevel(levelNorm);
        setActiveScenarioId(id || null);

        if (levelNorm === 'L1') {
            lastL2IdRef.current = null;
            fetchBundle({ apiLevel: 'l1', scenarioId: null, l3ScenarioId: null });
            return;
        }
        if (levelNorm === 'L2' && id) {
            lastL2IdRef.current = id;
            fetchBundle({ apiLevel: 'l2', scenarioId: id, l3ScenarioId: null });
            return;
        }
        if (levelNorm === 'L3' && id) {
            const baseL2 =
                lastL2IdRef.current ||
                scenarios.l2_scenarios?.[0]?.id ||
                bundle?.l2_scenarios?.[0]?.id ||
                null;
            fetchBundle({ apiLevel: 'l3', scenarioId: baseL2, l3ScenarioId: id });
            return;
        }
        fetchBundle({ apiLevel: 'l1', scenarioId: null, l3ScenarioId: null });
    };

    const getDashboardProps = () => {
        const lvlData = bundle?.levels?.[activeLevel];
        if (!bundle || !lvlData) return null;

        return {
            prediction: {
                confidence_cap: lvlData.completeness?.confidence_cap,
                baseline_penalty_applied: false,
                prognosis: { status: 'ACTIVE' },
            },
            recommended_tests: bundle.tests_needed,
            logic_steps: [],
        };
    };

    if (loading && !bundle) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#0a0e14' }}>
                <CircularProgress sx={{ color: '#4fd1c5' }} />
            </Box>
        );
    }

    const currentLevelData = bundle?.levels?.[activeLevel] ?? null;

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#0a0e14', overflow: 'hidden' }}>

            {/* Header / Brand */}
            <Box sx={{ p: 2, bgcolor: '#151b24', borderBottom: '1px solid #2d3748', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800 }}>
                        <span style={{ color: '#4fd1c5' }}>AYESHA</span> CONTEXT CENTER
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#718096' }}>
                        CONTRACT: {bundle?.contract_version || AYESHA_DEFAULT_CONTRACT_VERSION} | PATIENT: {bundle?.patient_id}
                    </Typography>
                </Box>
            </Box>

            {/* MAIN 3-PANEL LAYOUT */}
            <Grid container sx={{ flex: 1, overflow: 'hidden' }}>

                {/* 1. SCENARIO SELECTOR (Left Profile) */}
                <Grid item xs={12} md={3} sx={{ borderRight: '1px solid #2d3748', p: 2, bgcolor: '#0d1117' }}>
                    <ScenarioSelector
                        scenarios={scenarios}
                        activeLevel={activeLevel}
                        activeScenarioId={activeScenarioId}
                        onSelect={handleContextSelect}
                    />
                </Grid>

                {/* 2. TRUTH TABLE (Center Details) */}
                <Grid item xs={12} md={6} sx={{ borderRight: '1px solid #2d3748', p: 3, bgcolor: '#0a0e14', overflowY: 'auto' }}>
                    <TruthTable
                        levelData={currentLevelData}
                        level={activeLevel}
                    />

                    {/* Embedded Dashboard (Legacy Visuals) */}
                    <Box sx={{ mt: 4 }}>
                        <SentinelDashboard simulationResult={getDashboardProps()} />
                    </Box>
                </Grid>

                {/* 3. ACTION DECK (Right Actions) */}
                <Grid item xs={12} md={3} sx={{ p: 2, bgcolor: '#0d1117', overflowY: 'auto' }}>
                    <ActionDeck testsNeeded={bundle?.tests_needed || []} />
                </Grid>

            </Grid>

            {/* AI GUIDE OVERLAY */}
            <ContextGuide
                levelData={currentLevelData}
                level={activeLevel}
                activeScenarioId={activeScenarioId}
                testsNeeded={bundle?.tests_needed || []}
            />
        </Box>
    );
};

export default PrognosisSentinel;
