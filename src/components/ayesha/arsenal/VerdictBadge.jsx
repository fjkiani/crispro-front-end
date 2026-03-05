/**
 * VerdictBadge — Renders the VIABLE / INVESTIGATE / NOT VIABLE pill.
 * Used by: DrugCard (compact), ArsenalDrugDetailPage (large).
 */
import React from 'react';
import { verdictMeta, radii, typography } from './arsenalTokens';

const VerdictBadge = ({ verdict, size = 'sm' }) => {
    const vm = verdictMeta(verdict);
    const isLg = size === 'lg';

    return (
        <span style={{
            padding: isLg ? '0.4rem 1rem' : '0.35rem 0.75rem',
            borderRadius: radii.chip,
            ...(isLg ? typography.verdictBadgeLg : typography.verdictBadge),
            background: `${vm.color}12`,
            color: vm.color,
            border: `1px solid ${vm.color}30`,
            whiteSpace: 'nowrap',
            display: 'inline-block',
        }}>
            {vm.icon} {vm.label}
        </span>
    );
};

export default VerdictBadge;
