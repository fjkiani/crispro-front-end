import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Grid,
    Divider,
    LinearProgress,
    IconButton,
    Collapse,
    Alert,
} from '@mui/material';
import {
    ArrowForward as ArrowForwardIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Bolt as BoltIcon,
    Timeline as TimelineIcon,
    Science as ScienceIcon,
    Shield as ShieldIcon,
    Lock as LockIcon,
    LockOpen as LockOpenIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

// ----------------------------------------------------------------------
// 1. ZETA SIGNAL CARD (The Radar)
// ----------------------------------------------------------------------
export const ZetaSignalCard = ({
    title,
    status, // "LOCKED", "SCANNING", "CRITICAL", "STABLE"
    evidenceLevel, // "L1", "L2", "L3"
    evidenceText, // "ATM Loss Detected", "Platinum Resistant"
    inputsUsed, // "24 mutations • HRD"
    color = "primary", // "error", "warning", "success", "info"
    icon,
    actionLabel,
    onAction,
}) => {
    const isCritical = ['error', 'warning'].includes(color);

    const getLevelColor = (level) => {
        if (level === 'L3') return 'secondary'; // Validated/Simulated
        if (level === 'L2') return 'primary'; // Derived
        return 'default'; // Raw/Static
    };

    return (
        <Card
            variant="outlined"
            sx={{
                height: '100%',
                borderTop: 4,
                borderTopColor: `${color}.main`,
                position: 'relative',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 }
            }}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {/* Header: Icon + Status */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                        {icon}
                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                            {title.toUpperCase()}
                        </Typography>
                    </Box>
                    <Chip
                        label={status}
                        size="small"
                        color={color}
                        sx={{ fontWeight: 800, height: 20, fontSize: '0.65rem' }}
                    />
                </Box>

                {/* Evidence Badge (Trust Layer) */}
                <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    <Chip
                        label={evidenceLevel}
                        size="small"
                        variant={evidenceLevel === 'L3' ? 'filled' : 'outlined'}
                        color={getLevelColor(evidenceLevel)}
                        sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700 }}
                    />
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: '100%' }}>
                        {inputsUsed}
                    </Typography>
                </Box>

                {/* Main Evidence Text */}
                <Typography variant="body2" fontWeight="bold" gutterBottom sx={{ minHeight: 40 }}>
                    {evidenceText}
                </Typography>

                {/* Action */}
                <Button
                    fullWidth
                    variant={isCritical ? "contained" : "outlined"}
                    color={color === 'default' ? 'inherit' : color}
                    size="small"
                    onClick={onAction}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ mt: 'auto', textTransform: 'none' }}
                >
                    {actionLabel}
                </Button>
            </CardContent>
        </Card>
    );
};

