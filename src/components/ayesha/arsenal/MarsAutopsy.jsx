/**
 * MarsAutopsy — "🔱 Why Prior Trials Failed" container.
 * Used by: DrugCard Tier 1 (compact), ArsenalDrugDetailPage (full).
 */
import React from 'react';
import { colors, radii, marsMeta } from './arsenalTokens';

const MarsAutopsy = ({ autopsy, compact = false }) => {
    if (!autopsy) return null;
    const mm = marsMeta(autopsy.mars_verdict);

    if (compact) {
        return (
            <div style={{
                padding: '0.6rem 0.85rem', borderRadius: radii.pill,
                background: `${mm.color}06`, border: `1px solid ${mm.color}20`,
                display: 'flex', flexDirection: 'column', gap: '0.3rem',
            }}>
                <div style={{
                    fontSize: '0.72rem', fontWeight: 800, color: colors.textTer,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                    🔱 Why Prior Trials Failed
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: mm.color }}>
                    {mm.label}
                </div>
                {autopsy.design_flaws?.[0] && (
                    <div style={{ fontSize: '0.78rem', color: colors.muted, fontWeight: 400, lineHeight: 1.4 }}>
                        {autopsy.design_flaws[0].replace(/_/g, ' ')}
                    </div>
                )}
                {autopsy.recommend_new_trial && (
                    <div style={{ fontSize: '0.75rem', color: colors.pass, fontWeight: 700, marginTop: '2px' }}>
                        ✦ New trial design available
                    </div>
                )}
            </div>
        );
    }

    // Full mode — detail page
    return (
        <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e11d48', marginBottom: '0.75rem' }}>
                {mm.label}
            </div>
            {autopsy.design_flaws?.map((flaw, i) => (
                <div key={i} style={{
                    fontSize: '0.88rem', color: colors.textTer, lineHeight: 1.5,
                    paddingLeft: '0.75rem', borderLeft: '2px solid #e11d4820', marginBottom: '0.5rem',
                }}>
                    {flaw.replace(/_/g, ' ')}
                </div>
            ))}
            {autopsy.correct_route_hypothesis && (
                <div style={{
                    marginTop: '0.75rem', fontSize: '0.88rem', color: colors.textSec,
                    fontStyle: 'italic', lineHeight: 1.5,
                }}>
                    <strong>Hypothesis:</strong> {autopsy.correct_route_hypothesis}
                </div>
            )}
            {autopsy.recommended_design && (
                <div style={{
                    marginTop: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: radii.pill,
                    background: colors.successBg, border: `1px solid ${colors.successBorder}`,
                    fontSize: '0.85rem', color: colors.successText, fontWeight: 600,
                }}>
                    ✦ {autopsy.recommended_design}
                </div>
            )}
            {autopsy.recommend_new_trial && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: colors.pass, fontWeight: 700 }}>
                    ✦ New trial design is recommended
                </div>
            )}
        </div>
    );
};

export default MarsAutopsy;
