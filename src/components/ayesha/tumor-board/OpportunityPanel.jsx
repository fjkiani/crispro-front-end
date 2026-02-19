/**
 * OpportunityPanel — Consolidated view of actionable opportunities
 * 
 * Consolidates:
 * - SyntheticLethalityCard (single instance, was duplicated)
 * - ResistanceGateBanner (single instance, was duplicated)  
 * - Tests Needed with actionable CTAs
 * - Coordination prompts as prioritized cards
 */
import React, { Suspense } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Chip,
    Alert,
    Divider,
} from '@mui/material';
import {
    Science as TestIcon,
    OpenInNew as ExternalIcon,
    ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SyntheticLethalityCard = React.lazy(() => import('../SyntheticLethalityCard'));
const ResistanceGateBanner = React.lazy(() => import('../ResistanceGateBanner'));

function safeArray(v) { return Array.isArray(v) ? v : []; }

export default function OpportunityPanel({
    slPayload,
    resistanceGate,
    levelKey,
    testsNeeded,
    missing,
}) {
    const navigate = useNavigate();
    const tests = safeArray(testsNeeded);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Section 1: Resistance Status */}
            <Card sx={{ bgcolor: '#0f172a', border: '1px solid #1e293b', borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="overline" sx={{ color: '#f87171', fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 1.5 }}>
                        DEFENSE — RESISTANCE ASSESSMENT
                    </Typography>
                    <Suspense fallback={<Box sx={{ height: 60, bgcolor: '#1e293b', borderRadius: 2 }} />}>
                        <ResistanceGateBanner data={resistanceGate} levelKey={levelKey} />
                    </Suspense>
                </CardContent>
            </Card>

            {/* Section 2: Synthetic Lethality Targets */}
            <Card sx={{ bgcolor: '#0f172a', border: '1px solid #1e293b', borderRadius: 3 }}>
                <CardContent>
                    <Typography variant="overline" sx={{ color: '#c084fc', fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 0.5 }}>
                        ATTACK — SYNTHETIC LETHALITY TARGETS
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                        Genetic vulnerabilities identified in the tumor that can be exploited for precision therapy.
                    </Typography>
                    <Suspense fallback={<Box sx={{ height: 200, bgcolor: '#1e293b', borderRadius: 2 }} />}>
                        <SyntheticLethalityCard data={slPayload} levelKey={levelKey} />
                    </Suspense>
                </CardContent>
            </Card>

            {/* Section 3: Tests Needed — Actionable */}
            <Card sx={{ bgcolor: '#0f172a', border: '1px solid #1e293b', borderRadius: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                            <Typography variant="overline" sx={{ color: '#38bdf8', fontWeight: 700, letterSpacing: 1.5, display: 'block' }}>
                                RECOMMENDED TESTS
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                {tests.length > 0
                                    ? `${tests.length} test(s) would unlock higher-confidence analysis`
                                    : 'No additional tests currently recommended'}
                            </Typography>
                        </Box>
                        {tests.length > 0 && (
                            <Chip
                                label={`${tests.length} Pending`}
                                size="small"
                                sx={{ bgcolor: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 700 }}
                            />
                        )}
                    </Box>

                    {tests.length === 0 ? (
                        <Alert severity="success" sx={{ bgcolor: 'rgba(34,197,94,0.05)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                            All available analyses are running at maximum confidence with current data.
                        </Alert>
                    ) : (
                        <Grid container spacing={2}>
                            {tests.map((t, idx) => (
                                <Grid item xs={12} md={6} key={t.test || idx}>
                                    <Card variant="outlined" sx={{
                                        bgcolor: '#1e293b', border: '1px solid #334155',
                                        transition: 'border-color 0.2s',
                                        '&:hover': { borderColor: '#6366f1' },
                                    }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                                                <TestIcon sx={{ color: '#38bdf8', mt: 0.3 }} />
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700 }}>
                                                        {t.test}
                                                    </Typography>
                                                    {t.unlocks && (
                                                        <Typography variant="body2" sx={{ color: '#4ade80', mt: 0.5 }}>
                                                            🔓 Unlocks: {t.unlocks}
                                                        </Typography>
                                                    )}
                                                    {t.why && (
                                                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 1, lineHeight: 1.5 }}>
                                                            {t.why}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>

                                            <Divider sx={{ borderColor: '#334155', my: 1.5 }} />

                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    startIcon={<ArrowIcon />}
                                                    onClick={() => navigate('/ayesha/tests')}
                                                    sx={{
                                                        bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' },
                                                        textTransform: 'none', fontWeight: 600, fontSize: '0.75rem',
                                                    }}
                                                >
                                                    View Test Details
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    endIcon={<ExternalIcon sx={{ fontSize: '0.85rem' }} />}
                                                    onClick={() => navigate('/ayesha-trials')}
                                                    sx={{
                                                        borderColor: '#334155', color: '#94a3b8',
                                                        '&:hover': { borderColor: '#6366f1', color: '#c7d2fe' },
                                                        textTransform: 'none', fontWeight: 600, fontSize: '0.75rem',
                                                    }}
                                                >
                                                    Find Trials
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {/* Missing data summary */}
                    {safeArray(missing).length > 0 && (
                        <Alert
                            severity="info"
                            variant="outlined"
                            sx={{ mt: 2, bgcolor: 'rgba(99,102,241,0.05)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}
                        >
                            <strong>Completeness gap:</strong> Missing {safeArray(missing).join(', ')}.
                            These would increase confidence from the current cap and may unlock additional analysis levels.
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
