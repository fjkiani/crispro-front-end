/**
 * RepurposingArsenalPage — Off-Label / Repurposing Arsenal (Patient AK)
 * 🔱 ZETA: Patient-first redesign. Three-tier progressive disclosure. White mode.
 *
 * Acceptance Criteria (A-R Spec):
 * - Stats row: VIABLE / INVESTIGATE / NOT VIABLE (patient language)
 * - Legend: plain English
 * - Cards: Tier 1 patient, Tier 2 oncologist, Tier 3 researcher
 * - Quarantine wall: absolute visual break
 * - Bottom CTA: "Bring to Your Oncologist"
 *
 * Uses arsenalTokens for all visual constants.
 *
 * FE-AK-005 (2026-05-10): Reads meta.deprecated and meta.use_instead from the
 *   hook's returned meta object. Renders a prominent deprecation banner at the
 *   top of the page when meta.deprecated === true.
 */

import React, { useMemo } from 'react';
import useRepurposingArsenal from '../../../hooks/ayesha/useRepurposingArsenal';
import DrugCard from '../../../components/ayesha/arsenal/DrugCard';
import ArsenalDivider from '../../../components/ayesha/arsenal/ArsenalDivider';
import { colors, radii, spacing, typography, shadows } from '../../../components/ayesha/arsenal/arsenalTokens';

