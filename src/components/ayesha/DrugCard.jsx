import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    LinearProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export function DrugCard({ drug, showSPE = true, showBadges = true, onInform }) {
    const confidence = drug.confidence || 0;
    // Use raw confidence for display to be brutally honest
    const confidencePercent = Math.round(confidence * 100);

    // Determine if actionable based on backend data only, not frontend heuristics
    const isActionable = confidence > 0.0 || (drug.citations_count && drug.citations_count > 0);
    const opacity = isActionable ? 1 : 0.6;

    return (
        <Card sx={{ opacity, mb: 2, border: '1px solid #e0e0e0' }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" component="div">
                        {drug.name}
                    </Typography>
                    <Chip
                        label={`${confidencePercent}%`}
                        color={confidence >= 0.7 ? 'success' : confidence >= 0.4 ? 'warning' : 'default'}
                        size="small"
                    />
                </Box>

                {/* Helper text for non-actionable items */}
                {!isActionable && (
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Not actionable (missing evidence)
                    </Typography>
                )}

                {/* Confidence Bar */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                            variant="determinate"
                            value={confidencePercent}
                            color={confidence >= 0.7 ? 'success' : 'primary'}
                        />
                    </Box>
                </Box>

                {/* Badges */}
                {showBadges && drug.badges && drug.badges.length > 0 && (
                    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                        {drug.badges.map(badge => (
                            <Chip key={badge} label={badge} size="small" variant="outlined" />
                        ))}
                    </Box>
                )}

                {/* S/P/E Breakdown */}
                {showSPE && drug.rationale && (
                    <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 0 }}>
                            <Typography variant="caption" color="text.secondary">
                                Why this score? (S/P/E Rationale)
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 0, pt: 0 }}>
                            {Array.isArray(drug.rationale) ? (
                                drug.rationale.map((r, i) => (
                                    <Box key={i} mb={1} pl={1} borderLeft="2px solid #eee">
                                        {typeof r === 'object' ? (
                                            <>
                                                <Typography variant="caption" color="primary" display="block">
                                                    {r.type ? r.type.toUpperCase() : 'FACTOR'}
                                                </Typography>
                                                <Typography variant="body2" fontSize="0.85rem">
                                                    {r.explanation || JSON.stringify(r)}
                                                </Typography>
                                            </>
                                        ) : (
                                            <Typography variant="body2" fontSize="0.85rem">{r}</Typography>
                                        )}
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="body2">{drug.rationale}</Typography>
                            )}
                        </AccordionDetails>
                    </Accordion>
                )}

                {/* Footer Meta */}
                <Box mt={2} pt={1} borderTop="1px dashed #eee" display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                        Efficacy: {drug.efficacy_score?.toFixed(2)} | Tier: {drug.evidence_tier}
                        {drug.citations_count !== undefined && ` | Citations: ${drug.citations_count}`}
                    </Typography>
                    {onInform && (
                        <Button size="small" variant="text" onClick={() => onInform(drug)}>
                            Inform Doctor
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}
