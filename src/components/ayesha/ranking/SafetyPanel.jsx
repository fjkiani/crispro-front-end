import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Chip } from '@mui/material';
import { safeRender } from '../../../utils/drugRendering';

export default function SafetyPanel({ pgxScreening }) {
    if (!pgxScreening || !pgxScreening.screened) return null;

    return (
        <Box sx={{ mb: 2, p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Safety Check (PGx)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip
                    label={`Risk: ${safeRender(pgxScreening.toxicity_tier) || 'UNKNOWN'}`}
                    size="small"
                    color={
                        safeRender(pgxScreening.toxicity_tier).toUpperCase() === 'HIGH' ? 'error' :
                            safeRender(pgxScreening.toxicity_tier).toUpperCase() === 'MODERATE' ? 'warning' :
                                'success'
                    }
                    variant="outlined"
                />
                {typeof pgxScreening.adjustment_factor === 'number' && (
                    <Chip
                        label={`Dose Adj: ${pgxScreening.adjustment_factor.toFixed(2)}×`}
                        size="small"
                        variant="outlined"
                    />
                )}
            </Box>
            {pgxScreening.rationale && (
                <Typography variant="body2" color="text.secondary">
                    {safeRender(pgxScreening.rationale)}
                </Typography>
            )}
            {Array.isArray(pgxScreening.alerts) && pgxScreening.alerts.length > 0 && (
                <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                        Safety Alerts
                    </Typography>
                    {pgxScreening.alerts.slice(0, 3).map((a, aidx) => (
                        <Typography key={aidx} variant="body2" sx={{ mt: 0.5 }}>
                            • <strong>{safeRender(a.gene)}</strong>: {safeRender(a.message)}
                        </Typography>
                    ))}
                </Box>
            )}
        </Box>
    );
}

SafetyPanel.propTypes = {
    pgxScreening: PropTypes.object
};
