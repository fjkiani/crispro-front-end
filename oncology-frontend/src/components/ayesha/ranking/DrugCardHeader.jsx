import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Chip } from '@mui/material';
import { safeRender, getTierColor, getBadgeColor } from '../../../utils/drugRendering';

export default function DrugCardHeader({ drug, index }) {
    const evidenceTier = drug.evidence_tier || drug.tier || 'unknown';
    const clinicalBand = drug.clinical_band || null;
    const citationsCount = (
        typeof drug.citations_count === 'number'
            ? drug.citations_count
            : Array.isArray(drug.citations) ? drug.citations.length : null
    );
    const labelStatus = (drug.label_status || 'UNKNOWN').toUpperCase();
    const isRUO = labelStatus !== 'ON_LABEL' || Boolean(drug.ruo_reason);

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {index + 1}. {safeRender(drug.name || drug.drug || "Unknown Agent")}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    {safeRender(evidenceTier).toUpperCase() !== 'UNKNOWN' && (
                        <Chip
                            label={`Tier: ${safeRender(evidenceTier).toUpperCase()}`}
                            color={getTierColor(evidenceTier)}
                            size="small"
                        />
                    )}
                    {clinicalBand && (
                        <Chip
                            label={`Band: ${safeRender(clinicalBand)}`}
                            size="small"
                            variant="outlined"
                        />
                    )}
                    {typeof citationsCount === 'number' && (
                        <Chip
                            label={citationsCount > 0 ? `Citations: ${citationsCount}` : 'No citations surfaced'}
                            size="small"
                            color={citationsCount > 0 ? 'success' : 'default'}
                            variant="outlined"
                        />
                    )}
                    {isRUO && (
                        <Chip
                            label={labelStatus === 'OFF_LABEL' ? 'RUO: Off-label' : 'RUO'}
                            size="small"
                            color="warning"
                            variant="outlined"
                            title={safeRender(drug.ruo_reason) || 'Research Use Only'}
                        />
                    )}
                    {/* Completeness Level Badge */}
                    {drug.sporadic_gates_provenance?.level && (
                        <Chip
                            label={safeRender(drug.sporadic_gates_provenance.level) === 'L1' ? 'Data: Preliminary (L1)' :
                                safeRender(drug.sporadic_gates_provenance.level) === 'L2' ? 'Data: Comprehensive (L2)' : 'Data: Minimal'}
                            color={safeRender(drug.sporadic_gates_provenance.level) === 'L2' ? 'success' :
                                safeRender(drug.sporadic_gates_provenance.level) === 'L1' ? 'warning' : 'error'}
                            size="small"
                            variant="outlined"
                            title={safeRender(drug.sporadic_gates_provenance.level) === 'L1' ? 'Partial biomarkers (TMB/MSI/HRD incomplete)' : 'Full biomarker panel available'}
                        />
                    )}
                    {drug.badges && drug.badges.map((badge, bidx) => (
                        <Chip
                            key={bidx}
                            label={safeRender(badge)}
                            color={getBadgeColor(badge)}
                            size="small"
                            variant="outlined"
                        />
                    ))}
                </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {Math.round((drug.efficacy_score || 0) * 100)}% Match
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Confidence: {Math.round((drug.confidence || 0) * 100)}%
                </Typography>
            </Box>
        </Box>
    );
}

DrugCardHeader.propTypes = {
    drug: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired
};
