
import React, { Suspense } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const SyntheticLethalityCard = React.lazy(() => import('../SyntheticLethalityCard'));
const ResistanceGateBanner = React.lazy(() => import('../ResistanceGateBanner'));

export default function ActionableInsights({ slPayload, resistanceGate, levelKey }) {
    return (
        <Card
            sx={{
                borderRadius: 3,
                bgcolor: '#0f172a', // Slate-950
                border: '1px solid #1e293b',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                color: 'white',
                height: '100%',
                mb: 3,
            }}
        >
            <CardContent>
                <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 2 }}>
                    Actionable Recommendations
                </Typography>

                {/* Resistance Gate (High Priority Alert) */}
                <Box sx={{ mb: 3 }}>
                    <Suspense fallback={<Box sx={{ height: 60, bgcolor: '#1e293b', borderRadius: 2 }} />}>
                        <ResistanceGateBanner data={resistanceGate} levelKey={levelKey} />
                    </Suspense>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mb: 1.5 }}>
                    Synthetic Lethality Panel
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                    Independent of standard drug matching (WIWFM), looking for specific vulnerabilities.
                </Typography>

                <Suspense fallback={<Box sx={{ height: 200, bgcolor: '#1e293b', borderRadius: 2 }} />}>
                    <SyntheticLethalityCard data={slPayload} levelKey={levelKey} />
                </Suspense>
            </CardContent>
        </Card>
    );
}
