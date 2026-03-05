/**
 * GapAnalysis — Full SPE analysis section.
 * Shows: gap number, GapGauge (lg), PKNumbers (full), PK note callout, PK source.
 */
import React from 'react';
import { colors, radii, typography, gapColor } from '../arsenalTokens';
import GapGauge from '../GapGauge';
import PKNumbers from '../PKNumbers';

const GapAnalysis = ({ feasibility }) => {
    if (!feasibility) return null;
    const gap = feasibility.gap_ratio;
    const gc = gapColor(gap);

    return (
        <div style={{
            background: colors.bgCard, borderRadius: radii.section,
            border: `1px solid ${colors.border}`, padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
            <h3 style={{ ...typography.sectionTitle, color: colors.caption, margin: '0 0 1rem' }}>
                Structural Pharmacology Analysis
            </h3>

            {/* Gap ratio hero number */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ ...typography.gapNumberLg, color: gc }}>
                    {gap != null ? `${gap}×` : 'N/A'}
                </span>
                <span style={{ ...typography.body, color: colors.muted }}>
                    IC₅₀ / free Cₘₐₓ gap ratio
                </span>
            </div>

            {/* Gap gauge with labels */}
            <div style={{ marginBottom: '1.5rem' }}>
                <GapGauge gap={gap} size="lg" showLabels />
            </div>

            {/* PK numbers grid */}
            <PKNumbers feasibility={feasibility} />

            {/* PK Note — critical caveats */}
            {feasibility.pk_note && (
                <div style={{
                    marginTop: '1rem', padding: '0.75rem 1rem',
                    borderRadius: radii.pill, background: colors.warningBg,
                    border: `1px solid ${colors.warningBorder}`,
                    fontSize: '0.85rem', lineHeight: 1.5, color: colors.warning,
                }}>
                    <strong>⚠️ PK Note:</strong> {feasibility.pk_note}
                </div>
            )}

            {/* PK Source citation */}
            {feasibility.source && (
                <div style={{
                    marginTop: '0.75rem', fontSize: '0.78rem',
                    color: colors.caption, fontStyle: 'italic', lineHeight: 1.4,
                }}>
                    📖 Source: {feasibility.source}
                </div>
            )}
        </div>
    );
};

export default GapAnalysis;