const RepurposingArsenalPage = () => {
    const { drugs, evaluable, quarantined, meta, total, loading, error } = useRepurposingArsenal();

    const stats = useMemo(() => ({
        pass: evaluable.filter(d => d.feasibility?.verdict === 'PASS').length,
        conditional: evaluable.filter(d => d.feasibility?.verdict === 'CONDITIONAL_PASS').length,
        quarantinedCount: quarantined.length,
        pmids: drugs.reduce((n, d) => n + (d.evidence_manifest?.pubmed_ids?.length || 0), 0),
        ncts: drugs.reduce((n, d) => n + (d.evidence_manifest?.trial_registry_ids?.length || 0), 0),
    }), [evaluable, quarantined, drugs]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2rem' }}>
                <div style={{
                    width: '4rem', height: '4rem', borderRadius: '50%',
                    border: `3px solid ${colors.border}`, borderTopColor: colors.blue,
                    animation: 'spin 0.8s linear infinite',
                }} />
                <p style={{ color: colors.muted, fontSize: '1rem', fontWeight: 600 }}>
                    Loading Structural Pharmacology Engine…
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    maxWidth: '500px', padding: '2.5rem', borderRadius: radii.chip,
                    background: colors.errorBg, border: `1px solid ${colors.errorBorder}`,
                    textAlign: 'center', color: colors.errorText,
                }}>
                    <p style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Failed to load arsenal</p>
                    <p style={{ fontSize: '0.875rem', color: colors.muted, lineHeight: 1.6 }}>{error}</p>
                </div>
            </div>
        );
    }

    // Top recommendation for CTA
    const topPass = evaluable.find(d => d.feasibility?.verdict === 'PASS');
    const topConditional = evaluable.find(d => d.feasibility?.verdict === 'CONDITIONAL_PASS');

    const STAT_CARDS = [
        { value: stats.pass, label: 'Viable', sub: 'Drug reaches cancer cells at safe doses', color: colors.pass, icon: '🟢' },
        { value: stats.conditional, label: 'Worth Investigating', sub: 'Possible with formulation or dose adjustment', color: colors.cond, icon: '⚡' },
        { value: stats.quarantinedCount, label: 'Not Viable', sub: 'Cannot reach effective concentration safely', color: colors.fail, icon: '🚫' },
    ];

    const LEGEND = [
        { c: colors.pass, t: '🟢 VIABLE — drug reaches cancer cells at safe doses' },
        { c: colors.cond, t: '⚡ INVESTIGATE — possible with formulation or dose adjustment' },
        { c: colors.fail, t: '🔴 NOT VIABLE — cannot reach effective concentration safely' },
    ];

    // FE-AK-005: Read deprecation signal from server meta
    const isDeprecated = meta?.deprecated === true;
    const useInstead = meta?.use_instead || null;

    return (
        <div style={{
            minHeight: '100vh', background: colors.bg,
            padding: '3rem 2rem 6rem', color: colors.text,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}>
            {/* FE-AK-005: Deprecation banner — shown when backend signals meta.deprecated=true */}
            {isDeprecated && (
                <div style={{
                    maxWidth: spacing.pageMax, margin: '0 auto 2rem',
                    padding: '1rem 1.5rem',
                    borderRadius: '0.75rem',
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    border: '2px solid #f59e0b',
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                }}>
                    <span style={{ fontSize: '1.25rem', flexShrink: 0, lineHeight: 1.2 }}>⚠️</span>
                    <div>
                        <div style={{
                            fontSize: '0.9rem', fontWeight: 800, color: '#92400e',
                            letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.25rem',
                        }}>
                            Legacy Endpoint — This data source is deprecated
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#78350f', lineHeight: 1.6 }}>
                            The Repurposing Arsenal is being served from a deprecated backend endpoint.
                            Drug rankings and feasibility verdicts may not reflect the latest scoring model.
                            {useInstead && (
                                <> Please use <strong>{useInstead}</strong> instead.</>
                            )}
                            {' '}Contact engineering if this banner persists.
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ HERO HEADER ═══ */}
            <div style={{ maxWidth: spacing.pageMax, margin: '0 auto 2.5rem' }}>
                <h1 style={{
                    fontSize: '2.75rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1,
                    color: colors.text, margin: '0 0 1rem',
                }}>
                    Repurposing Arsenal
                </h1>
                <p style={{ fontSize: '1rem', color: colors.textTer, lineHeight: 1.7, maxWidth: '800px', margin: '0 0 1rem' }}>
                    These are existing approved drugs being studied in cancer — not standard ovarian treatments,
                    but candidates worth an informed conversation with your oncologist. Every verdict is computed
                    from pharmacology, not opinion.
                </p>
                <p style={{ fontSize: '1.05rem', color: colors.text, fontWeight: 700 }}>
                    → <span style={{ color: colors.pass }}>{stats.pass} viable</span>
                    {' · '}
                    <span style={{ color: colors.cond }}>{stats.conditional} worth investigating</span>
                    {' · '}
                    <span style={{ color: colors.fail }}>{stats.quarantinedCount} not viable at safe doses</span>
                </p>
            </div>

            {/* ═══ STATS ROW ═══ */}
            <div style={{
                maxWidth: spacing.pageMax, margin: '0 auto 2rem',
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem',
            }}>
                {STAT_CARDS.map(({ value, label, sub, color, icon }) => (
                    <div key={label} style={{
                        padding: '1.25rem 1.5rem', background: colors.bgCard, borderRadius: radii.section,
                        border: `1px solid ${colors.border}`, boxShadow: shadows.section,
                        display: 'flex', flexDirection: 'column', gap: '0.4rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 900, color, fontVariantNumeric: 'tabular-nums' }}>
                                {value}
                            </span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                {icon} {label}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: colors.caption, fontWeight: 400 }}>
                            {sub}
                        </div>
                    </div>
                ))}
            </div>

            {/* PMID/NCT footnote */}
            <div style={{ maxWidth: spacing.pageMax, margin: '0 auto 2.5rem', textAlign: 'center' }}>
                <p style={{ ...typography.captionSm, color: colors.caption }}>
                    Backed by {stats.pmids} peer-reviewed sources and {stats.ncts} clinical trials · SPE v{meta.version || '2.0'} · {new Date().toLocaleDateString()}
                </p>
            </div>

            {/* ═══ LEGEND ═══ */}
            <div style={{
                maxWidth: spacing.pageMax, margin: '0 auto 2rem',
                display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap',
                padding: '0.75rem 1.25rem', borderRadius: radii.inner,
                background: colors.bgCard, border: `1px solid ${colors.border}`,
            }}>
                {LEGEND.map(({ t }) => (
                    <div key={t} style={{ fontSize: '0.78rem', color: colors.textTer, fontWeight: 500 }}>
                        {t}
                    </div>
                ))}
            </div>

            {/* ═══ EVALUABLE SECTION ═══ */}
            <ArsenalDivider label="Viable & Worth Investigating" color={colors.pass} count={evaluable.length} />
            <div style={{
                maxWidth: spacing.pageMax, margin: '0 auto 2rem',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: spacing.sectionGap,
            }}>
                {evaluable.map(drug => (
                    <DrugCard key={drug.drug_name || drug.name} drug={drug} isQuarantined={false} />
                ))}
            </div>

            {/* ═══ QUARANTINE WALL ═══ */}
            <div style={{
                maxWidth: spacing.pageMax, margin: '3rem auto 0',
                padding: '1.25rem 2rem', borderRadius: radii.inner,
                background: colors.bgMuted, border: `1px solid ${colors.borderMuted}`,
                textAlign: 'center',
            }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    🚫 Quarantined — Not Viable at Any Safe Dose
                </div>
                <p style={{ fontSize: '0.82rem', color: '#9ca3af', margin: '0.4rem 0 0', fontWeight: 400 }}>
                    These drugs cannot reach effective concentrations safely. They are shown for transparency, not consideration.
                </p>
            </div>

            {/* ═══ QUARANTINED CARDS ═══ */}
            <div style={{
                maxWidth: spacing.pageMax, margin: '1.5rem auto 2rem',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: spacing.sectionGap,
            }}>
                {quarantined.map(drug => (
                    <DrugCard key={drug.drug_name || drug.name} drug={drug} isQuarantined={true} />
                ))}
            </div>

            {/* ═══ BOTTOM CTA ═══ */}
            {(topPass || topConditional) && (
                <div style={{
                    maxWidth: '700px', margin: '3rem auto 0',
                    padding: '1.5rem 2rem', borderRadius: radii.section,
                    background: colors.bgCard, border: `1px solid ${colors.border}`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: colors.text, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📋 Bring to Your Oncologist
                    </div>
                    <p style={{ ...typography.body, color: colors.textTer, margin: '0 0 0.75rem' }}>
                        {topPass && (
                            <><strong style={{ color: colors.pass }}>{topPass.name || topPass.drug_name}</strong> (Viable)</>
                        )}
                        {topPass && topConditional && ' + '}
                        {topConditional && (
                            <><strong style={{ color: colors.cond }}>{topConditional.name || topConditional.drug_name}</strong> (Investigate)</>
                        )}
                        {' '}are the highest-priority candidates based on the pharmacology analysis.
                    </p>
                    <p style={{ fontSize: '0.78rem', color: colors.caption, margin: 0 }}>
                        This is not a recommendation — it is a data-driven starting point for a conversation with your care team.
                    </p>
                </div>
            )}

            {/* ═══ PROVENANCE FOOTER ═══ */}
            <div style={{
                maxWidth: spacing.pageMax, margin: '4rem auto 0', padding: '2rem 0',
                borderTop: `1px solid ${colors.border}`,
                display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap',
            }}>
                {[
                    `${meta.engine || 'SPE'} v${meta.version || '2.0'}`,
                    `${total} drug candidates`,
                    `${stats.pmids} PMID citations`,
                    'Zeta-Verification active 🔱',
                ].map(t => (
                    <span key={t} style={{ ...typography.provenance, color: colors.caption }}>{t}</span>
                ))}
            </div>
        </div>
    );
};

export default RepurposingArsenalPage;
