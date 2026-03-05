/**
 * SignalDetailPanel — Kill Chain 3-tier with collapse
 *
 * Tier 1: FIRED signals (prominent, expanded)
 * Tier 2: WATCHING / BASELINE (normal weight)
 * Tier 3: NO DATA (collapsed by default, expandable)
 *
 * Badge vocabulary: FIRED / WATCHING / BASELINE / TEST NEEDED
 * Signal names from SIGNAL_DEFINITIONS, never raw keys.
 */
import React, { useMemo, useState } from 'react';
import { Box, Collapse } from '@mui/material';
import { SIGNAL_DEFINITIONS } from '../../../constants/kill-chain/signalDefinitions';
import './commandCenter.css';

// ── Signal name translator (strip underscores, use definition name) ──────────

function signalName(key) {
    const def = SIGNAL_DEFINITIONS[key];
    if (def?.name) return def.name;
    return key.replace(/_/g, ' ');
}

// ── Signal order ─────────────────────────────────────────────────────────────

const SIGNAL_ORDER = [
    'CA125_RISING', 'HRD_SHIFT', 'REPAIR_SHIFT', 'CTDNA_MRD',
    'NRF2_ACTIVATION', 'SLC31A1_LOSS', 'HRD_BASELINE', 'SLFN11_PRIOR',
];

// ── Component ────────────────────────────────────────────────────────────────

export default function SignalDetailPanel({ signals, summary }) {
    const [showNoData, setShowNoData] = useState(false);

    // Sort signals into 3 tiers
    const { fired, watching, noData } = useMemo(() => {
        const fired = [];
        const watching = [];
        const noData = [];

        SIGNAL_ORDER.forEach(key => {
            const s = signals[key];
            const def = SIGNAL_DEFINITIONS[key] || {};
            const stateKey = s?.state?.key || 'NO_DATA';
            const name = signalName(key);
            const entry = { key, name, signal: s, def, stateKey };

            if (stateKey === 'FIRED') fired.push(entry);
            else if (stateKey === 'NO_DATA') noData.push(entry);
            else watching.push(entry);
        });

        return { fired, watching, noData };
    }, [signals]);

    return (
        <section>
            <h2 className="cc-section-title">Kill Chain Resistance Logic</h2>
            <p className="cc-signal-legend">
                ● Fired &nbsp; ● Watching &nbsp; ● Baseline &nbsp; ⚫ Awaiting data
            </p>

            {/* Tier 1: FIRED */}
            {fired.map(t => (
                <div key={t.key} className="cc-signal-fired">
                    <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🔴</span>
                    <div>
                        <p className="cc-signal-fired__name">{t.name}</p>
                        <p className="cc-signal-fired__reason">
                            {t.signal?.reason || 'Resistance vector active'}
                        </p>
                        <span className="cc-signal-fired__cta">View resistance pathway →</span>
                    </div>
                </div>
            ))}

            {/* Tier 2: WATCHING / BASELINE */}
            {watching.map(t => (
                <div key={t.key} className="cc-signal-tier2">
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>
                        {t.stateKey === 'BASELINE' ? '🔵' : '🟡'}
                    </span>
                    <div>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                            <span className="cc-signal-tier2__name">{t.name}</span>
                            <span className={`cc-signal-badge ${t.stateKey === 'BASELINE' ? 'cc-signal-badge--baseline' : 'cc-signal-badge--watching'}`}>
                                {t.stateKey === 'BASELINE' ? 'BASELINE' : 'WATCHING'}
                            </span>
                        </Box>
                        <p className="cc-action__unlocks">
                            {t.def.plainLanguage || 'Monitoring for shift'}
                        </p>
                    </div>
                </div>
            ))}

            {/* Tier 3: NO DATA (collapsed) */}
            {noData.length > 0 && (
                <div style={{ marginTop: 8 }}>
                    <button className="cc-toggle" onClick={() => setShowNoData(!showNoData)}>
                        {showNoData
                            ? '▴ Hide signals'
                            : `▾ ${noData.length} signals awaiting data (tap to expand)`}
                    </button>
                    <Collapse in={showNoData}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, pl: 2 }}>
                            {noData.map(t => (
                                <div key={t.key} className="cc-signal-nodata">
                                    <span style={{ color: 'var(--signal-nodata)' }}>⚫</span>
                                    <span className="cc-signal-nodata__text">
                                        {t.name} · Needs: {t.def.testRequired || 'Test not specified'}
                                    </span>
                                </div>
                            ))}
                        </Box>
                    </Collapse>
                </div>
            )}
        </section>
    );
}
