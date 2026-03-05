/**
 * SignalTeaser — Compact Kill Chain preview for the Command Center.
 *
 * Pure renderer. Shows 8 signal channels grouped by Active (6) / Baseline (2).
 * Each signal shows: emoji dot, name, state label, reason.
 * Interactions: inline CA-125/HRD entry, navigate to test/:slug for others.
 *
 * Props:
 *   signals   — Array of { id, name, emoji, stateLabel, reason, type, testSlug }
 *   counts    — { fired, monitoring, noData, clear, baseline }
 *   onNavigateTest — (slug) => void
 *   entryForms — { CA125_RISING?: ReactNode, HRD_SHIFT?: ReactNode }
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LIGHT_STATES } from '../../../constants/kill-chain/signalDefinitions';

export default function SignalTeaser({
    signals = [],
    counts = {},
    entryForms = {},
}) {
    const navigate = useNavigate();
    const [expandedSignal, setExpandedSignal] = useState(null);

    const activeSignals = signals.filter(s => s.type === 'ACTIVE');
    const baselineSignals = signals.filter(s => s.type === 'BASELINE');

    const handleSignalClick = (signal) => {
        // If this signal has an inline entry form, toggle it
        if (entryForms[signal.id]) {
            setExpandedSignal(expandedSignal === signal.id ? null : signal.id);
            return;
        }
        // Otherwise navigate to the test slug
        if (signal.testSlug) {
            navigate(`/ayesha/journey/test/${signal.testSlug}`);
        }
    };

    const renderSignal = (signal) => {
        const stateInfo = LIGHT_STATES[signal.state] || LIGHT_STATES.NO_DATA;
        const hasForm = !!entryForms[signal.id];
        const isExpanded = expandedSignal === signal.id;

        return (
            <div key={signal.id} className="cc-signal-teaser__item">
                <div
                    className="cc-signal-teaser__row"
                    onClick={() => handleSignalClick(signal)}
                    style={{ cursor: hasForm || signal.testSlug ? 'pointer' : 'default' }}
                >
                    <span
                        className="cc-banner__dot"
                        style={{ background: stateInfo.color }}
                        title={stateInfo.label}
                    />
                    <div className="cc-signal-teaser__info">
                        <span className="cc-signal-teaser__name">{signal.name}</span>
                        <span className="cc-signal-teaser__reason">{signal.reason}</span>
                    </div>
                    {hasForm && (
                        <span className="cc-signal-teaser__action">
                            {isExpanded ? '▾' : signal.actionLabel || 'Enter data'}
                        </span>
                    )}
                    {!hasForm && signal.testSlug && (
                        <span className="cc-signal-teaser__action">View test →</span>
                    )}
                </div>
                {isExpanded && entryForms[signal.id] && (
                    <div className="cc-signal-teaser__form">
                        {entryForms[signal.id]}
                    </div>
                )}
            </div>
        );
    };

    return (
        <section>
            <h2 className="cc-section-title">Kill Chain — 8 Signal Channels</h2>

            {/* Summary counts */}
            <div className="cc-signal-legend">
                {counts.fired > 0 && <span>🔴 {counts.fired} fired </span>}
                {counts.clear > 0 && <span>🟢 {counts.clear} clear </span>}
                {counts.monitoring > 0 && <span>🟡 {counts.monitoring} watching </span>}
                {counts.noData > 0 && <span>⚫ {counts.noData} awaiting data </span>}
                {counts.baseline > 0 && <span>🔵 {counts.baseline} baseline</span>}
            </div>

            {/* Active monitors */}
            {activeSignals.length > 0 && (
                <div className="cc-signal-teaser__group">
                    <div className="cc-signal-teaser__group-label">
                        Active Monitors ({activeSignals.length})
                    </div>
                    {activeSignals.map(renderSignal)}
                </div>
            )}

            {/* Baseline flags */}
            {baselineSignals.length > 0 && (
                <div className="cc-signal-teaser__group">
                    <div className="cc-signal-teaser__group-label">
                        Baseline Flags ({baselineSignals.length})
                    </div>
                    {baselineSignals.map(renderSignal)}
                </div>
            )}

            {/* Link to full dashboard */}
            <button
                className="cc-toggle"
                onClick={() => navigate('/ayesha/journey/monitoring')}
            >
                View full signal dashboard →
            </button>
        </section>
    );
}
