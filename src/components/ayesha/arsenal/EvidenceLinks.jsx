/**
 * EvidenceLinks — PMID and NCT chip links.
 * Used by: DrugCard Tier 3, ArsenalDrugDetailPage Evidence section.
 */
import React from 'react';
import { colors, radii, typography } from './arsenalTokens';

const chipStyle = (type) => ({
    padding: '0.15rem 0.5rem',
    borderRadius: radii.badge,
    ...typography.captionSm,
    textDecoration: 'none',
    background: type === 'pmid' ? colors.infoBg : colors.successBg,
    color: type === 'pmid' ? colors.infoText : colors.successText,
    border: `1px solid ${type === 'pmid' ? colors.infoBorder : colors.successBorder}`,
});

const chipStyleLg = (type) => ({
    ...chipStyle(type),
    padding: '0.2rem 0.6rem',
    fontSize: '0.78rem',
});

const EvidenceLinks = ({ pubmedIds, trialIds, size = 'sm', stopPropagation = false }) => {
    const hasPmids = pubmedIds?.length > 0;
    const hasTrials = trialIds?.length > 0;
    if (!hasPmids && !hasTrials) return null;
    const isLg = size === 'lg';
    const style = isLg ? chipStyleLg : chipStyle;

    const onClick = stopPropagation ? (e) => e.stopPropagation() : undefined;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: isLg ? '1rem' : '0.75rem' }}>
            {hasPmids && (
                <div>
                    <div style={{
                        ...typography.captionSm, color: colors.caption,
                        marginBottom: isLg ? '0.4rem' : '0.3rem',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                        Peer-Reviewed Sources ({pubmedIds.length})
                    </div>
                    <div style={{ display: 'flex', gap: isLg ? '0.4rem' : '0.3rem', flexWrap: 'wrap' }}>
                        {pubmedIds.map((pmid, i) => (
                            <a
                                key={i}
                                href={`https://pubmed.ncbi.nlm.nih.gov/${pmid.replace('PMID:', '').replace('PMC', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={style('pmid')}
                                onClick={onClick}
                            >
                                {pmid}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {hasTrials && (
                <div>
                    <div style={{
                        ...typography.captionSm, color: colors.caption,
                        marginBottom: isLg ? '0.4rem' : '0.3rem',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                        Clinical Trials ({trialIds.length})
                    </div>
                    <div style={{ display: 'flex', gap: isLg ? '0.4rem' : '0.3rem', flexWrap: 'wrap' }}>
                        {trialIds.map((nct, i) => (
                            <a
                                key={i}
                                href={`https://clinicaltrials.gov/study/${nct}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={style('nct')}
                                onClick={onClick}
                            >
                                {nct}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EvidenceLinks;