// ----------------------------------------------------------------------
// 2. ZETA PRIMARY DIRECTIVE (The Main Gun)
// ----------------------------------------------------------------------
export const ZetaPrimaryDirective = ({
    headline,       // "DEPLOY PARP INHIBITOR"
    subheadline,    // "Synthetic Lethality Detected (ATM Loss)"
    reasoning,      // ["Double-hit mechanism verified", "High sensitivity predicted"]
    receipts,       // { level: "L2", inputs: ["NGS", "HRD"], missing: [] }
    actionLabel,    // "View Digital Twin"
    onAction,
    color = "primary",
}) => {
    return (
        <Card
            elevation={3}
            sx={{
                bgcolor: `${color}.50`,
                border: '1px solid',
                borderColor: `${color}.main`,
                position: 'relative',
                overflow: 'visible'
            }}
        >
            {/* "PRIMARY DIRECTIVE" Badge */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -12,
                    left: 20,
                    bgcolor: `${color}.main`,
                    color: 'white',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    letterSpacing: 1,
                    boxShadow: 2
                }}
            >
                PRIMARY DIRECTIVE
            </Box>

            <CardContent sx={{ pt: 3.5 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <Typography variant="h5" fontWeight="900" color={`${color}.main`} gutterBottom>
                            {headline}
                        </Typography>
                        <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 600 }}>
                            {subheadline}
                        </Typography>

                        <Box component="ul" sx={{ pl: 2, m: 0, mb: 2 }}>
                            {reasoning.map((r, i) => (
                                <Box component="li" key={i}>
                                    <Typography variant="body1">{r}</Typography>
                                </Box>
                            ))}
                        </Box>

                        {/* Trust Strip */}
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <Chip
                                label={`EVIDENCE: ${receipts.level}`}
                                size="small"
                                color={receipts.level === 'L3' ? 'secondary' : 'default'}
                                sx={{ borderRadius: 0.5, fontWeight: 'bold' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                <strong>INPUTS USED:</strong> {receipts.inputs.join(', ')}
                            </Typography>
                            {receipts.missing?.length > 0 && (
                                <Typography variant="caption" color="error.main">
                                    (Missing: {receipts.missing.join(', ')})
                                </Typography>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4} display="flex" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            color={color}
                            size="large"
                            onClick={onAction}
                            endIcon={<ArrowForwardIcon />}
                            sx={{ px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
                        >
                            {actionLabel}
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

// ----------------------------------------------------------------------
// 3. ZETA TRIAL CARD (Reinforcements)
// ----------------------------------------------------------------------
export const ZetaTrialCard = ({ trial, rank, onClick }) => {
    if (!trial) return null;

    return (
        <Card
            variant="outlined"
            sx={{
                mb: 1.5,
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover', cursor: 'pointer' },
                transition: 'all 0.1s'
            }}
            onClick={onClick}
        >
            <CardContent sx={{ p: '16px !important' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                        {/* Rank Box */}
                        <Box
                            sx={{
                                bgcolor: 'grey.100',
                                borderRadius: 1,
                                p: 1,
                                minWidth: 48,
                                textAlign: 'center'
                            }}
                        >
                            <Typography variant="caption" display="block" color="text.secondary">Rank</Typography>
                            <Typography variant="h6" fontWeight="bold" lineHeight={1}>#{rank}</Typography>
                        </Box>

                        {/* Content */}
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ maxWidth: 400 }}>
                                {trial.nct_id}: {trial.title}
                            </Typography>

                            <Box display="flex" gap={1} mt={0.5} alignItems="center">
                                <Chip
                                    label={`${Math.round((trial.holistic_score || trial.match_score) * 100)}% Match`}
                                    size="small"
                                    color="success"
                                    sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    {trial.phase || 'N/A'} • {trial.locations?.[0]?.city || 'Unknown Loc'}
                                </Typography>
                                {/* Mechanism Tags */}
                                {trial.moa_tags?.slice(0, 2).map(tag => (
                                    <Chip
                                        key={tag}
                                        label={tag.replace(/_/g, ' ')}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>

                    <IconButton size="small">
                        <ArrowForwardIcon />
                    </IconButton>
                </Box>
            </CardContent>
        </Card>
    );
};

// ----------------------------------------------------------------------
// 4. INTEL GAPS (Checklist)
// ----------------------------------------------------------------------
export const IntelGapsList = ({ missingTests, onUpload }) => {
    if (!missingTests || missingTests.length === 0) {
        return (
            <Alert severity="success" icon={<CheckCircleIcon />}>
                <Typography variant="subtitle2" fontWeight="bold">Results Verified</Typography>
                All critical intelligence gathered.
            </Alert>
        );
    }

    return (
        <Card variant="outlined" sx={{ height: '100%', bgcolor: 'grey.50' }}>
            <CardContent>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="text.secondary">
                    MISSION STATUS: INTEL GAPS
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                    {missingTests.map((test, idx) => (
                        <Box
                            key={idx}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{
                                p: 1,
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <Box display="flex" gap={1} alignItems="center">
                                <WarningIcon color="warning" sx={{ fontSize: 16 }} />
                                <Typography variant="body2" fontWeight="500">
                                    {test.name || test}
                                </Typography>
                            </Box>
                            <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                sx={{ height: 24, fontSize: '0.65rem' }}
                                onClick={() => onUpload ? onUpload(test.name || test) : null}
                            >
                                Upload
                            </Button>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
};
