/**
 * ProvenanceLog — therapy fit provenance footer.
 * Shows engine version, run ID, and generation date from real data.
 * No fabricated engine names or client-side dates.
 *
 * Props:
 *   contractVersion — optional version string
 *   provenance       — { engine_used, run_id } from API
 *   generatedAt      — timestamp from bundle
 */
import React from 'react';
import { Typography, Box } from '@mui/material';
import '../therapy-fit/therapy-fit.css';

export default function ProvenanceLog({ contractVersion, provenance, generatedAt }) {
    const engine = provenance?.engine_used || null;
    const runId = provenance?.run_id || null;

    return (
        <Box className="tf-provenance">
            <Typography variant="caption" className="tf-provenance__label">
                PROVENANCE LOG
            </Typography>
            <Typography variant="caption" className="tf-provenance__detail">
                Engine: {engine || '—'}{contractVersion ? ` // Mode: ${contractVersion}` : ''}{runId ? ` // Run: ${runId}` : ''} //
                Generated: {generatedAt || '—'}
            </Typography>
        </Box>
    );
}
