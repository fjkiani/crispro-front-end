import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  LinearProgress,
  Tooltip,
  Grid,
  Alert
} from '@mui/material';
import {
  Close,
  LocalPharmacy,
  Info,
  TrendingUp,
  CheckCircle,
  Science
} from '@mui/icons-material';

/**
 * DrugDetailModal Component
 * 
 * Displays detailed information about a drug recommendation in a modal dialog
 * 
 * @param {Object} props
 * @param {DrugRecommendation} props.drug - Drug recommendation object
 * @param {boolean} props.open - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 */
const DrugDetailModal = ({ drug, open, onClose }) => {
  if (!drug) return null;

  const alignmentScore = drug.alignment_score || 0;
  const confidence = drug.confidence || 0;

  const getEvidenceTierColor = (tier) => {
    switch (tier?.toUpperCase()) {
      case 'SUPPORTED':
        return 'success';
      case 'CONSIDER':
        return 'warning';
      case 'INSUFFICIENT':
        return 'error';
      default:
        return 'default';
    }
  };

  const getAlignmentColor = (score) => {
    if (score >= 0.7) return 'success';
    if (score >= 0.5) return 'warning';
    return 'error';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalPharmacy color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {drug.name || 'Unknown Drug'}
            </Typography>
          </Box>
          <Button
            onClick={onClose}
            size="small"
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Critical Disclaimer */}
        <Alert 
          severity="info" 
          icon={<Info />}
          sx={{ 
            mb: 3,
            backgroundColor: '#e3f2fd',
            borderLeft: '4px solid #1976d2'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Mechanism Alignment Assessment
          </Typography>
          <Typography variant="caption">
            This alignment score reflects how well this drug targets the disrupted pathways in this tumor.
            It does <strong>NOT</strong> predict response rates or survival outcomes.
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Drug Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Drug Class
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {drug.class || 'Unknown'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Evidence Tier
                  </Typography>
                  <Chip
                    label={drug.evidence_tier || 'INSUFFICIENT'}
                    color={getEvidenceTierColor(drug.evidence_tier)}
                    size="small"
                    icon={<CheckCircle />}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Mechanism Alignment Score - Prominent */}
          <Grid item xs={12}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 2,
              border: '2px solid',
              borderColor: `${getAlignmentColor(alignmentScore)}.main`
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Mechanism Alignment Score
                </Typography>
                <Tooltip title="Score reflects how well this drug targets the disrupted pathways. Higher scores indicate better alignment.">
                  <Info fontSize="small" color="action" />
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700,
                    color: `${getAlignmentColor(alignmentScore)}.main`
                  }}
                >
                  {(alignmentScore * 100).toFixed(1)}%
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={alignmentScore * 100}
                    sx={{
                      height: 16,
                      borderRadius: 1,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: `${getAlignmentColor(alignmentScore)}.main`
                      }
                    }}
                  />
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {alignmentScore >= 0.7 ? 'High alignment' : 
                 alignmentScore >= 0.5 ? 'Moderate alignment' : 
                 'Low alignment'} with disrupted pathways
              </Typography>
            </Box>
          </Grid>

          {/* Mechanism of Action */}
          {drug.mechanism && (
            <Grid item xs={12}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Mechanism of Action
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ 
                  p: 2, 
                  bgcolor: 'grey.50', 
                  borderRadius: 1,
                  borderLeft: '3px solid',
                  borderColor: 'primary.main'
                }}>
                  {drug.mechanism}
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Confidence and Clinical Badges */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Confidence Level
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {(confidence * 100).toFixed(0)}%
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={confidence * 100}
                    sx={{
                      height: 10,
                      borderRadius: 1
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Clinical Badges */}
          {drug.clinical_badges && drug.clinical_badges.length > 0 && (
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Clinical Evidence
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {drug.clinical_badges.map((badge, index) => (
                    <Chip
                      key={index}
                      label={badge}
                      size="small"
                      variant="outlined"
                      color="info"
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
          )}

          {/* Rationale */}
          {drug.rationale && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Science fontSize="small" />
                  Biological Rationale
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ 
                  p: 2, 
                  bgcolor: 'grey.50', 
                  borderRadius: 1,
                  borderLeft: '3px solid',
                  borderColor: 'primary.main',
                  whiteSpace: 'pre-wrap'
                }}>
                  {drug.rationale}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DrugDetailModal;
