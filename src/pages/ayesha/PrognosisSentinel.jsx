import React, { useState, useEffect } from 'react';
import { Box, Grid, CircularProgress, Typography, Paper } from '@mui/material';
import SentinelDashboard from '../../components/ayesha/sentinel/SentinelDashboard';
import ScenarioSelector from '../../components/ayesha/context_center/ScenarioSelector';
import TruthTable from '../../components/ayesha/context_center/TruthTable';
import ActionDeck from '../../components/ayesha/context_center/ActionDeck';
import ContextGuide from '../../components/ayesha/context_center/ContextGuide';

const PrognosisSentinel = () => {
    const [bundle, setBundle] = useState(null);
    const [scenarios, setScenarios] = useState({ l2_scenarios: [], l3_scenarios: [] });
    const [loading, setLoading] = useState(true);

    // UI State
    const [activeLevel, setActiveLevel] = useState('L1');
    const [activeScenarioId, setActiveScenarioId] = useState(null);

    // 1. Initial Load: Scenarios & Default Bundle
    useEffect(() => {
        const init = async () => {
            try {
                // Fetch Scenarios Catalog
                const resSc = await fetch('/api/ayesha/therapy-fit/scenarios');
                const dataSc = await resSc.json();
                setScenarios(dataSc);

                // Fetch Initial Bundle (clean L1 baseline)
                await fetchBundle(null, null);
            } catch (err) {
                console.error("Initialization Failed:", err);
            }
        };
        init();
    }, []);

    // 2. Fetch Bundle on Scenario Change
    const fetchBundle = async (level, scenarioId) => {
        setLoading(true);
        try {
            // STRICT CONTRACT: Use /analyze instead of legacy bundle endpoint
            const url = new URL(`/api/ayesha/therapy-fit/analyze`);
            if (level) url.searchParams.append('level', level);
            if (scenarioId) url.searchParams.append('scenario_id', scenarioId);

            const res = await fetch(url.toString(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}) // Empty body for GET-like behavior with POST
            });

            if (!res.ok) throw new Error(`Sentinel check failed: ${res.statusText}`);

            const analyzeData = await res.json();

            // Adapter: PrognosisSentinel expects simple level objects
            setBundle(analyzeData);
        } catch (err) {
            console.error("Bundle Fetch Failed:", err);
            setBundle(null); // Clear bundle on error
        } finally {
            setLoading(false);
        }
    };

    // 3. Handler for Selector
    const handleContextSelect = (level, id) => {
        setActiveLevel(level);
        setActiveScenarioId(id);


        if (level === 'L2' && id) {
            l2Id = id;
        } else if (level === 'L3' && id) {
            // If L3 selected, assume default L2 or look up parent? 
            // For now, sticking to simplified model: L3 implies a base L2.
            // Backend handles defaults if not specified.
            l3Id = id;
        }

        fetchBundle(l2Id, l3Id);
    };

    // 4. Adapt Bundle to Legacy Dashboard Prop (Bridge)
    const getDashboardProps = () => {
        if (!bundle || !bundle.levels[activeLevel]) return null;
        const lvlData = bundle.levels[activeLevel];

        return {
            prediction: {
                confidence_cap: lvlData.completeness.confidence_cap,
                baseline_penalty_applied: false, // Not in V2 bundle yet
                prognosis: { status: 'ACTIVE' }, // Placeholder 
            },
            recommended_tests: bundle.tests_needed,
            logic_steps: [] // Provenance log placeholder
        };
    };

    if (loading && !bundle) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#0a0e14' }}>
                <CircularProgress sx={{ color: '#4fd1c5' }} />
            </Box>
        );
    }

    const currentLevelData = bundle ? bundle.levels[activeLevel] : null;

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#0a0e14', overflow: 'hidden' }}>

            {/* Header / Brand */}
            <Box sx={{ p: 2, bgcolor: '#151b24', borderBottom: '1px solid #2d3748', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800 }}>
                        <span style={{ color: '#4fd1c5' }}>AYESHA</span> CONTEXT CENTER
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#718096' }}>
                        CONTRACT: {bundle?.contract_version || "V2.0"} | PATIENT: {bundle?.patient_id}
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
