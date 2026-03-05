import React from 'react';
import {
    Box, Typography, Paper, Grid,
    LinearProgress, Divider
} from '@mui/material';
import {
    CheckCircle, Cancel, HelpOutline
} from '@mui/icons-material';

const StatusIcon = ({ status }) => {
    if (status === 'present') return <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />;
    if (status === 'missing') return <Cancel sx={{ fontSize: 18, color: 'error.main' }} />;
    return <HelpOutline sx={{ fontSize: 18, color: 'text.disabled' }} />;
};

const StatusLabel = ({ value }) => {
    if (value === null || value === undefined) {
        return <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>Unknown — not provided</Typography>;
    }
    return <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>{String(value)}</Typography>;
};

const SnapshotCard = ({ profile }) => {
    const patient = profile?.patient || {};
    const disease = profile?.disease || {};
    const germline = profile?.germline || {};
    const tumorContext = profile?.tumor_context || {};
    const treatments = patient?.treatment_history || [];
    const labs = profile?.labs || {};

    const dataFields = [
        { label: 'Diagnosis', value: disease.histology || disease.type, key: 'diagnosis' },
        { label: 'Stage', value: disease.stage, key: 'stage' },
        { label: 'Germline Status', value: germline?.status, key: 'germline' },
        { label: 'MBD4 Mutation', value: germline?.mutations?.find(m => m.gene === 'MBD4')?.variant, key: 'mbd4' },
        { label: 'TP53 Mutation', value: tumorContext?.somatic_mutations?.find(m => m.gene === 'TP53')?.source, key: 'tp53' },
        { label: 'HRD Score', value: tumorContext?.hrd_score, key: 'hrd' },
        { label: 'TMB', value: tumorContext?.tmb, key: 'tmb' },
        { label: 'PD-L1 CPS', value: tumorContext?.biomarkers?.pd_l1_cps, key: 'pdl1' },
        { label: 'FOLR1', value: tumorContext?.biomarkers?.folr1_status, key: 'folr1' },
        { label: 'Treatment Lines', value: treatments.length > 0 ? `${treatments.length} recorded` : null, key: 'treatments' },
        { label: 'CA-125 Baseline', value: labs?.ca125_value ? `${labs.ca125_value} ${labs.ca125_units}` : null, key: 'ca125' },
    ];

    const presentCount = dataFields.filter(f => f.value != null).length;
    const totalCount = dataFields.length;
    const completeness = Math.round((presentCount / totalCount) * 100);

    return (
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Your Care Snapshot
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                This is what we currently know about your situation. Missing items are clearly marked.
            </Typography>

            {/* Completeness meter */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Data Completeness</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: completeness > 70 ? 'success.main' : completeness > 40 ? 'warning.main' : 'error.main' }}>
                        {completeness}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={completeness}
                    sx={{
                        height: 10, borderRadius: 5,
                        bgcolor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            bgcolor: completeness > 70 ? 'success.main' : completeness > 40 ? 'warning.main' : 'error.main',
                        }
                    }}
                />
                {completeness < 100 && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                        {totalCount - presentCount} field{totalCount - presentCount > 1 ? 's' : ''} missing — testing can fill these gaps
                    </Typography>
                )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Data fields — two columns */}
            <Grid container spacing={2}>
                {dataFields.map(field => (
                    <Grid item xs={12} sm={6} key={field.key}>
                        <Box sx={{
                            display: 'flex', alignItems: 'flex-start', gap: 1,
                            p: 1.5, borderRadius: 2,
                            bgcolor: field.value != null ? '#f0fdf4' : '#fef2f2',
                            border: '1px solid',
                            borderColor: field.value != null ? '#bbf7d0' : '#fecaca',
                        }}>
                            <StatusIcon status={field.value != null ? 'present' : 'missing'} />
                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    {field.label}
                                </Typography>
                                <StatusLabel value={field.value} />
                            </Box>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
};

export default SnapshotCard;
