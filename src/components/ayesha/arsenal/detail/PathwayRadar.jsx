/**
 * PathwayRadar — 8-pathway alignment horizontal bar chart.
 * Translates technical pathway codes into patient-friendly labels.
 */
import React from 'react';
import { colors, radii, typography } from '../arsenalTokens';

const PATHWAY_LABELS = {
    ddr: { label: 'DNA Repair', icon: '🧬', desc: 'Ability to fix damaged DNA' },
    mapk: { label: 'Growth Signaling', icon: '📡', desc: 'Cell growth communication' },
    pi3k: { label: 'Cell Growth', icon: '🌱', desc: 'PI3K/mTOR growth pathway' },
    vegf: { label: 'Blood Supply', icon: '🩸', desc: 'Tumor blood vessel formation' },
    her2: { label: 'HER2 Pathway', icon: '🔗', desc: 'HER2 receptor signaling' },
    io: { label: 'Immune System', icon: '🛡️', desc: 'Immune response modulation' },
    efflux: { label: 'Drug Resistance', icon: '🚪', desc: 'Drug pump-out mechanisms' },
    rss: { label: 'Stress Response', icon: '⚡', desc: 'Cellular stress pathways' },
};

const PathwayRadar = ({ pathways }) => {
    if (!pathways || Object.keys(pathways).length === 0) return null;

    // Filter out the _note field and sort by value descending
    const entries = Object.entries(pathways)
        .filter(([k]) => k !== '_note' && PATHWAY_LABELS[k])
        .sort(([, a], [, b]) => b - a);

    if (entries.length === 0) return null;
    const maxVal = Math.max(...entries.map(([, v]) => v), 0.01);

    return (
        <div style={{
            background: colors.bgCard, borderRadius: radii.section,
            border: `1px solid ${colors.border}`, padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
            <h3 style={{ ...typography.sectionTitle, color: colors.caption, margin: '0 0 1rem' }}>
                Pathway Alignment
            </h3>
            <p style={{ fontSize: '0.82rem', color: colors.muted, margin: '0 0 1.25rem', lineHeight: 1.4 }}>
                Which cancer pathways this drug targets, and how strongly.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {entries.map(([key, value]) => {
                    const meta = PATHWAY_LABELS[key];
                    const pct = (value / maxVal) * 100;
                    const isStrong = value >= 0.4;
                    const isMedium = value >= 0.15;
                    const barColor = isStrong ? colors.pass : isMedium ? colors.cond : colors.caption;

                    return (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {/* Label */}
                            <div style={{ width: '140px', flexShrink: 0 }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: colors.textSec }}>
                                    {meta.icon} {meta.label}
                                </div>
                            </div>
                            {/* Bar */}
                            <div style={{
                                flex: 1, height: '18px', background: colors.bgSubtle,
                                borderRadius: radii.gauge, overflow: 'hidden', position: 'relative',
                            }}>
                                <div style={{
                                    width: `${Math.max(pct, 2)}%`, height: '100%',
                                    background: barColor, borderRadius: radii.gauge,
                                    opacity: 0.75, transition: 'width 0.5s ease',
                                }} />
                            </div>
                            {/* Value */}
                            <div style={{
                                width: '45px', textAlign: 'right',
                                fontSize: '0.82rem', fontWeight: 800, color: barColor,
                                fontVariantNumeric: 'tabular-nums',
                            }}>
                                {(value * 100).toFixed(0)}%
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pathway note */}
            {pathways._note && (
                <div style={{
                    marginTop: '1rem', fontSize: '0.78rem', color: colors.caption,
                    fontStyle: 'italic', lineHeight: 1.4,
                }}>
                    {pathways._note}
                </div>
            )}
        </div>
    );
};

export default PathwayRadar;
