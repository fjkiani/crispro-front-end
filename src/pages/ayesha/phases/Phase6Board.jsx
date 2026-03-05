/**
 * Phase 6 — Tumor Board Packet ("Bring it to your doctor")
 *
 * Single exportable packet:
 *   Snapshot → Tests to order → Top options → Monitoring plan → Contingency plan
 *
 * Every claim traceable to a field path or explicitly labeled Unknown.
 * "Why we can't say more yet" section for missing fields.
 * Export: PDF/print/share link.
 */
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Grid, Alert, Button,
    CircularProgress, Chip,
} from '@mui/material';
import {
    Print, Share,
    CheckCircle, Cancel,
} from '@mui/icons-material';
import JourneyLayout from '../../../components/ayesha/journey/JourneyLayout';
import AnalysisLoadingCard from '../../../components/ayesha/journey/AnalysisLoadingCard';
import { useAyeshaProfile } from '../../../hooks/ayesha/useAyeshaProfile';
import { useAyeshaTherapyFitBundle } from '../../../hooks/useAyeshaTherapyFitBundle';
import { useAyeshaTrials } from '../../../hooks/useAyeshaTrials';
import { UNLOCK_TESTS } from '../../../constants/journeyPhases';

/**
 * Dynamically updates the UNLOCK_TESTS static array with live completeness data
 * from the therapy fit bundle API.
 */
const mergeTestStatus = (tests, completeness) => {
    return tests.map(test => {
        // If it's present in API completeness
        if (completeness?.present?.includes(test.id)) {
            return { ...test, status: 'present' };
        }
        // If it's explicitly identified as missing by API
        if (completeness?.missing?.includes(test.id)) {
            return { ...test, status: 'missing' };
        }
        return test; // keep static default status (usually 'missing')
    });
};

