/**
 * ProvenanceLog — therapy fit provenance footer.
 * Shows engine version, contract, and generation date.
 *
 * Used by: Phase3Treatment, AyeshaTherapyFit
 */
import React from 'react';
import { Typography, Box } from '@mui/material';
import '../therapy-fit/therapy-fit.css';

export default function ProvenanceLog({ contractVersion = 'v2.1' }) {
    return (
        <Box className="tf-provenance">
            <Typography variant="caption" className="tf-provenance__label">
                PROVENANCE LOG
            </Typography>
            <Typography variant="caption" className="tf-provenance__detail">
                Engine: therapy_fit_v2 // Analysis mode: {contractVersion} //
                Data generated: {new Date().toLocaleDateString()}
            </Typography>
        </Box>
    );
}
