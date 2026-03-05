/**
 * ClinicalRationale — Full clinical rationale for this drug candidate.
 * The "elevator pitch" with specific trial data.
 */
import React from 'react';
import { colors, radii, typography } from '../arsenalTokens';

const ClinicalRationale = ({ rationale, evidenceTier }) => {
    if (!rationale) return null;

    const TIER_LABELS = {
        phase2_human: { label: 'Phase II Human Data', color: colors.pass, icon: '🏥' },
        phase1_human: { label: 'Phase I Human Data', color: colors.cond, icon: '🏥' },
        preclinical_mechanistic: { label: 'Preclinical Mechanistic', color: colors.cond, icon: '🔬' },
        preclinical_only: { label: 'Preclinical Only', color: colors.fail, icon: '🔬' },
        insufficient: { label: 'Insufficient Evidence', color: colors.fail, icon: '⚠️' },
    };

    const tier = TIER_LABELS[evidenceTier] || { label: evidenceTier?.replace(/_/g, ' ') || 'Unknown', color: colors.muted, icon: '?' };

    return (
        <div style={{
            background: colors.bgCard, borderRadius: radii.section,
            border: `1px solid ${colors.border}`, padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ ...typography.sectionTitle, color: colors.caption, margin: 0 }}>
                    Clinical Rationale
                </h3>
                <span style={{
                    padding: '0.25rem 0.75rem', borderRadius: radii.chip,
                    fontSize: '0.78rem', fontWeight: 800,
                    background: `${tier.color}12`, color: tier.color,
                    border: `1px solid ${tier.color}30`,
                }}>
                    {tier.icon} {tier.label}
                </span>
            </div>

            <p style={{
                ...typography.bodyLg, color: colors.textSec, margin: 0, lineHeight: 1.7,
            }}>
                {rationale}
            </p>
        </div>
    );
};

export default ClinicalRationale;
