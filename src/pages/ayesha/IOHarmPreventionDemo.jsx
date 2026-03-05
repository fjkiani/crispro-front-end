/**
 * IOHarmPreventionDemo — Standalone demo of the IO Harm Prevention panel
 * Shows all three states (RULE_OUT, INDETERMINATE, JUSTIFIED) with Patient AK's data
 * 
 * Route: /io-harm-demo
 */
import React from 'react';
import { Box, Container, Typography, Divider } from '@mui/material';
import IOHarmPreventionPanel from '../../components/ayesha/IOHarmPreventionPanel';

// Simulated Patient AK biomarker data
const AK_BIOMARKERS = {
    cd8b_foxp3: { value: 2.06, percentile: 45, direction: 'neutral' },
    monocytes: { value: 0.00, percentile: 10, direction: 'favorable' },
    endothelial: { value: 2.53, percentile: 55, direction: 'favorable' },
};

const CHECKPOINT_EXPRESSION = {
    'PD-1 (PDCD1)': { value: 80, target_drug: 'pembrolizumab / nivolumab' },
    'PD-L1 (CD274)': { value: 60, target_drug: 'atezolizumab / durvalumab' },
    'CTLA-4': { value: 30, target_drug: 'ipilimumab' },
    'LAG-3': { value: 50, target_drug: 'relatlimab' },
    'TIGIT': { value: 25, target_drug: 'tiragolumab (exp.)' },
    'TIM-3 (HAVCR2)': { value: 45, target_drug: 'sabatolimab (exp.)' },
};

const SCENARIOS = [
    {
        title: 'Scenario A — Patient with LOW predicted response (RULE OUT)',
        decision: {
            decision: 'RULE_OUT',
            p_resp: 0.12,
            regimen: 'neopembrov_nactp',
            regimen_name: 'Neoadjuvant Pembrolizumab + Carboplatin (NeoPembrOV)',
            rationale:
                'p(response) = 0.120 < p_low = 0.25. Recommend against IO for this regimen. ' +
                'At this probability, 88% of patients below threshold are true non-responders. ' +
                'Sparing this patient from chemo-IO would avoid substantial toxicity without sacrificing ' +
                'likely benefit.',
            ncb_score: null,
        },
        biomarkers: {
            cd8b_foxp3: { value: 0.56, percentile: 12, direction: 'unfavorable' },
            monocytes: { value: 0.04, percentile: 65, direction: 'unfavorable' },
            endothelial: { value: 1.67, percentile: 22, direction: 'unfavorable' },
        },
        safetyGate: { active: true },
    },
    {
        title: 'Scenario B — Patient in GRAY ZONE (INDETERMINATE)',
        decision: {
            decision: 'INDETERMINATE',
            p_resp: 0.38,
            regimen: 'neopembrov_nactp',
            regimen_name: 'Neoadjuvant Pembrolizumab + Carboplatin (NeoPembrOV)',
            rationale:
                'p(response) = 0.380 is between p_low=0.25 and p_high=0.50. Indeterminate — ' +
                'consider other clinical factors: MSI status, TMB, PD-L1 IHC, prior therapies, ' +
                'and patient tolerance for toxicity. Clinical trial enrollment recommended.',
            ncb_score: null,
        },
        biomarkers: AK_BIOMARKERS,
        safetyGate: { active: true },
    },
    {
        title: 'Scenario C — Patient with HIGH predicted response (JUSTIFIED)',
        decision: {
            decision: 'JUSTIFIED',
            p_resp: 0.82,
            regimen: 'neopembrov_nactp',
            regimen_name: 'Neoadjuvant Pembrolizumab + Carboplatin (NeoPembrOV)',
            rationale:
                'p(response) = 0.820 > p_high = 0.50. IO justified for this regimen. ' +
                'This patient has strong immune signatures: high CD8B/FOXP3 ratio, elevated monocyte ' +
                'infiltration consistent with active immune engagement, and high endothelial score ' +
                'indicating vascular access for immune cells.',
            ncb_score: null,
        },
        biomarkers: {
            cd8b_foxp3: { value: 4.81, percentile: 88, direction: 'favorable' },
            monocytes: { value: 0.003, percentile: 8, direction: 'favorable' },
            endothelial: { value: 2.05, percentile: 48, direction: 'neutral' },
        },
        safetyGate: { active: true },
    },
];

export default function IOHarmPreventionDemo() {
    return (
        <Container maxWidth="lg" sx={{ py: 6, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="overline" sx={{ letterSpacing: 3, fontWeight: 800, color: '#64748b' }}>
                    RESEARCH USE ONLY
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a', mb: 1 }}>
                    IO Harm Prevention Panel
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 600, mx: 'auto' }}>
                    Three patient scenarios showing how the risk-benefit gate prevents unnecessary
                    immunotherapy toxicity in HGSOC.
                </Typography>
            </Box>

            {SCENARIOS.map((scenario, idx) => (
                <Box key={idx} sx={{ mb: 8 }}>
                    <Typography variant="h5" sx={{
                        fontWeight: 800, color: '#1e293b', mb: 3,
                        pb: 1.5, borderBottom: '2px solid #e2e8f0',
                    }}>
                        {scenario.title}
                    </Typography>
                    <IOHarmPreventionPanel
                        riskBenefitDecision={scenario.decision}
                        biomarkerDrivers={scenario.biomarkers}
                        checkpointExpression={CHECKPOINT_EXPRESSION}
                        safetyGate={scenario.safetyGate}
                    />
                </Box>
            ))}

            <Divider sx={{ my: 4 }} />

            {/* Empty state — no data available */}
            <Box sx={{ mb: 6 }}>
                <Typography variant="h5" sx={{
                    fontWeight: 800, color: '#1e293b', mb: 3,
                    pb: 1.5, borderBottom: '2px solid #e2e8f0',
                }}>
                    Scenario D — No RNA Data Yet (Empty State)
                </Typography>
                <IOHarmPreventionPanel />
            </Box>
        </Container>
    );
}
