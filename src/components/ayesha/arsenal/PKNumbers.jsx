/**
 * PKNumbers — IC₅₀ / Free Cₘₐₓ / Total Cₘₐₓ / PPB display.
 * compact: inline row (DrugCard Tier 2)
 * full: grid cards with descriptions (ArsenalDrugDetailPage)
 */
import React from 'react';
import { colors, radii, typography } from './arsenalTokens';

const PK_FIELDS = [
    { key: 'ic50_um', label: 'IC₅₀', unit: 'µM', desc: 'Concentration to kill 50% of cancer cells' },
    { key: 'free_cmax_um', label: 'Free Cₘₐₓ', unit: 'µM', desc: 'Highest achievable unbound drug level' },
    { key: 'cmax_um', label: 'Total Cₘₐₓ', unit: 'µM', desc: 'Total drug in bloodstream' },
    { key: 'ppb', label: 'PPB', unit: null, desc: 'How much drug is bound to blood proteins', format: (v) => `${(v * 100).toFixed(0)}%` },
];

const PKNumbers = ({ feasibility, compact = false }) => {
    if (!feasibility) return null;

    const items = PK_FIELDS
        .map(f => ({
            ...f,
            value: f.key === 'ppb' && feasibility.ppb != null
                ? f.format(feasibility.ppb)
                : feasibility[f.key],
        }))
        .filter(f => f.value != null);

    if (items.length === 0) return null;

    if (compact) {
        return (
            <div style={{ fontSize: '0.78rem', color: colors.muted, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {items.filter(f => ['ic50_um', 'free_cmax_um', 'ppb'].includes(f.key)).map(({ label, value, unit }) => (
                    <span key={label}>
                        <span style={{ color: colors.caption }}>{label}</span>{' '}
                        <span style={{ color: colors.textSec, fontWeight: 700 }}>
                            {typeof value === 'number' ? value : value}{unit ? ` ${unit}` : ''}
                        </span>
                    </span>
                ))}
            </div>
        );
    }

    // Full mode — grid cards
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
            {items.map(({ label, value, unit, desc }) => (
                <div key={label} style={{
                    padding: '0.75rem', background: colors.bg, borderRadius: radii.pill,
                    border: `1px solid ${colors.bgSubtle}`,
                }}>
                    <div style={{ ...typography.label, color: colors.caption }}>{label}</div>
                    <div style={{ ...typography.pkValue, color: colors.textSec }}>
                        {typeof value === 'number' ? value : value}{unit ? ` ${unit}` : ''}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: colors.border }}>{desc}</div>
                </div>
            ))}
        </div>
    );
};

export default PKNumbers;
