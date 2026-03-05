/**
 * RecommendedTestsCard — Backend-driven recommended tests grouped by unlock level
 *
 * Props:
 *   testsNeeded  — [{test, why, unlocks, status}] from bundle
 *   onUpload(testName: string) → void
 */
import React from 'react';
import {
    Card, CardContent, Typography, Chip, Grid, Stack, Button, Box, Alert,
} from '@mui/material';
import { safeArray, groupTests, getTestDetailByName } from './testsUnlocksUtils';

function TestCard({ t, onUpload }) {
    const detail = getTestDetailByName(t?.test);

    return (
        <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                    <Typography sx={{ fontWeight: 900, color: '#0f172a' }}>
                        {t?.test || 'Test'}
                    </Typography>
                    <Chip
                        size="small"
                        label={String(t?.status || 'missing')}
                        color={String(t?.status || '').toLowerCase() === 'missing' ? 'warning' : 'success'}
                        sx={{ fontWeight: 900 }}
                    />
                </Stack>

                <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {t?.why || '—'}
                </Typography>

                {/* Test-specific details */}
                {detail && (
                    <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#334155' }}>
                            DETAILS
                        </Typography>
                        <Box component="ul" sx={{ mt: 0.5, mb: 0, pl: 2, color: '#334155' }}>
                            <li><Typography variant="body2"><strong>Specimen:</strong> {detail.specimen}</Typography></li>
                            <li><Typography variant="body2"><strong>Outputs:</strong> {safeArray(detail.outputs).join(', ')}</Typography></li>
                            <li><Typography variant="body2"><strong>Unlocks:</strong> {safeArray(detail.unlocks).join(', ')}</Typography></li>
                        </Box>
                        {detail.notes && (
                            <Typography variant="body2" sx={{ mt: 1, color: '#475569' }}>
                                {detail.notes}
                            </Typography>
                        )}
                    </Box>
                )}

                {/* Unlocks chips */}
                <Box sx={{ mt: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748b' }}>
                        UNLOCKS
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.5 }}>
                        {safeArray(t?.unlocks).map((u, idx) => (
                            <Chip key={`${u}-${idx}`} size="small" label={String(u)} sx={{ fontWeight: 800 }} />
                        ))}
                    </Stack>
                </Box>

                {/* CTA */}
                <Box sx={{ mt: 1.5 }}>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onUpload?.(String(t?.test || ''))}
                    >
                        Upload / add result
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}

const GROUPS = [
    { key: 'l2', title: 'Unlock L2 (core biomarkers)' },
    { key: 'l3', title: 'Unlock L3 (mechanism + resistance)' },
    { key: 'other', title: 'Other' },
];

export default function RecommendedTestsCard({ testsNeeded = [], onUpload }) {
    const grouped = groupTests(testsNeeded);

    return (
        <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    gap={2}
                    sx={{ mb: 1 }}
                >
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a' }}>
                            Recommended tests (next actions)
                        </Typography>
                        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                            Backend-driven recommendations based on current L1 state.
                        </Typography>
                    </Box>
                    <Chip label={`Total: ${testsNeeded.length}`} sx={{ fontWeight: 900, bgcolor: '#e2e8f0' }} />
                </Stack>

                {testsNeeded.length === 0 ? (
                    <Alert severity="warning" sx={{ mt: 2 }}>No test recommendations returned from backend.</Alert>
                ) : (
                    <Grid container spacing={2} sx={{ mt: 0 }}>
                        {GROUPS.map(({ key, title }) => (
                            <Grid item xs={12} md={4} key={key}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#334155', mb: 1 }}>
                                    {title}
                                </Typography>
                                <Stack gap={2}>
                                    {grouped[key].length ? (
                                        grouped[key].map((t, idx) => (
                                            <TestCard key={`${key}-${idx}`} t={t} onUpload={onUpload} />
                                        ))
                                    ) : (
                                        <Typography color="text.secondary">—</Typography>
                                    )}
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </CardContent>
        </Card>
    );
}
