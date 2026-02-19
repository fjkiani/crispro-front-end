
import React, { Suspense } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const SyntheticLethalityCard = React.lazy(() => import('../SyntheticLethalityCard'));
const ResistanceGateBanner = React.lazy(() => import('../ResistanceGateBanner'));

export default function StrategicPriorities({ slPayload, resistanceGate, levelKey }) {
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
                    PRIMARY MISSION OBJECTIVES
                </Typography>

                {/* Resistance Gate (High Priority Alert) */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" sx={{ color: '#f87171', fontWeight: 700, display: 'block', mb: 1 }}>
                        PRIORITY 1: DEFENSE (RESISTANCE)
                    </Typography>
                    <Suspense fallback={<Box sx={{ height: 60, bgcolor: '#1e293b', borderRadius: 2 }} />}>
                        <ResistanceGateBanner data={resistanceGate} levelKey={levelKey} />
                    </Suspense>
                </Box>

                <Box>
                    <Typography variant="caption" sx={{ color: '#c084fc', fontWeight: 700, display: 'block', mb: 1 }}>
                        PRIORITY 2: ATTACK (TARGETS)
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mb: 1.5 }}>
                        Synthetic Lethality Targets
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                        Identifying genetic vulnerabilities ("Achilles' Heel") for precision strikes.
                    </Typography>

                    <Suspense fallback={<Box sx={{ height: 200, bgcolor: '#1e293b', borderRadius: 2 }} />}>
                        <SyntheticLethalityCard data={slPayload} levelKey={levelKey} />
                    </Suspense>
                </Box>
            </CardContent>
        </Card>
    );
}
