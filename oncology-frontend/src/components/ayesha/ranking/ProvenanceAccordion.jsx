import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Chip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import { safeRender, humanize } from '../../../utils/drugRendering';

export default function ProvenanceAccordion({ provenance }) {
    if (!provenance || provenance.error) return null;

    return (
        <Accordion sx={{ mb: 2, bgcolor: 'action.hover', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon color="action" fontSize="small" />
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                        See Scoring Details
                    </Typography>
                    {provenance.gates_applied && provenance.gates_applied.length > 0 && (
                        <Chip
                            label={`${provenance.gates_applied.length} factors`}
                            size="small"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                    )}
                </Box>
            </AccordionSummary>
            <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Completeness Level */}
                    {provenance.level && (
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                Data Quality
                            </Typography>
                            <Typography variant="body2">
                                <strong>{safeRender(provenance.level)}</strong> - {
                                    safeRender(provenance.level) === 'L2' ? 'High quality - Full biomarker panel' :
                                        safeRender(provenance.level) === 'L1' ? 'Preliminary - Partial biomarkers' :
                                            'Low quality - Historical data only'
                                }
                            </Typography>
                        </Box>
                    )}

                    {/* Gates Applied */}
                    {provenance.gates_applied && provenance.gates_applied.length > 0 && (
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                Clinical Factors Applied
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                {provenance.gates_applied.map((gate, gidx) => (
                                    <Chip
                                        key={gidx}
                                        label={humanize(gate)}
                                        size="small"
                                        color={String(gate || '').includes('PENALTY') ? 'error' :
                                            String(gate || '').includes('RESCUE') ? 'success' :
                                                String(gate || '').includes('BOOST') ? 'success' : 'default'}
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Efficacy/Confidence Deltas */}
                    {(provenance.efficacy_delta !== 0 || provenance.confidence_delta !== 0) && (
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                Score Adjustments
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                {provenance.efficacy_delta !== 0 && (
                                    <Typography variant="body2">
                                        Efficacy: <strong style={{ color: provenance.efficacy_delta < 0 ? 'red' : 'green' }}>
                                            {provenance.efficacy_delta > 0 ? '+' : ''}
                                            {Math.round(provenance.efficacy_delta * 100)}%
                                        </strong>
                                    </Typography>
                                )}
                                {provenance.confidence_delta !== 0 && (
                                    <Typography variant="body2">
                                        Confidence: <strong style={{ color: provenance.confidence_delta < 0 ? 'red' : 'green' }}>
                                            {provenance.confidence_delta > 0 ? '+' : ''}
                                            {Math.round(provenance.confidence_delta * 100)}%
                                        </strong>
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    )}

                    {/* Rationale List */}
                    {provenance.rationale && Array.isArray(provenance.rationale) && (
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                Explanation
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                                {provenance.rationale.map((rationale, ridx) => (
                                    <Typography key={ridx} variant="body2" sx={{ mb: 0.5 }}>
                                        • <strong>{humanize(rationale.gate || '')}</strong>: {safeRender(rationale.reason || rationale.verdict)}
                                    </Typography>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Germline Status */}
                    {provenance.germline_status && (
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                Germline Status
                            </Typography>
                            <Typography variant="body2">
                                {provenance.germline_status === 'positive' ? '✅ BRCA1/2 positive' :
                                    provenance.germline_status === 'negative' ? '⚠️ Germline negative' :
                                        '❓ Unknown'}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}

ProvenanceAccordion.propTypes = {
    provenance: PropTypes.object
};
