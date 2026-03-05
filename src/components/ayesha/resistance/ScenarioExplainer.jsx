/**
 * ScenarioExplainer
 *
 * Patient-facing plain-language explanation of the 4 PARP sensitivity scenarios.
 * Appears in TumorSettingsPanel to help patients understand what they're adjusting.
 */
import React, { useState } from 'react';
import {
    Box,
    Typography,
    Chip,
    Collapse,
    ButtonBase,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

const SCENARIOS = [
    {
        code: 'A_HIGH',
        label: 'Classical Synthetic Lethality',
        score: '0.95',
        color: '#2e7d32',
        chip: 'success',
        conditions: 'BRCA1 or BRCA2 mutation + HRD score ≥ 42',
        plain: (
            <>
                Your tumor carries a BRCA mutation <em>and</em> shows high genomic scarring (HRD-high).
                This means the tumor cannot repair its own DNA — it depends entirely on PARP1/2 for survival.
                Blocking PARP causes the tumor to collapse. <strong>Best case for PARP inhibitor.</strong>
            </>
        ),
    },
    {
        code: 'C_PHENOCOPY',
        label: 'BRCAness Phenocopy',
        score: '0.75',
        color: '#f57c00',
        chip: 'warning',
        conditions: 'No BRCA mutation + HRD score ≥ 42',
        plain: (
            <>
                No inherited BRCA mutation — but the tumor's DNA repair system is still broken (HRD-high).
                This can happen via epigenetic silencing or other DDR defects. The tumor behaves like a
                BRCA tumor. <strong>Often responds to PARP inhibitors.</strong>
            </>
        ),
    },
    {
        code: 'B_LOW',
        label: 'Reversion Risk',
        score: '0.35',
        color: '#e65100',
        chip: 'warning',
        conditions: 'BRCA mutation + HRD score < 42',
        plain: (
            <>
                BRCA mutation is present but HRD score is low, suggesting the tumor may have developed
                a workaround — a "reversion" mutation that partially restores DNA repair. PARP inhibitors
                may not work as well. <strong>Clinical trial or platinum re-challenge may be better.</strong>
            </>
        ),
    },
    {
        code: 'D_RESISTANT',
        label: 'HR-Proficient — Likely Resistant',
        score: '0.05',
        color: '#c62828',
        chip: 'error',
        conditions: 'No BRCA mutation + HRD score < 42',
        plain: (
            <>
                No BRCA mutation and low HRD score — the tumor's DNA repair system is likely intact.
                PARP inhibitors have no mechanism to exploit. <strong>Alternative strategies (platinum,
                    immunotherapy, ADC) should be prioritized.</strong>
            </>
        ),
    },
];

const ScenarioRow = ({ scenario }) => {
    const [open, setOpen] = useState(false);

    return (
        <Box sx={{ mb: 1, border: '1px solid #2d3748', borderRadius: 1, overflow: 'hidden' }}>
            <ButtonBase
                onClick={() => setOpen(v => !v)}
                sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1.5,
                    py: 1,
                    bgcolor: '#1a202c',
                    textAlign: 'left',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                        variant="caption"
                        sx={{ color: scenario.color, fontFamily: 'monospace', fontWeight: 700, minWidth: 32 }}
                    >
                        {scenario.score}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#e2e8f0', fontWeight: 600 }}>
                        {scenario.label}
                    </Typography>
                </Box>
                {open ? (
                    <ExpandLess sx={{ fontSize: 16, color: '#4a5568' }} />
                ) : (
                    <ExpandMore sx={{ fontSize: 16, color: '#4a5568' }} />
                )}
            </ButtonBase>
            <Collapse in={open}>
                <Box sx={{ px: 1.5, py: 1, bgcolor: '#0f1722' }}>
                    <Typography variant="caption" sx={{ color: '#4a5568', display: 'block', mb: 0.5 }}>
                        Conditions: {scenario.conditions}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#a0aec0', lineHeight: 1.7, display: 'block' }}>
                        {scenario.plain}
                    </Typography>
                </Box>
            </Collapse>
        </Box>
    );
};

const ScenarioExplainer = () => {
    const [show, setShow] = useState(false);

    return (
        <Box sx={{ mt: 3 }}>
            <ButtonBase
                onClick={() => setShow(v => !v)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mb: 1,
                    color: '#4fd1c5',
                }}
            >
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'inherit' }}>
                    WHAT DO THE SCENARIOS MEAN?
                </Typography>
                {show ? <ExpandLess sx={{ fontSize: 14 }} /> : <ExpandMore sx={{ fontSize: 14 }} />}
            </ButtonBase>
            <Collapse in={show}>
                {SCENARIOS.map(s => (
                    <ScenarioRow key={s.code} scenario={s} />
                ))}
                <Typography
                    variant="caption"
                    sx={{ color: '#4a5568', display: 'block', mt: 1, fontStyle: 'italic' }}
                >
                    Scores validated on TCGA-OV cohort (n=30). Research Use Only.
                </Typography>
            </Collapse>
        </Box>
    );
};

export default ScenarioExplainer;
