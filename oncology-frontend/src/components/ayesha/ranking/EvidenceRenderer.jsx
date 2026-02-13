import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { safeRender, humanize } from '../../../utils/drugRendering';

export default function EvidenceRenderer({ rationale }) {
    if (!rationale) return null;

    if (Array.isArray(rationale)) {
        return (
            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {rationale.map((item, rIdx) => {
                        if (item.type === 'synthetic_lethality') {
                            return (
                                <Box key={rIdx} sx={{ p: 1, borderLeft: 3, borderColor: 'success.main', bgcolor: 'success.50' }}>
                                    <Typography variant="subtitle2" color="success.dark" sx={{ fontWeight: 'bold' }}>
                                        🧬 Targeted Vulnerability (Synthetic Lethality)
                                    </Typography>
                                    <Typography variant="body2" color="text.primary">
                                        {item.explanation}
                                    </Typography>
                                    {item.confidence_impact && (
                                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>
                                            Match Boost: {item.confidence_impact}
                                        </Typography>
                                    )}
                                </Box>
                            );
                        }
                        if (item.type === 'sequence') {
                            return (
                                <Typography key={rIdx} variant="body2">
                                    🔬 <strong>Genetic Alignment:</strong> {Math.round((item.value || 0) * 100)}%
                                </Typography>
                            );
                        }
                        if (item.type === 'pathway') {
                            // If breakdown exists, show meaningful ones
                            const breakdown = item.breakdown ? Object.entries(item.breakdown).filter(([k, v]) => v > 0).map(([k, v]) => humanize(k)).join(', ') : '';
                            return (
                                <Typography key={rIdx} variant="body2">
                                    🛣️ <strong>Pathway Fit:</strong> {Math.round((item.percentile || 0) * 100)}% {breakdown ? `(${breakdown})` : ''}
                                </Typography>
                            );
                        }
                        if (item.type === 'evidence') {
                            return (
                                <Typography key={rIdx} variant="body2">
                                    📚 <strong>Evidence Level:</strong> {item.strength || 0}
                                </Typography>
                            );
                        }
                        return (
                            <Typography key={rIdx} variant="body2" color="text.secondary">
                                • {safeRender(item.explanation || item.value || JSON.stringify(item))}
                            </Typography>
                        );
                    })}
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
                {safeRender(rationale)}
            </Typography>
        </Box>
    );
}

EvidenceRenderer.propTypes = {
    rationale: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.object)
    ])
};
