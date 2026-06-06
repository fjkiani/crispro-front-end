/**
 * OpportunityPanel — Consolidated view of actionable opportunities
 *
 * Consolidates:
 * - KillChainStatusWidget (NEW — 2-of-3 resistance policy monitor)
 * - SyntheticLethalityCard (single instance)
 * - ResistanceGateBanner (boardroom_outcome schema — different pipeline from Kill Chain)
 * - Tests Needed with actionable CTAs
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
import KillChainStatusWidget from '../KillChainStatusWidget';
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
            <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 1 }}>
                <CardContent>
                    <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 700, display: 'block', mb: 1.5 }}>
                        Resistance assessment
                    </Typography>
                    {/* Kill Chain Monitor — 2-of-3 policy state */}
                    <KillChainStatusWidget resistanceGate={resistanceGate} />
                    {/* Resistance Gate Banner — boardroom_outcome pipeline (separate from Kill Chain) */}
                    <Suspense fallback={<Box sx={{ height: 60, bgcolor: 'action.hover', borderRadius: 2 }} />}>
                        <ResistanceGateBanner data={resistanceGate} levelKey={levelKey} />
                    </Suspense>
                </CardContent>
            </Card>


            {/* Section 2: Synthetic Lethality Targets */}
            <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 1 }}>
                <CardContent>
                    <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 700, display: 'block', mb: 0.5 }}>
                        Synthetic lethality targets
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        Genetic vulnerabilities identified in the tumor that can be exploited for precision therapy.
                    </Typography>
                    <Suspense fallback={<Box sx={{ height: 200, bgcolor: 'action.hover', borderRadius: 2 }} />}>
                        <SyntheticLethalityCard data={slPayload} levelKey={levelKey} testsNeeded={tests} onShowTrials={(axis) => navigate(`/ayesha/trials-full?axis=${axis}`)} />
                    </Suspense>
                </CardContent>
            </Card>

            {/* Section 3: Tests Needed — Actionable */}
            <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3, boxShadow: 1 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                            <Typography variant="overline" sx={{ color: 'info.main', fontWeight: 700, letterSpacing: 1.5, display: 'block' }}>
                                RECOMMENDED TESTS
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {tests.length > 0
                                    ? `${tests.length} test(s) would unlock higher-confidence analysis`
                                    : 'No additional tests currently recommended'}
                            </Typography>
                        </Box>
                        {tests.length > 0 && (
                            <Chip
                                label={`${tests.length} Pending`}
                                size="small"
                                sx={{ bgcolor: 'warning.light', color: 'warning.dark', fontWeight: 700 }}
                            />
                        )}
                    </Box>

                    {tests.length === 0 ? (
                        <Alert severity="success" sx={{ borderRadius: 2 }}>
                            All available analyses are running at maximum confidence with current data.
                        </Alert>
                    ) : (
                        <Grid container spacing={2}>
                            {tests.map((t, idx) => (
                                <Grid item xs={12} md={6} key={t.test || idx}>
                                    <Card variant="outlined" sx={{
                                        bgcolor: 'grey.50', borderColor: 'divider',
                                        transition: 'border-color 0.2s',
                                        '&:hover': { borderColor: 'primary.main' },
                                    }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                                                <TestIcon sx={{ color: 'info.main', mt: 0.3 }} />
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 700 }}>
                                                        {t.test}
                                                    </Typography>
                                                    {t.unlocks && (
                                                        <Typography variant="body2" sx={{ color: 'success.dark', mt: 0.5 }}>
                                                            🔓 Unlocks: {t.unlocks}
                                                        </Typography>
                                                    )}
                                                    {t.why && (
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1, lineHeight: 1.5 }}>
                                                            {t.why}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>

                                            <Divider sx={{ my: 1.5 }} />

                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="primary"
                                                    startIcon={<ArrowIcon />}
                                                    onClick={() => navigate('/ayesha/tests')}
                                                    sx={{
                                                        textTransform: 'none', fontWeight: 600, fontSize: '0.75rem',
                                                    }}
                                                >
                                                    View Test Details
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                    endIcon={<ExternalIcon sx={{ fontSize: '0.85rem' }} />}
                                                    onClick={() => navigate('/ayesha-trials')}
                                                    sx={{
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
                            sx={{ mt: 2, borderRadius: 2 }}
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
