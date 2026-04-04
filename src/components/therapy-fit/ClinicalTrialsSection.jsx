/**
 * ClinicalTrialsSection — matched clinical trials display.
 * Extracted from Phase3Treatment (lines 222-342).
 * Shows trial cards with NCT ID, phase, status, fit score.
 *
 * Used by: Phase3Treatment, Digital Twin (future)
 */
import React from 'react';
import { Box, Typography, Paper, Alert, CircularProgress, Chip } from '@mui/material';
import { Science as TrialIcon } from '@mui/icons-material';
import '../therapy-fit/therapy-fit.css';

function getScoreClass(score) {
    if (score >= 0.7) return 'tf-trial-card__score--high';
    if (score >= 0.4) return 'tf-trial-card__score--medium';
    return 'tf-trial-card__score--low';
}

export default function ClinicalTrialsSection({ trials = [], isLoading = false, error = null }) {
    return (
        <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box className="tf-trials-header">
                <TrialIcon className="tf-trials-header__icon" />
                <Typography variant="subtitle1" className="tf-trials-header__title">
                    Matched Clinical Trials
                </Typography>
                <Chip label="RUO" size="small" className="tf-chip--ruo" />
            </Box>

            <Box sx={{ p: 2 }}>
                {isLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2, justifyContent: 'center' }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="text.secondary">
                            Searching clinical trials matching your profile...
                        </Typography>
                    </Box>
                )}

                {error && (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        <Typography variant="body2">
                            Clinical trial matching is not available right now.
                            This does not affect your treatment rankings.
                        </Typography>
                    </Alert>
                )}

                {!isLoading && !error && trials.length === 0 && (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        No matched trials found for your current profile.
                        Adding more test data may unlock additional matches.
                    </Alert>
                )}

                {!isLoading && trials.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {trials.slice(0, 5).map((trial, idx) => {
                            const nctId = trial.nct_id || trial.nctId;
                            const phase = trial.phase || 'N/A';
                            const status = trial.overall_status || trial.status;
                            const title = trial.brief_title || trial.title || trial.official_title || nctId;
                            const score = trial.holistic_score ?? trial.mechanism_fit_score;

                            return (
                                <Paper
                                    key={nctId || idx}
                                    variant="outlined"
                                    className="tf-trial-card"
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.4 }}>
                                                {title}
                                            </Typography>
                                            <Box className="tf-trial-card__meta">
                                                {nctId && (
                                                    <Chip
                                                        label={nctId}
                                                        size="small"
                                                        component="a"
                                                        href={`https://clinicaltrials.gov/study/${nctId}`}
                                                        target="_blank"
                                                        clickable
                                                        className="tf-chip--nct"
                                                    />
                                                )}
                                                <Chip label={`Phase ${phase}`} size="small" sx={{ fontSize: '0.7rem' }} />
                                                {status && (
                                                    <Chip
                                                        label={status}
                                                        size="small"
                                                        className={status === 'Recruiting' ? 'tf-chip--recruiting' : 'tf-chip--status'}
                                                        sx={{ fontSize: '0.7rem' }}
                                                    />
                                                )}
                                            </Box>
                                            {trial.treatment_line_bucket && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Line: {trial.treatment_line_bucket}
                                                </Typography>
                                            )}
                                        </Box>
                                        {score != null && (
                                            <Box className={`tf-trial-card__score ${getScoreClass(score)}`}>
                                                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: 1 }}>
                                                    {Math.round(score * 100)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                                                    FIT
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>
                            );
                        })}
                        <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', mt: 0.5 }}>
                            Showing top {Math.min(trials.length, 5)} of {trials.length} matched trials.
                            Scores reflect mechanism fit to your tumor profile. Not clinical guidance.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
}
