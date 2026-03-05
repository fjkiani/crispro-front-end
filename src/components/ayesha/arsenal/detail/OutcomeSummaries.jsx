/**
 * OutcomeSummaries — Individual trial/study result cards.
 * Each card links to PubMed or ClinicalTrials.gov.
 * Flags artifacts (supraphysiological dosing, etc.)
 */
import React from 'react';
import { colors, radii, typography } from '../arsenalTokens';

const OutcomeCard = ({ outcome }) => {
    const isArtifact = outcome.type === 'in_vitro_artifact';
    const source = outcome.nct_id || outcome.pmid || outcome.source || 'Unknown';
    const isNCT = source.startsWith('NCT');
    const isPMID = /^\d+$/.test(source) || source.startsWith('PMC');
    const href = isNCT
        ? `https://clinicaltrials.gov/study/${source}`
        : isPMID
            ? `https://pubmed.ncbi.nlm.nih.gov/${source.replace('PMC', '')}`
            : null;

    return (
        <div style={{
            padding: '0.85rem 1rem', borderRadius: radii.pill,
            background: isArtifact ? '#fef2f2' : colors.bgSubtle,
            border: `1px solid ${isArtifact ? colors.errorBorder : colors.bgSubtle}`,
            display: 'flex', flexDirection: 'column', gap: '0.35rem',
        }}>
            {/* Source badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" style={{
                        fontSize: '0.78rem', fontWeight: 800, color: colors.blue,
                        textDecoration: 'none', fontFamily: 'monospace',
                    }}>
                        {source} ↗
                    </a>
                ) : (
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: colors.textSec, fontFamily: 'monospace' }}>
                        {source}
                    </span>
                )}
                {isArtifact && (
                    <span style={{
                        padding: '0.1rem 0.4rem', borderRadius: radii.badge,
                        fontSize: '0.68rem', fontWeight: 800, background: colors.errorBg,
                        color: colors.errorText, border: `1px solid ${colors.errorBorder}`,
                    }}>
                        ⚠️ ARTIFACT FLAG
                    </span>
                )}
            </div>

            {/* Summary */}
            <p style={{
                fontSize: '0.85rem', color: isArtifact ? colors.errorText : colors.textSec,
                lineHeight: 1.5, margin: 0, fontWeight: isArtifact ? 600 : 400,
            }}>
                {outcome.summary}
            </p>
        </div>
    );
};

const OutcomeSummaries = ({ outcomes }) => {
    if (!outcomes || outcomes.length === 0) return null;

    return (
        <div style={{
            background: colors.bgCard, borderRadius: radii.section,
            border: `1px solid ${colors.border}`, padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
            <h3 style={{ ...typography.sectionTitle, color: colors.caption, margin: '0 0 0.5rem' }}>
                Study Results ({outcomes.length})
            </h3>
            <p style={{ fontSize: '0.82rem', color: colors.muted, margin: '0 0 1rem', lineHeight: 1.4 }}>
                Individual trial and research outcomes backing this drug analysis.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {outcomes.map((o, i) => <OutcomeCard key={i} outcome={o} />)}
            </div>
        </div>
    );
};

export default OutcomeSummaries;
