import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Grid, Chip } from '@mui/material';
import { Network, Zap, Unplug, ArrowRight, Target } from 'lucide-react';

/**
 * ZETA COMPONENT: Visual Mechanism Card
 * Replaces SyntheticLethalityCard.
 * 
 * Philosophy: "Target Lock Visualization"
 * - Diagrams the mechanism of action.
 * - Shows:
 *      1. Enemy Weakness (HRD)
 *      2. Weapon Effect (PARP Inhibition)
 *      3. Result (System Collapse)
 */
const VisualMechanismCard = ({ data, evidence }) => {
    // Zeta Theme
    const theme = {
        bg: '#0f172a',
        border: '#1e293b',
        text: '#cbd5e1',
        accent: '#38bdf8'
    };

    return (
        <Card sx={{
            mb: 4,
            borderRadius: 0,
            bgcolor: theme.bg,
            border: `1px solid ${theme.border}`,
            position: 'relative',
            overflow: 'visible'
        }}>
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 4,
                height: '100%',
                bgcolor: theme.accent
            }} />

            <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Network color={theme.accent} size={28} />
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', letterSpacing: 1 }}>
                        TARGET LOCK: MECHANISM OF ACTION
                    </Typography>
                </Box>

                <Grid container spacing={4} alignItems="center">
                    {/* Step 1: Enemy Weakness */}
                    <Grid item xs={12} md={3}>
                        <Box sx={{
                            p: 3,
                            border: '1px dashed #ef4444',
                            bgcolor: 'rgba(239, 68, 68, 0.05)',
                            textAlign: 'center'
                        }}>
                            <Unplug color="#ef4444" size={40} style={{ marginBottom: 16 }} />
                            <Typography variant="h6" sx={{ color: '#fca5a5', fontWeight: 800 }}>
                                ENEMY WEAKNESS
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#fecaca', mt: 1 }}>
                                DNA Repair Systems Offline (HRD+)
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={1} sx={{ textAlign: 'center' }}>
                        <ArrowRight color="#64748b" size={32} />
                    </Grid>

                    {/* Step 2: Weapon Effect */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{
                            p: 3,
                            border: `1px solid ${theme.accent}`,
                            bgcolor: 'rgba(56, 189, 248, 0.05)',
                            textAlign: 'center'
                        }}>
                            <Zap color={theme.accent} size={40} style={{ marginBottom: 16 }} />
                            <Typography variant="h6" sx={{ color: theme.accent, fontWeight: 800 }}>
                                WEAPON IMPACT
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#e0f2fe', mt: 1 }}>
                                Blocks Backup Repair Pathway (PARP)
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={1} sx={{ textAlign: 'center' }}>
                        <ArrowRight color="#64748b" size={32} />
                    </Grid>

                    {/* Step 3: Result */}
                    <Grid item xs={12} md={3}>
                        <Box sx={{
                            p: 3,
                            border: '1px solid #22c55e',
                            bgcolor: 'rgba(34, 197, 94, 0.05)',
                            textAlign: 'center'
                        }}>
                            <Target color="#22c55e" size={40} style={{ marginBottom: 16 }} />
                            <Typography variant="h6" sx={{ color: '#4ade80', fontWeight: 800 }}>
                                RESULT
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#dcfce7', mt: 1 }}>
                                Total System Collapse (Synthetic Lethality)
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default VisualMechanismCard;
