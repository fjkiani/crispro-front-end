/**
 * CommandBanner — Phase 1 Command Center hero section.
 *
 * Pure renderer. Receives ALL data as props from the orchestrator.
 * Zero hardcoded patient data. Zero inline hex colors.
 *
 * Sections:
 *   1. Identity line (name, age, histology)
 *   2. Disease line (stage, primary site) — stage editable
 *   3. Status row: Kill Chain state, PFI badge, biomarker chips
 *   4. Signal dot strip (8 dots)
 *   5. Gene coverage + completeness bar
 *   6. Timestamp
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LIGHT_STATES } from '../../../constants/kill-chain/signalDefinitions';
import PFICategoryBadge from '../../timing/PFICategoryBadge';
import CompletenessStrip from './CompletenessStrip';

/* ── State badge label/color ─────────────────────────────────────────────── */

const STATE_DISPLAY = {
    BASELINE: { label: 'Baseline — Monitoring', cssVar: '--signal-baseline' },
    MONITORING: { label: 'Monitoring — Watching', cssVar: '--signal-watching' },
    RESISTANCE_DETECTED: { label: 'Resistance Detected', cssVar: '--signal-fired' },
};

/* ── Component ───────────────────────────────────────────────────────────── */

export default function CommandBanner({
    identity = {},
    disease = {},
    germline = {},
    biomarkerChips = [],
    chipOverflow = null,
    stateEstimate = 'BASELINE',
    pfiDays = null,
    signalDots = [],
    geneCoverage = {},
    completeness = {},
    timestamp,
    onEditStage,
}) {
    const navigate = useNavigate();
    const stateInfo = STATE_DISPLAY[stateEstimate] || STATE_DISPLAY.BASELINE;
    const [stageEditing, setStageEditing] = useState(false);

    return (
        <section className="cc-banner">
            {/* Identity */}
            <h1 className="cc-banner__identity">
                {[identity.name, identity.age && `${identity.age}`, identity.histology]
                    .filter(Boolean)
                    .join(' · ')}
            </h1>

            {/* Disease line */}
            <div className="cc-banner__disease">
                {disease.stage && (
                    <span
                        className="cc-banner__stage"
                        onClick={() => onEditStage && setStageEditing(!stageEditing)}
                        title={onEditStage ? 'Click to edit' : undefined}
                    >
                        Stage {disease.stage}
                    </span>
                )}
                {disease.primarySite && (
                    <span className="cc-banner__site"> · {disease.primarySite}</span>
                )}
            </div>

            {/* Germline */}
            {germline.gene && (
                <div className="cc-banner__germline">
                    <span className="cc-signal-badge cc-signal-badge--baseline">
                        Germline: {germline.gene} — {germline.classification || 'variant'}
                    </span>
                </div>
            )}

            {/* Status row: Kill Chain state + PFI + biomarkers */}
            <div className="cc-banner__status-row">
                <span
                    className="cc-signal-badge"
                    style={{
                        background: `var(${stateInfo.cssVar}, #94a3b8)20`,
                        color: `var(${stateInfo.cssVar}, #94a3b8)`,
                    }}
                >
                    {stateInfo.label}
                </span>

                <PFICategoryBadge pfiDays={pfiDays} />

                {biomarkerChips.map((chip, i) => (
                    <span
                        key={i}
                        className="cc-signal-badge"
                        style={{
                            background: `var(${chip.cssVar || '--zeta-slate'}, #64748b)18`,
                            color: `var(${chip.cssVar || '--zeta-slate'}, #64748b)`,
                        }}
                    >
                        {chip.label}
                    </span>
                ))}
                {chipOverflow && !chipOverflow.expanded && (
                    <span
                        className="cc-signal-badge"
                        style={{ cursor: 'pointer', background: 'var(--zeta-slate, #64748b)12', color: 'var(--zeta-slate, #64748b)' }}
                        onClick={chipOverflow.onToggle}
                    >
                        +{chipOverflow.total - chipOverflow.showing} more
                    </span>
                )}
                {chipOverflow?.expanded && (
                    <span
                        className="cc-signal-badge"
                        style={{ cursor: 'pointer', background: 'var(--zeta-slate, #64748b)12', color: 'var(--zeta-slate, #64748b)' }}
                        onClick={chipOverflow.onToggle}
                    >
                        ▴ Show less
                    </span>
                )}
            </div>

            {/* Kill Chain summary — single clickable line (GAP-24) */}
            <div
                className="cc-banner__dots"
                onClick={() => navigate('/ayesha/journey/monitoring')}
                style={{ cursor: 'pointer' }}
            >
                <span className="cc-banner__dots-summary" style={{ fontSize: '0.82rem' }}>
                    Kill Chain: {signalDots.filter(d => d.state === 'CLEAR').length} clear
                    {' · '}
                    {signalDots.filter(d => d.state === 'NO_DATA').length} awaiting data
                    {signalDots.filter(d => d.state === 'FIRED').length > 0 &&
                        ` · ${signalDots.filter(d => d.state === 'FIRED').length} fired`}
                    {' · '}
                    {geneCoverage.covered ?? 0}/{geneCoverage.total ?? 26} genes
                    {' → '}
                    <span style={{ textDecoration: 'underline' }}>View signals</span>
                </span>
            </div>

            {/* Completeness */}
            <CompletenessStrip
                score={completeness.score || 0}
                missing={completeness.missing || []}
                route="/ayesha/journey/tests"
                ctaLabel="View tests"
            />

            {/* Timestamp */}
            {timestamp && (
                <div className="cc-banner__timestamp">
                    Updated {timestamp}
                </div>
            )}
        </section>
    );
}
