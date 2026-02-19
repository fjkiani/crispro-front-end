import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Alert,
    Stack,
    Divider,
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ScienceIcon from '@mui/icons-material/Science';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

/**
 * HRDUnlockPanel — replaces empty "Upload HRD" slot with actionable unlock card.
 *
 * Shows:
 * 1. Current HRD status (from completeness.has_hrd)
 * 2. Why it matters (from testsNeeded[?test ~ 'HRD'].why)
 * 3. What it unlocks (from testsNeeded[?test ~ 'HRD'].unlocks)
 * 4. Recommended test name (from testsNeeded[?test ~ 'HRD'].test)
 * 5. Current completeness level
 *
 * No estimator, no predicted range, nothing invented.
 */

function HRDUnlockPanel({ completeness, testsNeeded }) {
    // Extract HRD-specific test if it exists in testsNeeded
    const allTests = Array.isArray(testsNeeded) ? testsNeeded : [];
    const hrdTest = allTests.find(t =>
        t.test && (
            t.test.toLowerCase().includes('hrd') ||
            t.test.toLowerCase().includes('homologous recombination')
        )
    );

    const hasHrd = completeness?.has_hrd === true;
    const missing = Array.isArray(completeness?.missing) ? completeness.missing : [];
    const hrdMissing = missing.some(m => m.toLowerCase().includes('hrd'));
    const level = completeness?.level || 'Unknown';
    const levelName = completeness?.level_name || '';

    // If HRD is present, show a simple success state
    if (hasHrd) {
        return (
            <Card sx={{ borderRadius: 3, border: '1px solid #86efac' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LockOpenIcon sx={{ color: '#16a34a' }} />
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#16a34a' }}>
                            HRD Score: Available
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        HRD data has been integrated into the analysis pipeline. PARP sensitivity predictions are active.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ borderRadius: 3, border: '1px solid #fbbf24', bgcolor: '#fffbeb' }}>
            <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <LockOpenIcon sx={{ color: '#d97706' }} />
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#92400e' }}>
                        HRD Score: Not Available
                    </Typography>
                    <Chip
                        size="small"
                        label={`Current: ${level}${levelName ? ` (${levelName})` : ''}`}
                        variant="outlined"
                        sx={{ ml: 'auto', fontSize: '0.7rem', borderColor: '#d97706', color: '#92400e' }}
                    />
                </Box>

                {/* Why it matters */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#78350f', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
                        Why It Matters
                    </Typography>
                    {hrdTest?.why ? (
                        <Typography variant="body2" sx={{ color: '#451a03' }}>
                            {hrdTest.why}
                        </Typography>
                    ) : (
                        <Typography variant="body2" sx={{ color: '#451a03' }}>
                            HRD status is a key determinant of PARP inhibitor sensitivity. Without it,
                            the system cannot fully assess DNA repair competency or provide PARP sensitivity predictions.
                        </Typography>
                    )}
                </Box>

                {/* What it unlocks */}
                {hrdTest?.unlocks && hrdTest.unlocks.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#78350f', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
                            What It Unlocks
                        </Typography>
                        <Stack spacing={0.5}>
                            {hrdTest.unlocks.map((u, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TrendingUpIcon sx={{ fontSize: 16, color: '#d97706' }} />
                                    <Typography variant="body2" sx={{ color: '#451a03' }}>
                                        {u}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                )}

                <Divider sx={{ my: 1.5, borderColor: '#fde68a' }} />

                {/* Recommended next test */}
                <Alert
                    severity="warning"
                    variant="outlined"
                    icon={<ScienceIcon fontSize="small" />}
                    sx={{
                        borderColor: '#fbbf24',
                        bgcolor: 'transparent',
                        '& .MuiAlert-icon': { color: '#d97706' },
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Recommended test:{' '}
                        {hrdTest?.test || 'HRD Assay (Myriad MyChoice or similar)'}
                    </Typography>
                    {hrdMissing && (
                        <Typography variant="caption" color="text.secondary">
                            Listed as missing in completeness profile
                        </Typography>
                    )}
                </Alert>
            </CardContent>
        </Card>
    );
}

export default HRDUnlockPanel;
