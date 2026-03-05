/**
 * DrugHero — Top-of-page hero for arsenal drug detail.
 * Shows: name, class, verdict badge, patient summary, verdict explanation.
 */
import React from 'react';
import { colors, radii, typography, verdictMeta } from '../arsenalTokens';
import VerdictBadge from '../VerdictBadge';
import SafetyNote from '../SafetyNote';

const DrugHero = ({ drug }) => {
    const vm = verdictMeta(drug.feasibility?.verdict);

    return (
        <div style={{ marginBottom: '2rem' }}>
            {/* Name + Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <h1 style={{ ...typography.drugNameLg, color: colors.text, margin: 0, textTransform: 'capitalize' }}>
                    {drug.name || drug.drug_name}
                </h1>
                <VerdictBadge verdict={drug.feasibility?.verdict} size="lg" />
            </div>

            {/* Drug class */}
            {drug.class && (
                <div style={{
                    fontSize: '0.88rem', color: colors.accent, fontWeight: 600,
                    marginBottom: '0.5rem',
                }}>
                    {drug.class}
                </div>
            )}

            {/* Patient summary */}
            <p style={{ fontSize: '1.1rem', color: colors.textSec, lineHeight: 1.6, margin: '0 0 0.5rem' }}>
                {drug.patient_summary || drug.mechanism || '—'}
            </p>

            {/* Verdict explanation */}
            <p style={{ fontSize: '0.85rem', color: colors.caption, margin: '0 0 1rem' }}>
                {vm.sub}
            </p>

            {/* Safety note */}
            <SafetyNote drugName={drug.drug_name} size="lg" />
        </div>
    );
};

export default DrugHero;
