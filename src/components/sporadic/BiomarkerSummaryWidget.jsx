import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ScienceIcon from '@mui/icons-material/Science';

/**
 * BiomarkerSummaryWidget Component (Agent Jr Mission 4)
 * 
 * Displays a summary of tumor biomarkers (TMB, HRD, MSI) and data level.
 * Shown at the top of WIWFM results to provide context for sporadic scoring.
 * 
 * Props:
 * - tumorContext: TumorContext object from SporadicContext
 * - dataLevel: "L0", "L1", or "L2" from SporadicContext
 * - germlineStatus: "positive", "negative", or "unknown"
 */
export default function BiomarkerSummaryWidget({ tumorContext, dataLevel, germlineStatus }) {
  if (!tumorContext) {
    return null; // No tumor context available
  }

  const tmb = tumorContext.tmb;
  const hrdScore = tumorContext.hrd_score;
  const msiStatus = tumorContext.msi_status;
  const completeness = tumorContext.completeness_score || 0;

  // Determine TMB category
  const getTMBCategory = () => {
    if (tmb === null || tmb === undefined) return { label: 'Unknown', color: 'default' };
    if (tmb >= 20) return { label: 'TMB-High (≥20)', color: 'success' };
    if (tmb >= 10) return { label: 'TMB-Intermediate (≥10)', color: 'warning' };
    return { label: 'TMB-Low (<10)', color: 'default' };
  };

  // Determine HRD category
  const getHRDCategory = () => {
    if (hrdScore === null || hrdScore === undefined) return { label: 'Unknown', color: 'default' };
    if (hrdScore >= 42) return { label: 'HRD-High (≥42)', color: 'success' };
    return { label: 'HRD-Low (<42)', color: 'warning' };
  };

  // Determine MSI category
  const getMSICategory = () => {
    if (!msiStatus) return { label: 'MSS', color: 'default' };
    const msiUpper = String(msiStatus).toUpperCase();
    if (msiUpper === 'MSI-H' || msiUpper === 'MSI-HIGH') {
      return { label: 'MSI-High', color: 'success' };
    }
    return { label: 'MSI-Stable', color: 'default' };
  };

  // Determine level color
  const getLevelColor = () => {
    if (dataLevel === 'L2') return 'success';
    if (dataLevel === 'L1') return 'warning';
    return 'default';
  };

  const tmbCategory = getTMBCategory();
  const hrdCategory = getHRDCategory();
  const msiCategory = getMSICategory();

  return (
    <Card sx={{ backgroundColor: '#252525', border: '1px solid #444', mb: 3 }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <ScienceIcon sx={{ color: '#00bcd4' }} />
          <Typography variant="h6" sx={{ flex: 1 }}>
            Using Tumor Context
          </Typography>
          <Chip
            label={`Germline ${germlineStatus || 'unknown'}`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
          <Chip
            label={dataLevel || 'L0'}
            size="small"
            color={getLevelColor()}
            sx={{ fontSize: '0.7rem' }}
          />
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          {/* TMB */}
          <Box sx={{ minWidth: 150 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              TMB (mutations/Mb)
            </Typography>
            <Chip
              label={tmb !== null && tmb !== undefined ? `${tmb.toFixed(1)} - ${tmbCategory.label}` : 'Unknown'}
              size="small"
              color={tmbCategory.color}
              sx={{ fontSize: '0.75rem' }}
            />
          </Box>

          {/* HRD Score */}
          <Box sx={{ minWidth: 150 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              HRD Score
            </Typography>
            <Chip
              label={hrdScore !== null && hrdScore !== undefined ? `${hrdScore.toFixed(1)} - ${hrdCategory.label}` : 'Unknown'}
              size="small"
              color={hrdCategory.color}
              sx={{ fontSize: '0.75rem' }}
            />
          </Box>

          {/* MSI Status */}
          <Box sx={{ minWidth: 150 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              MSI Status
            </Typography>
            <Chip
              label={msiStatus ? `${msiStatus} - ${msiCategory.label}` : 'MSS'}
              size="small"
              color={msiCategory.color}
              sx={{ fontSize: '0.75rem' }}
            />
          </Box>

          {/* Completeness */}
          <Box sx={{ minWidth: 150 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Data Completeness
            </Typography>
            <Chip
              label={`${(completeness * 100).toFixed(0)}%`}
              size="small"
              color={completeness >= 0.7 ? 'success' : completeness >= 0.3 ? 'warning' : 'default'}
              sx={{ fontSize: '0.75rem' }}
            />
          </Box>
        </Stack>

        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoOutlinedIcon sx={{ color: '#00bcd4', fontSize: 16 }} />
          <Typography variant="caption" color="text.secondary">
            Efficacy predictions include sporadic-aware scoring (PARP penalties, IO boosts, confidence capping)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}



