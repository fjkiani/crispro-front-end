import React from 'react';
import { Box, Typography, Card, CardContent, Chip, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Science, Lock, ArrowForward, CheckCircle } from '@mui/icons-material';

const ActionDeck = ({ testsNeeded }) => {
    // If no tests needed, show success state
    if (!testsNeeded || testsNeeded.length === 0) {
        return (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#4fd1c5', opacity: 0.7 }}>
                <CheckCircle sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="button" fontWeight={700}>PROFILE COMPLETE</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ pb: 1, borderBottom: '1px solid #2d3748' }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>
                    3. ACTION DECK ({testsNeeded.length})
                </Typography>
            </Box>

            <Box sx={{ overflowY: 'auto', pr: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {testsNeeded.map((test, idx) => (
                    <Card key={idx} sx={{ bgcolor: '#1a202c', border: '1px solid #4a5568', position: 'relative', overflow: 'visible' }}>
                        {/* Status Strip */}
                        <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, bgcolor: '#f6ad55' }} />

                        <CardContent sx={{ pl: 3, py: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight={700} color="#fff">
                                    {test.test}
                                </Typography>
                                <Chip label="MISSING" size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#c05621', color: '#fff' }} />
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 2, fontStyle: 'italic' }}>
                                "{test.why}"
                            </Typography>

                            <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1, p: 1 }}>
                                <Typography variant="caption" color="#4fd1c5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                    <Lock sx={{ fontSize: 12 }} /> UNLOCKS:
                                </Typography>
                                {test.unlocks.map((u, i) => (
                                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                        <ArrowForward sx={{ fontSize: 10, color: '#4fd1c5' }} />
                                        <Typography variant="caption" color="#e2e8f0">{u}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
};

export default ActionDeck;
