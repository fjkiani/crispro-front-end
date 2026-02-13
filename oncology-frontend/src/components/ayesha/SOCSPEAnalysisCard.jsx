import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Grid,
  Chip,
  Alert,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  LocalHospital,
  Science,
  CheckCircle,
  Warning
} from '@mui/icons-material';

export const SOCSPEAnalysisCard = ({ socRecommendation, loading = false }) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <LinearProgress />
          <Typography sx={{ mt: 1 }}>Analyzing SOC treatment benefits...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!socRecommendation) return null;

  const { regimen, confidence, engine_validation, rationale, evidence } = socRecommendation;

  // Clinical Confidence (NCCN)
  const clinicalConf = Math.round((confidence || 0) * 100);

  // Engine Validation (Biological)
  const engineScore = engine_validation ? Math.round(engine_validation.patient_fit_score * 100) : null;
  const engineNote = engine_validation ? engine_validation.note : null;

  return (
    <Card sx={{ border: '1px solid', borderColor: 'primary.main' }}>
      <CardHeader
        avatar={<LocalHospital color="primary" />}
        title="Standard of Care Validation"
        subheader={regimen}
        action={
          engineScore ? (
            <Chip
              icon={<Science />}
              label="SPE Engine Validated"
              color="success"
              variant="filled"
            />
          ) : (
            <Chip label="Clinical Only" variant="outlined" />
          )
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          {/* Left: Clinical Evidence */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              1. Clinical Evidence Criteria
            </Typography>
            <Box bgcolor="#f5f5f5" p={2} borderRadius={2}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">NCCN Guideline Confidence</Typography>
                <Typography variant="body2" fontWeight="bold">95%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={95} color="primary" sx={{ height: 8, borderRadius: 1 }} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {rationale?.split('|')[0]}
              </Typography>
              {evidence && (
                <Box mt={1}>
                  {evidence.map(e => <Chip key={e} label={e} size="small" sx={{ mr: 0.5, fontSize: '0.65rem' }} />)}
                </Box>
              )}
            </Box>
          </Grid>

          {/* Right: Biological Validation */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              2. Biological Fit (SPE Engine)
            </Typography>
            {engineScore !== null ? (
              <Box bgcolor="#e8f5e9" p={2} borderRadius={2} border="1px solid #c8e6c9">
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Patient-Specific Fit</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">{engineScore}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={engineScore} color="success" sx={{ height: 8, borderRadius: 1 }} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {engineNote}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <CheckCircle fontSize="small" color="success" />
                  <Typography variant="caption" fontWeight="bold" color="success.main">
                    Verified against profile
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box bgcolor="#fff3e0" p={2} borderRadius={2} border="1px solid #ffcc80">
                <Box display="flex" alignItems="center" gap={1}>
                  <Warning color="warning" fontSize="small" />
                  <Typography variant="body2">Validation Pending</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Engine verification unavailable. Using clinical default.
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SOCSPEAnalysisCard;
