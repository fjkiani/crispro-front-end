/**
 * SignalLight — Single engine light circle with tooltip
 *
 * Displays one of 8 Kill Chain signals as a colored circle
 * with plain-language tooltip explanation.
 *
 * Source: ENGINE_LIGHT_DASHBOARD.mdc §7 Layer 3
 */
import React from 'react';
import { Box, Typography, Tooltip, Divider } from '@mui/material';
import { FiberManualRecord } from '@mui/icons-material';

export default function SignalLight({ signal }) {
    const color = signal.state?.color || '#94a3b8';
    const isPulsing = signal.state?.key === 'FIRED';

    return (
        <Tooltip
            arrow
            title={
                <Box sx={{ p: 0.5, maxWidth: 260 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 'var(--text-base)', mb: 0.5 }}>
                        {signal.state?.emoji} {signal.name}
                    </Typography>
                    <Typography sx={{ fontSize: 'var(--text-sm)', lineHeight: 1.5, mb: 0.75 }}>
                        {signal.reason}
                    </Typography>
                    <Divider sx={{ my: 0.5, borderColor: 'rgba(255,255,255,0.2)' }} />
                    <Typography sx={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                        {signal.plainLanguage}
                    </Typography>
                    {signal.state?.key === 'NO_DATA' && (
                        <Typography sx={{ fontSize: 'var(--text-xs)', mt: 0.5, fontStyle: 'italic', color: '#fbbf24' }}>
                            Test needed: {signal.testRequired}
                        </Typography>
                    )}
                </Box>
            }
        >
            <Box sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
                cursor: 'pointer',
                '&:hover': { transform: 'scale(1.1)' },
                transition: 'transform 0.2s ease',
            }}>
                <Box sx={{
                    width: 36, height: 36,
                    borderRadius: '50%',
                    bgcolor: color + '20',
                    border: `2.5px solid ${color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                    ...(isPulsing && {
                        animation: 'enginePulse 1.5s infinite',
                        '@keyframes enginePulse': {
                            '0%, 100%': { boxShadow: `0 0 0 0 ${color}60` },
                            '50%': { boxShadow: `0 0 12px 4px ${color}40` },
                        },
                    }),
                }}>
                    <FiberManualRecord sx={{ fontSize: 16, color }} />
                </Box>
                {/* Labels are WHITE on dark background — never use signal color for text */}
                <Typography sx={{
                    fontSize: 'var(--text-xs)', fontWeight: 700,
                    color: '#e2e8f0',
                    textAlign: 'center', lineHeight: 1.2,
                    maxWidth: 64,
                }}>
                    {signal.shortName}
                </Typography>
            </Box>
        </Tooltip>
    );
}
