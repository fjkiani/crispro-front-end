/**
 * TargetChips — Gene target pills with tooltip support.
 * Used by: DrugCard Tier 2, ArsenalDrugDetailPage Mechanism section.
 */
import React from 'react';
import { colors, radii, typography } from './arsenalTokens';

const TargetChips = ({ targets, tooltips, maxVisible = 6, size = 'sm' }) => {
    if (!targets?.length) return null;
    const isLg = size === 'lg';
    const shown = maxVisible ? targets.slice(0, maxVisible) : targets;

    return (
        <div style={{ display: 'flex', gap: isLg ? '0.4rem' : '0.35rem', flexWrap: 'wrap' }}>
            {shown.map((t) => (
                <span
                    key={t}
                    title={tooltips?.[t] || t}
                    style={{
                        padding: isLg ? '0.25rem 0.7rem' : '0.15rem 0.5rem',
                        borderRadius: radii.small,
                        ...(isLg ? typography.chipLg : typography.chip),
                        background: colors.chipBg,
                        color: colors.chipColor,
                        border: `1px solid ${colors.chipBorder}`,
                        cursor: tooltips?.[t] ? 'help' : 'default',
                    }}
                >
                    {t}
                    {isLg && tooltips?.[t] && (
                        <span style={{
                            fontFamily: 'sans-serif', fontWeight: 400,
                            color: colors.accent, marginLeft: '0.4rem',
                        }}>
                            — {tooltips[t]}
                        </span>
                    )}
                </span>
            ))}
        </div>
    );
};

export default TargetChips;
