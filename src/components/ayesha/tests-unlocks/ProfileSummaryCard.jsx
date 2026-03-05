/**
 * ProfileSummaryCard — Patient profile snapshot + tests on record
 *
 * Props:
 *   profile        — patient profile object
 *   testsOnRecord  — [{category, name, date, details}] (from buildTestsOnRecord)
 *   missing        — string[] of missing field names
 */
import React from 'react';
import {
    Card, CardContent, Typography, Chip, Grid, Stack, Divider, Box,
} from '@mui/material';
import { formatDate } from './testsUnlocksUtils';

export default function ProfileSummaryCard({ profile, testsOnRecord = [], missing = [] }) {
    if (!profile) return null;

    return (
        <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', mb: 1 }}>
                    Patient profile (AK)
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Snapshot from record constant · <code>ayesha_11_17_25.js</code>
                </Typography>

                {/* Key chips */}
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                    <Chip label={`Disease: ${profile?.disease?.type || '—'}`} sx={{ fontWeight: 900 }} />
                    <Chip label={`Stage: ${profile?.disease?.stage || '—'}`} sx={{ fontWeight: 900 }} />
                    <Chip label={`Histology: ${profile?.disease?.histology || '—'}`} sx={{ fontWeight: 900 }} />
                    <Chip label={`Primary: ${profile?.disease?.primary_site || '—'}`} sx={{ fontWeight: 900 }} />
                    <Chip
                        label={`Germline: ${profile?.germline?.status || '—'}`}
                        color={String(profile?.germline?.status || '').toUpperCase() === 'POSITIVE' ? 'error' : 'default'}
                        sx={{ fontWeight: 900 }}
                    />
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#334155', mb: 1 }}>
                    Tests on record
                </Typography>
                <Grid container spacing={1}>
                    {testsOnRecord.length ? (
                        testsOnRecord.map((t, idx) => (
                            <Grid item xs={12} md={6} key={`${t.category}-${idx}`}>
                                <Card sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                    <CardContent sx={{ py: 1.5 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                                            <Box>
                                                <Typography sx={{ fontWeight: 900, color: '#0f172a' }}>{t.name}</Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748b' }}>
                                                    {t.category}{t.date ? ` · ${formatDate(t.date)}` : ''}
                                                </Typography>
                                            </Box>
                                            <Chip size="small" label="on record" color="success" sx={{ fontWeight: 900 }} />
                                        </Stack>
                                        {t.details && (
                                            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                                                {t.details}
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Typography color="text.secondary">No record items found.</Typography>
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
}
