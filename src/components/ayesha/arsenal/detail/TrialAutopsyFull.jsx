/**
 * TrialAutopsyFull — Extended Mars autopsy with ALL intelligence fields.
 * Includes: verdict, design flaws, hypothesis, financial barrier,
 *           formulation solution, recommended design, NCTs audited.
 */
import React from 'react';
import { colors, radii, typography, marsMeta } from '../arsenalTokens';

const TrialAutopsyFull = ({ autopsy }) => {
    if (!autopsy) return null;
    const mm = marsMeta(autopsy.mars_verdict);

    return (
        <div style={{
            background: colors.bgCard, borderRadius: radii.section,
            border: `1px solid ${colors.border}`, padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
            <h3 style={{ ...typography.sectionTitle, color: colors.caption, margin: '0 0 1rem' }}>
                🔱 Why Prior Trials Failed
            </h3>

            {/* Mars Verdict */}
            <div style={{
                display: 'inline-block', padding: '0.35rem 0.85rem',
                borderRadius: radii.chip, background: `${mm.color}12`,
                color: mm.color, fontWeight: 800, fontSize: '0.95rem',
                border: `1px solid ${mm.color}30`, marginBottom: '1rem',
            }}>
                {mm.label}
            </div>

            {/* NCTs audited */}
            {autopsy.nct_ids_audited?.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                    <span style={{ ...typography.label, color: colors.caption }}>Trials Audited: </span>
                    {autopsy.nct_ids_audited.map(nct => (
                        <a key={nct} href={`https://clinicaltrials.gov/study/${nct}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{
                                fontSize: '0.82rem', fontWeight: 700, color: colors.blue,
                                textDecoration: 'none', marginRight: '0.5rem', fontFamily: 'monospace',
                            }}>
                            {nct} ↗
                        </a>
                    ))}
                </div>
            )}

            {/* Design Flaws */}
            {autopsy.design_flaws?.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ ...typography.label, color: colors.caption, marginBottom: '0.4rem' }}>
                        Design Flaws Identified:
                    </div>
                    {autopsy.design_flaws.map((flaw, i) => (
                        <div key={i} style={{
                            paddingLeft: '0.85rem', borderLeft: `2px solid ${mm.color}25`,
                            marginBottom: '0.4rem', fontSize: '0.88rem',
                            color: colors.textSec, lineHeight: 1.5,
                        }}>
                            {flaw.replace(/_/g, ' ')}
                        </div>
                    ))}
                </div>
            )}

            {/* Correct Route Hypothesis */}
            {autopsy.correct_route_hypothesis && (
                <div style={{
                    padding: '0.75rem 1rem', borderRadius: radii.pill,
                    background: colors.infoBg, border: `1px solid ${colors.infoBorder}`,
                    marginBottom: '0.75rem',
                }}>
                    <div style={{ ...typography.label, color: colors.infoText, marginBottom: '0.25rem' }}>
                        Correct Route Hypothesis
                    </div>
                    <p style={{ fontSize: '0.88rem', color: colors.textSec, lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                        {autopsy.correct_route_hypothesis}
                    </p>
                </div>
            )}

            {/* Financial Barrier */}
            {autopsy.financial_barrier && (
                <div style={{
                    padding: '0.75rem 1rem', borderRadius: radii.pill,
                    background: colors.warningBg, border: `1px solid ${colors.warningBorder}`,
                    marginBottom: '0.75rem',
                }}>
                    <div style={{ ...typography.label, color: colors.warning, marginBottom: '0.25rem' }}>
                        💰 Financial Barrier
                    </div>
                    <p style={{ fontSize: '0.88rem', color: colors.textSec, lineHeight: 1.5, margin: 0 }}>
                        {autopsy.financial_barrier.replace(/_/g, ' ')}
                    </p>
                </div>
            )}

            {/* Formulation Solution */}
            {autopsy.formulation_solution && (
                <div style={{
                    padding: '0.75rem 1rem', borderRadius: radii.pill,
                    background: colors.successBg, border: `1px solid ${colors.successBorder}`,
                    marginBottom: '0.75rem',
                }}>
                    <div style={{ ...typography.label, color: colors.successText, marginBottom: '0.25rem' }}>
                        🧪 Formulation Solution
                    </div>
                    <p style={{ fontSize: '0.88rem', color: colors.textSec, lineHeight: 1.5, margin: 0 }}>
                        {autopsy.formulation_solution}
                    </p>
                </div>
            )}

            {/* Recommended Trial Design */}
            {autopsy.recommended_design && (
                <div style={{
                    padding: '0.75rem 1rem', borderRadius: radii.pill,
                    background: `${colors.pass}08`, border: `1px solid ${colors.pass}20`,
                }}>
                    <div style={{ ...typography.label, color: colors.pass, marginBottom: '0.25rem' }}>
                        ✦ Recommended Trial Design
                    </div>
                    <p style={{ fontSize: '0.88rem', color: colors.textSec, lineHeight: 1.5, margin: 0, fontWeight: 600 }}>
                        {autopsy.recommended_design}
                    </p>
                </div>
            )}
        </div>
    );
};

export default TrialAutopsyFull;
