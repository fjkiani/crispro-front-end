import React, { useMemo } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    Grid,
    Divider,
} from '@mui/material';
import {
    CheckCircle as AvailableIcon,
    Cancel as MissingIcon,
} from '@mui/icons-material';

const WhereAmI = ({ patientProfile }) => {
    // Synthesize patient status (works with ANY patient data structure)
    const patientStatus = useMemo(() => {
        if (!patientProfile) return null;

        // Handle both flat and hierarchical structures
        const disease = patientProfile.disease || (typeof patientProfile.disease === 'string' ? {} : patientProfile.disease) || {};
        const tumorContext = patientProfile.tumor_context || {};
        const germline = patientProfile.germline || {};
        const treatment = patientProfile.treatment || {};

        // Calculate completeness
        const completenessScore = tumorContext.completeness_score ||
            (tumorContext.biomarkers ? 0.3 : 0) +
            (germline.mutations?.length > 0 ? 0.25 : 0) +
            (tumorContext.somatic_mutations?.some(m => m.genomic_coordinate_hg38) ? 0.3 : 0) +
            (patientProfile.ca125_value ? 0.15 : 0);

        const intakeLevel = completenessScore >= 0.7 ? 'L2' : completenessScore >= 0.3 ? 'L1' : 'L0';

        // Determine what's available
        const hasIHC = !!tumorContext.biomarkers;
        const hasGermline = !!germline.mutations && germline.mutations.length > 0;
        const hasNGS = !!tumorContext.somatic_mutations?.some(m => m.genomic_coordinate_hg38);
        const hasCA125 = !!patientProfile.ca125_value || !!patientProfile.ca125_baseline;

        // Get disease info (handle both structures)
        const diseaseType = disease.type || patientProfile.disease || 'Unknown';
        const diseaseStage = disease.stage || patientProfile.stage || 'Unknown';
        const treatmentLine = treatment.line_number || treatment.line || patientProfile.treatment_line || 0;

        // Key biomarkers
        const biomarkers = [];
        if (tumorContext.biomarkers?.pd_l1_status === 'POSITIVE') {
            biomarkers.push(`PD-L1+ (CPS ${tumorContext.biomarkers.pd_l1_cps || ''})`);
        }
        if (tumorContext.biomarkers?.her2_status) {
            biomarkers.push(`HER2 ${tumorContext.biomarkers.her2_status}`);
        }
        if (tumorContext.somatic_mutations?.some(m => m.gene === 'TP53')) {
            biomarkers.push('TP53 Mutant');
        }
        if (germline.mutations?.some(m => m.gene === 'MBD4')) {
            biomarkers.push('MBD4 Germline');
        }

        return {
            diseaseType,
            diseaseStage,
            treatmentLine,
            completenessScore,
            intakeLevel,
            hasIHC,
            hasGermline,
            hasNGS,
            hasCA125,
            biomarkers,
        };
    }, [patientProfile]);

    if (!patientProfile || !patientStatus) {
        return (
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Typography variant="body2" color="text.secondary">
                        Loading patient status...
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    const getIntakeLevelColor = (level) => {
        switch (level) {
            case 'L2': return 'success';
            case 'L1': return 'warning';
            case 'L0': return 'error';
            default: return 'default';
        }
    };

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        Where Am I?
                    </Typography>
                    <Chip
                        label={`${patientStatus.intakeLevel} Level`}
                        color={getIntakeLevelColor(patientStatus.intakeLevel)}
                        size="small"
                    />
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Disease Status */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                            Disease
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                            {patientStatus.diseaseType.replace(/_/g, ' ').toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                            Stage
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                            {patientStatus.diseaseStage}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                            Treatment Line
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                            {patientStatus.treatmentLine}
                        </Typography>
                    </Grid>
                </Grid>

                {/* Key Biomarkers */}
                {patientStatus.biomarkers.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Key Biomarkers
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {patientStatus.biomarkers.map((bio, idx) => (
                                <Chip key={idx} label={bio} size="small" color="primary" variant="outlined" />
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Data Completeness */}
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            Data Completeness
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                            {Math.round(patientStatus.completenessScore * 100)}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={patientStatus.completenessScore * 100}
                        sx={{ height: 8, borderRadius: 1 }}
                        color={patientStatus.completenessScore >= 0.7 ? 'success' : patientStatus.completenessScore >= 0.3 ? 'warning' : 'error'}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        {patientStatus.hasIHC && <Chip icon={<AvailableIcon />} label="IHC" size="small" color="success" />}
                        {patientStatus.hasGermline && <Chip icon={<AvailableIcon />} label="Germline" size="small" color="success" />}
                        {patientStatus.hasNGS && <Chip icon={<AvailableIcon />} label="NGS" size="small" color="success" />}
                        {patientStatus.hasCA125 && <Chip icon={<AvailableIcon />} label="CA-125" size="small" color="success" />}
                        {!patientStatus.hasNGS && <Chip icon={<MissingIcon />} label="NGS Missing" size="small" color="warning" />}
                        {!patientStatus.hasCA125 && <Chip icon={<MissingIcon />} label="CA-125 Missing" size="small" color="warning" />}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default WhereAmI;
