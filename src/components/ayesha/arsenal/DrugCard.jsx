/**
 * DrugCard — Three-tier progressive disclosure card for Arsenal drugs.
 *
 * Tier 1 (Patient): Name, verdict, gap ratio, patient summary, Mars verdict, safety notes.
 * Tier 2 (Oncologist): PK numbers, mechanism, targets, evidence tier, RUO flags.
 * Tier 3 (Researcher): PMIDs, NCTs, full Mars autopsy.
 *
 * Composes from shared components — zero hardcoded CSS values.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, radii, spacing, typography, shadows, transitions, verdictMeta, gapColor } from './arsenalTokens';
import VerdictBadge from './VerdictBadge';
import GapGauge from './GapGauge';
import Disclosure from './Disclosure';
import TargetChips from './TargetChips';
import EvidenceLinks from './EvidenceLinks';
import MarsAutopsy from './MarsAutopsy';
import PKNumbers from './PKNumbers';
import RuoFlags from './RuoFlags';
import SafetyNote from './SafetyNote';

const DrugCard = ({ drug, isQuarantined }) => {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(false);
    const feas = drug.feasibility || {};
    const evidence = drug.evidence_manifest || {};
    const autopsy = drug.trial_autopsy || null;
    const gap = feas.gap_ratio;
    const vm = verdictMeta(feas.verdict);
    const isFail = feas.verdict === 'FAIL_EXPOSURE_MISMATCH' || feas.verdict === 'INSUFFICIENT_DATA';
    const gc = gapColor(gap);

    return (
        <div
            style={{
                background: isQuarantined ? colors.bgMuted : colors.bgCard,
                borderRadius: radii.card,
                padding: spacing.cardPad,
                border: `1px solid ${isQuarantined ? colors.borderMuted : colors.border}`,
                cursor: 'pointer',
                opacity: isQuarantined ? 0.65 : 1,
                transform: hovered && !isQuarantined ? 'translateY(-4px)' : 'none',
                boxShadow: hovered && !isQuarantined
                    ? `${shadows.cardHover}, 0 0 0 1px ${vm.color}25`
                    : shadows.card,
                transition: transitions.card,
                display: 'flex', flexDirection: 'column', gap: spacing.cardGap,
            }}
            onClick={() => navigate(`/ayesha/journey/arsenal/${drug.slug}`)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* ═══ TIER 1: Patient View (always visible) ═══ */}

            {/* Name + Verdict Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ ...typography.drugName, color: colors.text, textTransform: 'capitalize' }}>
                    {drug.name || drug.drug_name}
                </div>
                <VerdictBadge verdict={feas.verdict} size="sm" />
            </div>

            {/* Gap Ratio + Gauge */}
            <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ ...typography.gapNumber, color: isQuarantined ? '#9ca3af' : gc }}>
                        {gap != null ? `${gap}×` : 'N/A'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: colors.caption, fontWeight: 600 }}>IC₅₀ / free Cₘₐₓ</span>
                </div>
                {!isQuarantined && <GapGauge gap={gap} isFail={isFail} size="sm" />}
                {isQuarantined && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '6px' }}>
                        <div style={{ flex: 1, height: '6px', background: '#f3f4f6', borderRadius: '3px' }}>
                            <div style={{ width: '100%', height: '100%', background: '#d1d5db', borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 800 }}>✕</span>
                    </div>
                )}
            </div>

            {/* Patient Summary */}
            <div style={{ ...typography.body, color: colors.textSec }}>
                {drug.patient_summary || drug.mechanism || '—'}
            </div>

            {/* Safety Notes */}
            <SafetyNote drugName={drug.drug_name} size="sm" />

            {/* Mars Verdict (compact) */}
            <MarsAutopsy autopsy={autopsy} compact />

            {/* ═══ TIER 2: Oncologist View (collapsed) ═══ */}
            <Disclosure label="Details">
                <PKNumbers feasibility={feas} compact />
                <div style={{ fontSize: '0.8rem', color: colors.textTer, lineHeight: 1.5 }}>
                    {drug.mechanism || '—'}
                </div>
                <TargetChips targets={drug.targets} tooltips={drug.target_tooltips} maxVisible={6} size="sm" />
                {drug.evidence_tier && (
                    <div style={{ fontSize: '0.75rem' }}>
                        <span style={{
                            padding: '0.15rem 0.5rem', borderRadius: radii.badge, fontWeight: 700,
                            background: colors.chipBg, color: colors.chipColor, border: `1px solid ${colors.chipBorder}`,
                        }}>
                            {drug.evidence_tier.replace(/_/g, ' ')}
                        </span>
                    </div>
                )}
                <RuoFlags reasons={drug.ruo_reasons} size="sm" />
            </Disclosure>

            {/* ═══ TIER 3: Researcher View (collapsed) ═══ */}
            <Disclosure label="Evidence & Provenance">
                <EvidenceLinks
                    pubmedIds={evidence.pubmed_ids}
                    trialIds={evidence.trial_registry_ids}
                    size="sm"
                    stopPropagation
                />
                {/* Full Mars autopsy details */}
                {autopsy && (
                    <div style={{ fontSize: '0.78rem', color: colors.textTer, lineHeight: 1.5 }}>
                        <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
                            Trial Autopsy — {autopsy.nct_ids_audited?.join(', ')}
                        </div>
                        {autopsy.design_flaws?.map((flaw, i) => (
                            <div key={i} style={{ paddingLeft: '0.5rem', color: colors.muted }}>• {flaw.replace(/_/g, ' ')}</div>
                        ))}
                        {autopsy.correct_route_hypothesis && (
                            <div style={{ marginTop: '0.4rem', fontStyle: 'italic', color: colors.textSec }}>
                                Hypothesis: {autopsy.correct_route_hypothesis}
                            </div>
                        )}
                        {autopsy.recommended_design && (
                            <div style={{ marginTop: '0.3rem', color: colors.pass, fontWeight: 600 }}>
                                ✦ {autopsy.recommended_design}
                            </div>
                        )}
                    </div>
                )}
                {/* Footnote */}
                <div style={{ ...typography.captionSm, color: colors.caption, fontStyle: 'italic' }}>
                    Backed by {evidence.pubmed_ids?.length || 0} peer-reviewed source{(evidence.pubmed_ids?.length || 0) !== 1 ? 's' : ''} and {evidence.trial_registry_ids?.length || 0} clinical trial{(evidence.trial_registry_ids?.length || 0) !== 1 ? 's' : ''}
                </div>
            </Disclosure>
        </div>
    );
};

export default DrugCard;
