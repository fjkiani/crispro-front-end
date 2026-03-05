/**
 * DecisionLogic — Shows the kill chain rule and action.
 * Explains HOW the SPE arrived at this verdict.
 */
import React from 'react';
import { colors, radii, typography, verdictMeta } from '../arsenalTokens';

const ACTION_LABELS = {
    WATCH: { label: 'Watch', color: colors.cond, desc: 'Monitoring — not yet actionable' },
    QUARANTINE: { label: 'Quarantined', color: colors.fail, desc: 'Excluded from consideration — structural impossibility' },
    WATCH_HISTORICAL: { label: 'Historical Watch', color: colors.muted, desc: 'Historically noted but no active signal' },
    BOOST: { label: 'Boosted', color: colors.pass, desc: 'Elevated priority based on evidence' },
};

const DecisionLogic = ({ rule, action, verdict }) => {
    if (!rule && !action) return null;
    const al = ACTION_LABELS[action] || { label: action || 'Unknown', color: colors.muted, desc: '' };
    const vm = verdictMeta(verdict);

    return (
        <div style={{
            background: colors.bgCard, borderRadius: radii.section,
            border: `1px solid ${colors.border}`, padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
            <h3 style={{ ...typography.sectionTitle, color: colors.caption, margin: '0 0 1rem' }}>
                Decision Logic
            </h3>
            <p style={{ fontSize: '0.82rem', color: colors.muted, margin: '0 0 1rem', lineHeight: 1.4 }}>
                How the Structural Pharmacology Engine arrived at this verdict.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {/* Verdict badge */}
                <div style={{
                    padding: '0.35rem 0.75rem', borderRadius: radii.chip,
                    background: `${vm.color}12`, color: vm.color,
                    fontWeight: 800, fontSize: '0.82rem',
                    border: `1px solid ${vm.color}30`,
                }}>
                    {vm.icon} {vm.label}
                </div>
                {/* Action badge */}
                <div style={{
                    padding: '0.35rem 0.75rem', borderRadius: radii.chip,
                    background: `${al.color}12`, color: al.color,
                    fontWeight: 800, fontSize: '0.82rem',
                    border: `1px solid ${al.color}30`,
                }}>
                    {al.label}
                </div>
            </div>

            {/* Kill chain rule */}
            {rule && (
                <div style={{
                    padding: '0.75rem 1rem', borderRadius: radii.pill,
                    background: colors.bgSubtle, border: `1px solid ${colors.bgSubtle}`,
                }}>
                    <div style={{ ...typography.label, color: colors.caption, marginBottom: '0.3rem' }}>
                        Kill Chain Rule
                    </div>
                    <code style={{
                        fontSize: '0.82rem', color: colors.textSec,
                        fontFamily: 'monospace', lineHeight: 1.5,
                        wordBreak: 'break-all',
                    }}>
                        {rule}
                    </code>
                </div>
            )}

            {/* Action description */}
            {al.desc && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: colors.muted, fontStyle: 'italic' }}>
                    {al.desc}
                </div>
            )}
        </div>
    );
};

export default DecisionLogic;