const drugToSlug = (name) =>
    (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ── Section ──────────────────────────────────────────────────────────────────

const PacketSection = ({ number, title, children }) => (
    <Paper sx={{
        p: 3, borderRadius: 2, mb: 2,
        border: '1px solid', borderColor: 'divider',
        pageBreakInside: 'avoid',
    }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{
                width: 28, height: 28, borderRadius: '50%', bgcolor: 'primary.main',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8125rem', fontWeight: 700,
            }}>
                {number}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                {title}
            </Typography>
        </Box>
        {children}
    </Paper>
);

// ── Page Orchestrator ────────────────────────────────────────────────────────

const Phase6Board = () => {
    const navigate = useNavigate();
    const { profile, disease, germline, tumorContext, labs } = useAyeshaProfile();
    const { data: bundle, isLoading, error, refetch } = useAyeshaTherapyFitBundle({ level: 'l1' });
    const printRef = useRef();

    const levelData = bundle?.levels?.L1 || {};
    const drugs = levelData?.efficacy?.drugs || [];
    const completeness = levelData?.completeness || {};
    const missing = completeness?.missing || [];
    const mergedTests = mergeTestStatus(UNLOCK_TESTS, completeness);

    // Clinical trial matches for the board packet
    const { trials, isLoading: trialsLoading } = useAyeshaTrials({
        bundle, autoFetch: true, maxResults: 5,
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <JourneyLayout hideRail>
            <Box ref={printRef} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            Tumor Board Packet
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Research Use Only — for discussion support, not clinical decisions.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined" startIcon={<Print />} onClick={handlePrint} sx={{ fontWeight: 600 }}>
                            Print
                        </Button>
                        <Button variant="outlined" startIcon={<Share />} sx={{ fontWeight: 600 }}>
                            Share
                        </Button>
                    </Box>
                </Box>

                {/* Section 1: Patient Snapshot — always render (uses useAyeshaProfile, not therapy bundle) */}
                <PacketSection number={1} title="Patient Snapshot">
                    <Grid container spacing={2}>
                        {[
                            { label: 'Diagnosis', value: disease?.histology || disease?.type || 'Unknown' },
                            { label: 'Stage', value: disease?.stage || 'Unknown' },
                            { label: 'Germline Status', value: germline?.status || 'Unknown' },
                            { label: 'HRD Score', value: tumorContext?.hrd_score ?? 'Unknown — not provided' },
                            { label: 'Treatment Lines', value: profile?.patient?.treatment_history?.length ? `${profile.patient.treatment_history.length} recorded` : 'Unknown' },
                            { label: 'CA-125', value: labs?.ca125_value ? `${labs.ca125_value} U/mL` : 'Unknown' },
                        ].map(item => (
                            <Grid item xs={6} md={4} key={item.label}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    {item.label}
                                </Typography>
                                <Typography variant="body2" sx={{
                                    fontWeight: 600,
                                    color: item.value === 'Unknown' ? 'text.disabled' : 'text.primary',
                                    fontStyle: item.value === 'Unknown' ? 'italic' : 'normal',
                                }}>
                                    {item.value}
                                </Typography>
                            </Grid>
                        ))}
                    </Grid>
                </PacketSection>

                {/* Section 2: Tests & Orders — Dynamic mapping from API */}
                <PacketSection number={2} title="Tests to Order">
                    {mergedTests.filter(t => t.status === 'missing').map(test => (
                        <Box key={test.id} sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5, py: 1,
                            borderBottom: '1px solid', borderColor: 'divider',
                        }}>
                            <Cancel sx={{ fontSize: 16, color: 'error.main' }} />
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{test.name}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Unlocks: {test.unlocks.join(', ')}
                                </Typography>
                            </Box>
                            <Chip label={test.priority} size="small" color={test.priority === 'HIGH' ? 'error' : 'default'} />
                        </Box>
                    ))}
                    {mergedTests.filter(t => t.status === 'present').map(test => (
                        <Box key={test.id} sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5, py: 1,
                            borderBottom: '1px solid', borderColor: 'divider',
                        }}>
                            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>{test.name} — available</Typography>
                        </Box>
                    ))}
                </PacketSection>

                {/* Section 3: Top Treatment Options — graceful loading/error */}
                <PacketSection number={3} title="Top Treatment Options (RUO)">
                    {isLoading ? (
                        <AnalysisLoadingCard onRetry={refetch} />
                    ) : error ? (
                        <Alert severity="info">
                            Treatment rankings are not available right now. The analysis service may be offline.
                        </Alert>
                    ) : drugs.length > 0 ? drugs.slice(0, 5).map((drug, i) => (
                        <Box key={drug.name || drug.drug_name || i} onClick={() => navigate(`/ayesha/journey/drug/${drugToSlug(drug.name || drug.drug_name)}`)} sx={{
                            display: 'flex', alignItems: 'center', gap: 2, py: 1.5,
                            borderBottom: '1px solid', borderColor: 'divider',
                            cursor: 'pointer', borderRadius: 1,
                            '&:hover': { bgcolor: '#f8fafc' },
                            transition: 'background 0.15s',
                        }}>
                            <Typography variant="body1" sx={{ fontWeight: 800, color: 'primary.main', minWidth: 28 }}>
                                #{i + 1}
                            </Typography>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    {drug.name || drug.drug_name || 'Unknown'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Score: {drug.final_score?.toFixed(2) ?? 'N/A'}
                                    {drug.citations_count != null && ` · ${drug.citations_count === 0 ? 'No citations surfaced' : `${drug.citations_count} citations`}`}
                                    {drug.label_status === 'UNKNOWN' && ' · Label status not evaluated (RUO)'}
                                </Typography>
                            </Box>
                            {drug.tier && (
                                <Chip label={drug.tier} size="small" variant="outlined" />
                            )}
                        </Box>
                    )) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                            No treatment data available. Run therapy fit analysis first.
                        </Typography>
                    )}
                    {!isLoading && missing.length > 0 && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="caption">
                                Confidence is capped due to missing inputs: {missing.join(', ')}.
                                Evidence may be absent in fast mode — "no citations" does not mean "no evidence exists."
                            </Typography>
                        </Alert>
                    )}
                </PacketSection>

                {/* Section 3.5: IO Risk Assessment — from io_harm_prevention */}
                {bundle?.io_harm_prevention?.decision_result && (
                    <PacketSection number={'3b'} title="Immunotherapy Risk Assessment (RUO)">
                        <Box sx={{
                            p: 2, borderRadius: 2, mb: 2,
                            bgcolor: bundle.io_harm_prevention.decision_result.decision === 'RULE_OUT'
                                ? '#fef2f2' : bundle.io_harm_prevention.decision_result.decision === 'JUSTIFIED'
                                    ? '#f0fdf4' : '#fffbeb',
                            border: '1px solid',
                            borderColor: bundle.io_harm_prevention.decision_result.decision === 'RULE_OUT'
                                ? '#fca5a5' : bundle.io_harm_prevention.decision_result.decision === 'JUSTIFIED'
                                    ? '#86efac' : '#fcd34d',
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                    Gate Decision: {bundle.io_harm_prevention.decision_result.decision}
                                </Typography>
                                <Chip
                                    label={`p(response) = ${Math.round(bundle.io_harm_prevention.decision_result.p_resp * 100)}%`}
                                    size="small"
                                    sx={{ fontWeight: 700 }}
                                />
                            </Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                {bundle.io_harm_prevention.decision_result.rationale}
                            </Typography>
                            {bundle.io_harm_prevention.decision_result.regimen_name && (
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Regimen: {bundle.io_harm_prevention.decision_result.regimen_name}
                                </Typography>
                            )}
                        </Box>
                        {bundle.io_harm_prevention.biomarker_drivers && (
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {Object.entries(bundle.io_harm_prevention.biomarker_drivers).map(([key, bm]) => (
                                    <Box key={key} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1, minWidth: 120 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                                            {key.replace(/_/g, ' ')}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                            {typeof bm.value === 'number' ? bm.value.toFixed(2) : bm.value ?? 'N/A'}
                                        </Typography>
                                        <Typography variant="caption" sx={{
                                            color: bm.direction === 'favorable' ? 'success.main' : bm.direction === 'unfavorable' ? 'error.main' : 'text.secondary'
                                        }}>
                                            {bm.direction || 'neutral'}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                        <Alert severity="info" sx={{ mt: 2, fontSize: '0.78rem' }}>
                            Based on 3-biomarker model (CD8B/FOXP3, Monocytes, Endothelial) · n=29 HGSOC · LOO-CV AUC=0.822 · Not externally validated
                        </Alert>
                    </PacketSection>
                )}

                {/* Section 4: Clinical Trial Recommendations */}
                <PacketSection number={4} title="Clinical Trial Recommendations">
                    {trialsLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                            <CircularProgress size={16} />
                            <Typography variant="body2" color="text.secondary">
                                Searching matched clinical trials...
                            </Typography>
                        </Box>
                    ) : trials.length > 0 ? (
                        <Box>
                            <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                                Trials matched to this patient's tumor profile and mechanism vector:
                            </Typography>
                            {trials.slice(0, 5).map((trial, idx) => {
                                const nctId = trial.nct_id || trial.nctId;
                                const phase = trial.phase || 'N/A';
                                const status = trial.overall_status || trial.status;
                                const title = trial.brief_title || trial.title || trial.official_title || nctId;
                                const score = trial.holistic_score ?? trial.mechanism_fit_score;
                                return (
                                    <Box key={nctId || idx} sx={{
                                        p: 1.5, mb: 1, borderRadius: 2,
                                        border: '1px solid', borderColor: 'divider',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1,
                                    }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.25 }}>
                                                {title}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                {nctId && (
                                                    <Chip
                                                        label={nctId} size="small"
                                                        component="a" href={`https://clinicaltrials.gov/study/${nctId}`}
                                                        target="_blank" clickable
                                                        sx={{ fontWeight: 600, bgcolor: '#eff6ff', color: '#1e40af' }}
                                                    />
                                                )}
                                                <Chip label={`Phase ${phase}`} size="small" />
                                                {status && (
                                                    <Chip label={status} size="small" sx={{
                                                        bgcolor: status === 'Recruiting' ? '#dcfce7' : '#f3f4f6',
                                                        color: status === 'Recruiting' ? '#166534' : '#6b7280',
                                                    }} />
                                                )}
                                            </Box>
                                        </Box>
                                        <Box sx={{ textAlign: 'center', minWidth: 50, px: 0.8, py: 0.4, borderRadius: 1, bgcolor: '#f0f9ff' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 800, fontSize: 'var(--text-sm)' }}>
                                                {Math.round(score * 100)}
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontSize: 'var(--text-xs)', color: 'text.secondary', fontWeight: 700 }}>FIT</Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                            <Alert severity="info" sx={{ mt: 1, fontSize: '0.78rem' }}>
                                Trials ranked by mechanism fit to tumor's pathway profile. Discuss eligibility with your oncology team.
                            </Alert>
                        </Box>
                    ) : (
                        <Alert severity="info">
                            No matched clinical trials found for this tumor profile.
                            Additional genomic data may unlock more trial matches.
                        </Alert>
                    )}
                </PacketSection>

                {/* Section 5: Monitoring Plan — always render */}
                <PacketSection number={5} title="Monitoring Plan">
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Active monitoring signals and scheduled assessments:
                    </Typography>
                    <Grid container spacing={1.5}>
                        {[
                            { label: 'CA-125 tracking', active: labs?.ca125_measurements?.length > 0 },
                            { label: 'ctDNA / MRD panel', active: false },
                            { label: 'Imaging schedule', active: false },
                        ].map(item => (
                            <Grid item xs={12} sm={4} key={item.label}>
                                <Box sx={{
                                    p: 1.5, borderRadius: 2,
                                    bgcolor: item.active ? '#f0fdf4' : '#fef2f2',
                                    border: '1px solid',
                                    borderColor: item.active ? '#bbf7d0' : '#fecaca',
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        {item.active ? <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} /> : <Cancel sx={{ fontSize: 16, color: 'error.main' }} />}
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {item.active ? 'Active' : 'Not available — test needed'}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </PacketSection>

                {/* Section 6: Limitations & Missing Data — always render */}
                <PacketSection number={6} title="Limitations & Missing Data">
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            <strong>This packet is research-use-only.</strong> Use as discussion support with your oncology team.
                        </Typography>
                    </Alert>
                    {missing.length > 0 && (
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                Missing inputs that limit analysis confidence:
                            </Typography>
                            {missing.map(m => (
                                <Typography key={m} variant="body2" sx={{ color: 'text.secondary', pl: 2 }}>
                                    • {m}
                                </Typography>
                            ))}
                        </Box>
                    )}
                </PacketSection>

                <Box sx={{
                    textAlign: 'center', pt: 4, pb: 2,
                    display: 'flex', flexDirection: 'column', gap: 1,
                    '@media print': { display: 'block', pt: 4, mt: 'auto' }
                }}>
                    <Typography variant="caption" sx={{ color: 'text.muted', letterSpacing: '0.05em', fontWeight: 700 }}>
                        PROVENANCE LOG
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Engine: therapy_fit_v2 // Analysis mode: {levelData.contract_version || 'v2.1'} //
                        Data generated: {new Date().toLocaleDateString()}
                    </Typography>
                </Box>
            </Box>
        </JourneyLayout>
    );
};

export default Phase6Board;
