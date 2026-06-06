/**
 * ArsenalDrugDetailPage — Detail view for repurposed drugs.
 * Route: /ayesha/journey/arsenal/:slug
 *
 * Pure composition — each section is a standalone component.
 * All data comes from useRepurposingArsenal hook (client-side JSON fallback).
 *
 * 🔱 ZETA: Patient-first layout. White mode.
 */
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useRepurposingArsenal from '../../../hooks/ayesha/useRepurposingArsenal';
import { colors, radii, spacing, typography } from '../../../components/ayesha/arsenal/arsenalTokens';
import TargetChips from '../../../components/ayesha/arsenal/TargetChips';
import EvidenceLinks from '../../../components/ayesha/arsenal/EvidenceLinks';
import RuoFlags from '../../../components/ayesha/arsenal/RuoFlags';
import Disclosure from '../../../components/ayesha/arsenal/Disclosure';

// Section-level components
import DrugHero from '../../../components/ayesha/arsenal/detail/DrugHero';
import GapAnalysis from '../../../components/ayesha/arsenal/detail/GapAnalysis';
import PathwayRadar from '../../../components/ayesha/arsenal/detail/PathwayRadar';
import BiomarkerFit from '../../../components/ayesha/arsenal/detail/BiomarkerFit';
import ClinicalRationale from '../../../components/ayesha/arsenal/detail/ClinicalRationale';
import OutcomeSummaries from '../../../components/ayesha/arsenal/detail/OutcomeSummaries';
import TrialAutopsyFull from '../../../components/ayesha/arsenal/detail/TrialAutopsyFull';
import DecisionLogic from '../../../components/ayesha/arsenal/detail/DecisionLogic';

/* ── Inline section wrapper for remaining simple sections ─────────────── */
const Section = ({ title, children }) => (
    <div style={{
        background: colors.bgCard, borderRadius: radii.section,
        border: `1px solid ${colors.border}`, padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    }}>
        <h3 style={{ ...typography.sectionTitle, color: colors.caption, margin: '0 0 1rem' }}>
            {title}
        </h3>
        {children}
    </div>
);

export default function ArsenalDrugDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { drugs, loading, error } = useRepurposingArsenal();

    const drug = useMemo(() => {
        if (!drugs?.length || !slug) return null;
        return drugs.find(d => d.slug === slug) || null;
    }, [drugs, slug]);

    /* Loading */
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: colors.muted, fontWeight: 600 }}>Loading…</p>
            </div>
        );
    }

    /* Not Found */
    if (error || !drug) {
        return (
            <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <div style={{ padding: '2rem', borderRadius: radii.section, background: colors.bgCard, border: `1px solid ${colors.border}`, textAlign: 'center', maxWidth: '500px' }}>
                    <p style={{ ...typography.drugName, color: colors.text, margin: '0 0 0.5rem' }}>Drug Not Found</p>
                    <p style={{ ...typography.body, color: colors.muted }}>"{slug}" was not found in the Repurposing Arsenal.</p>
                    <button onClick={() => navigate('/ayesha/journey/repurposing-arsenal')} style={{
                        marginTop: '1rem', padding: '0.5rem 1.5rem', borderRadius: radii.pill,
                        border: `1px solid ${colors.border}`, background: colors.bgCard,
                        cursor: 'pointer', fontWeight: 600, color: colors.blue,
                    }}>
                        ← Back to Arsenal
                    </button>
                </div>
            </div>
        );
    }

    const evidence = drug.evidence_manifest || {};

    return (
        <div style={{ minHeight: '100vh', background: colors.bg, padding: '2rem', fontFamily: "'Inter', -apple-system, sans-serif" }}>
            <div style={{ maxWidth: spacing.detailMax, margin: '0 auto' }}>

                {/* Back */}
                <button onClick={() => navigate('/ayesha/journey/repurposing-arsenal')} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0',
                    fontSize: '0.85rem', fontWeight: 600, color: colors.blue,
                    marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}>
                    ← Back to Arsenal
                </button>

                {/* ═══ SECTION COMPOSITION ═══ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    <DrugHero drug={drug} />

                    <GapAnalysis feasibility={drug.feasibility} />

                    <PathwayRadar pathways={drug.pathway_alignment} />

                    <BiomarkerFit
                        positive={drug.biomarkers_positive}
                        negative={drug.biomarkers_negative}
                    />

                    <ClinicalRationale
                        rationale={drug.rationale}
                        evidenceTier={drug.evidence_tier}
                    />

                    <OutcomeSummaries
                        outcomes={evidence.outcome_summaries}
                    />

                    <TrialAutopsyFull autopsy={drug.trial_autopsy} />

                    {/* Mechanism + Targets */}
                    <Section title="Mechanism of Action">
                        <p style={{ ...typography.bodyLg, color: colors.textSec, margin: '0 0 1rem' }}>
                            {drug.mechanism || '—'}
                        </p>
                        <TargetChips targets={drug.targets} tooltips={drug.target_tooltips} size="lg" />
                    </Section>

                    {/* Evidence Links */}
                    <Section title="Evidence Sources">
                        <EvidenceLinks
                            pubmedIds={evidence.pubmed_ids}
                            trialIds={evidence.trial_registry_ids}
                            size="lg"
                        />
                        {drug.ruo_reasons?.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <Disclosure label={`Research Use Only Flags (${drug.ruo_reasons.length})`}>
                                    <RuoFlags reasons={drug.ruo_reasons} size="lg" />
                                </Disclosure>
                            </div>
                        )}
                    </Section>

                    <DecisionLogic
                        rule={drug.kill_chain_rule}
                        action={drug.kill_chain_action}
                        verdict={drug.feasibility?.verdict}
                    />

                    {/* Disclaimer */}
                    <div style={{
                        padding: '1.25rem 1.5rem', borderRadius: radii.inner,
                        background: colors.bgCard, border: `1px solid ${colors.border}`, textAlign: 'center',
                    }}>
                        <p style={{ fontSize: '0.85rem', color: colors.caption, margin: 0 }}>
                            This is not a recommendation — it is a data-driven analysis. Discuss with your oncologist before any treatment decisions.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: `1px solid ${colors.border}`, textAlign: 'center' }}>
                    <p style={{ ...typography.provenance, color: colors.caption }}>
                        {drug?.sporadic_gates_provenance?.engine || 'therapy_fit'} · Run: {drug?.sporadic_gates_provenance?.run_id || '—'}
                    </p>
                </div>
            </div>
        </div>
    );
}
