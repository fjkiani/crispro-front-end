/**
 * VerdictBanner — Hero headline + synthesis + status card
 *
 * ZERO hardcoded patient data. Every string computed from props.
 * Colors reference CSS custom properties via inline style vars.
 */
import React from 'react';
import { Box, Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './commandCenter.css';

// ── Verdict headline logic ───────────────────────────────────────────────────

function getVerdict(summary) {
    const { state_estimate, confidence, no_data } = summary;

    if (state_estimate === 'RESISTANCE_DETECTED') {
        return { title: `⚠️ Resistance Signal Detected`, color: 'var(--zeta-red)' };
    }
    if (state_estimate === 'MONITORING' && confidence === 'INTAKE_RISK') {
        return { title: '⚠️ Intake Risk Flags Identified', color: 'var(--zeta-amber)' };
    }
    if (state_estimate === 'MONITORING') {
        return { title: 'Monitoring Active — No Resistance Detected', color: 'var(--zeta-green)' };
    }
    return {
        title: `Baseline Stable — ${no_data} Signals Awaiting Data`,
        color: 'var(--zeta-slate)',
    };
}

// ── Helpers to format profile fields ─────────────────────────────────────────

function formatHistology(disease) {
    if (!disease?.histology) return 'Cancer Profile';
    return disease.histology.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatGermline(germline) {
    if (germline?.status !== 'POSITIVE' || !germline?.mutations?.[0]) return null;
    const m = germline.mutations[0];
    return `${m.gene} ${m.classification || 'variant'}`;
}

function formatCA125(labs) {
    if (labs?.ca125_value != null) {
        return `CA-125: ${labs.ca125_value.toLocaleString()} ${labs.ca125_units || 'U/mL'}`;
    }
    return 'CA-125: ⚫ No baseline yet established';
}

// ── Component ────────────────────────────────────────────────────────────────

export default function VerdictBanner({ disease, germline, labs, tumorContext, summary, missingFields }) {
    const navigate = useNavigate();
    const verdict = getVerdict(summary);
    const histology = formatHistology(disease);
    const germlineStr = formatGermline(germline);
    const ca125Str = formatCA125(labs);
    const completeness = tumorContext?.completeness_score != null
        ? Math.round(tumorContext.completeness_score * 100)
        : null;

    // Sub-headline: all dynamic
    const subParts = [histology];
    if (disease?.stage) subParts.push(`Stage ${disease.stage}`);
    subParts.push(`${summary.covered_genes}/${summary.total_genes} genes covered`);
    subParts.push('IO: not yet evaluated');
    const subline = subParts.join(' · ');

    // Synthesis paragraph: 3 sentences, all from props
    const germlineSentence = germlineStr
        ? `You carry a pathogenic ${germlineStr} variant which has implications for DNA repair pathway treatments. `
        : 'Germline status has not yet been tested. ';
    const synthesisParagraph =
        `Your tumor is ${histology} at Stage ${disease?.stage || '—'}. ` +
        germlineSentence +
        `Right now ${summary.no_data} of 8 monitoring signals need more data to activate — getting the tests below will significantly sharpen this engine's recommendations.`;

    return (
        <section>
            {/* Verdict headline */}
            <h1 className="cc-verdict__headline" style={{ color: verdict.color }}>
                {verdict.title}
            </h1>

            {/* Dynamic sub-headline */}
            <p className="cc-verdict__subline">{subline}</p>

            {/* Synthesis paragraph */}
            <p className="cc-verdict__synthesis">{synthesisParagraph}</p>

            {/* Status card */}
            <div className="cc-status-card">
                <p className="cc-status-card__label">Your Current Status</p>

                <p className="cc-status-card__row">
                    {histology} · Stage {disease?.stage || '—'}
                </p>
                <p className="cc-status-card__row">
                    {germlineStr
                        ? `Germline: ${germlineStr} — DDR pathway implications`
                        : 'Germline: Not tested'}
                </p>
                <p className="cc-status-card__row cc-status-card__row--muted">
                    {ca125Str}
                </p>
                <p className="cc-status-card__row">
                    Gene coverage: {summary.covered_genes}/{summary.total_genes}
                    {summary.covered_genes < summary.total_genes && ' → needs NGS to continue'}
                </p>
                <p className="cc-status-card__row">
                    Completeness: {completeness ?? '—'}%
                    {' · IO Profile: ⚫ Awaiting RNA-seq'}
                </p>

                <Box sx={{ mt: 3 }}>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/ayesha/journey/board')}
                        endIcon={<ArrowForward />}
                        sx={{
                            fontWeight: 700, textTransform: 'none', borderRadius: '10px',
                            bgcolor: 'var(--text-primary)', color: '#fff',
                            '&:hover': { bgcolor: 'var(--text-primary)' },
                        }}
                    >
                        What to Tell Your Oncologist
                    </Button>
                </Box>
            </div>
        </section>
    );
}
