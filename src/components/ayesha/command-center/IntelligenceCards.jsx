/**
 * IntelligenceCards — 4-up journey deep dive cards
 *
 * Each card teaser is 100% computed from props.
 * Arsenal card uses real counts from useRepurposingArsenal (passed as arsenalCounts).
 * Colors via CSS custom properties.
 */
import React from 'react';
import { Grid } from '@mui/material';
import { Biotech, FlashOn, Science, Timeline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './commandCenter.css';

// ── Build card configs from props ────────────────────────────────────────────

function buildCards({ disease, germline, labs, summary, arsenalCounts }) {
    const germlineStr = germline?.status === 'POSITIVE' && germline?.mutations?.[0]
        ? `${germline.mutations[0].gene} ${germline.mutations[0].classification || 'variant'} detected`
        : 'Germline: Not tested';

    const arsenalTeaser = arsenalCounts.total > 0
        ? `${arsenalCounts.viable} viable · ${arsenalCounts.investigate} investigate · ${arsenalCounts.quarantined} quarantined`
        : 'Computing off-label feasibility...';

    const ca125Str = labs?.ca125_value != null
        ? `CA-125: ${labs.ca125_value.toLocaleString()} ${labs.ca125_units || 'U/mL'}`
        : 'CA-125: not yet logged';

    const ctdnaStr = 'ctDNA: not yet ordered';

    return [
        {
            icon: Biotech,
            label: 'Treatment Fit',
            teaser: germlineStr,
            cta: 'View Treatment Options →',
            route: '/ayesha/journey/treatment',
            accentVar: '--zeta-purple',
            bgVar: '--zeta-purple-light',
        },
        {
            icon: FlashOn,
            label: 'Repurposing Arsenal',
            teaser: arsenalTeaser,
            cta: 'View Arsenal →',
            route: '/ayesha/phases/repurposing-arsenal',
            accentVar: '--zeta-green',
            bgVar: '--zeta-green-light',
        },
        {
            icon: Science,
            label: 'Clinical Trials',
            teaser: `${summary.covered_genes}/${summary.total_genes} genes covered — ${summary.total_genes - summary.covered_genes} more unlock trial matches`,
            cta: 'Explore Trials →',
            route: '/ayesha/journey/test/rna_expression',
            accentVar: '--zeta-blue',
            bgVar: '--zeta-blue-light',
        },
        {
            icon: Timeline,
            label: 'Monitoring',
            teaser: `${ca125Str} · ${ctdnaStr}`,
            cta: 'Set Up Monitoring →',
            route: '/ayesha/journey/monitoring',
            accentVar: '--zeta-cyan',
            bgVar: '--zeta-cyan-light',
        },
    ];
}

// ── Component ────────────────────────────────────────────────────────────────

export default function IntelligenceCards({ disease, germline, labs, summary, arsenalCounts }) {
    const navigate = useNavigate();
    const cards = buildCards({ disease, germline, labs, summary, arsenalCounts });

    return (
        <section>
            <h2 className="cc-section-title">Intelligence Deep Dives</h2>
            <Grid container spacing={3}>
                {cards.map(c => {
                    const accentColor = `var(${c.accentVar})`;
                    const bgColor = `var(${c.bgVar})`;
                    return (
                        <Grid item xs={12} sm={6} md={3} key={c.label}>
                            <div
                                className="cc-intel-card"
                                onClick={() => navigate(c.route)}
                                style={{
                                    '--_hover-shadow': `0 8px 24px color-mix(in srgb, ${accentColor} 15%, transparent)`,
                                    '--_hover-border': accentColor,
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.boxShadow = `0 8px 24px color-mix(in srgb, var(${c.accentVar}) 15%, transparent)`;
                                    e.currentTarget.style.borderColor = `var(${c.accentVar})`;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.boxShadow = '';
                                    e.currentTarget.style.borderColor = '';
                                }}
                            >
                                <div
                                    className="cc-intel-card__icon-wrap"
                                    style={{ background: bgColor }}
                                >
                                    <c.icon style={{ color: accentColor, fontSize: 24 }} />
                                </div>
                                <p className="cc-intel-card__title">{c.label}</p>
                                <p className="cc-intel-card__teaser">{c.teaser}</p>
                                <p className="cc-intel-card__cta" style={{ color: accentColor }}>
                                    {c.cta}
                                </p>
                            </div>
                        </Grid>
                    );
                })}
            </Grid>
        </section>
    );
}
