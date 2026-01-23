/**
 * Universal Dossier Summary Card Component
 * 
 * Reusable card for displaying dossier metadata for any patient.
 * Similar to Ayesha's DossierSummaryCard but patient-agnostic.
 */
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  LinearProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const UniversalDossierSummaryCard = ({ dossier, rank, patientId, onViewClick }) => {
  const navigate = useNavigate();

  if (!dossier) return null;

  const getTierColor = (tier) => {
    switch(tier) {
      case 'TOP_TIER': return 'success';
      case 'GOOD_TIER': return 'info';
      default: return 'default';
    }
  };

  const getTierLabel = (tier) => {
    switch(tier) {
      case 'TOP_TIER': return '⭐ Top Tier';
      case 'GOOD_TIER': return '✅ Good Tier';
      default: return '📋 Acceptable';
    }
  };

  const scorePercent = Math.round((dossier.match_score || 0) * 100);

  const handleViewClick = () => {
    if (onViewClick) {
      onViewClick(dossier.nct_id);
    } else {
      navigate(`/universal-dossiers/${patientId}/${dossier.nct_id}`);
    }
  };

  return (
    <Card sx={{ 
      border: '1px solid',
      borderColor: dossier.tier === 'TOP_TIER' ? 'success.main' : 'grey.300',
      '&:hover': { boxShadow: 3 },
      transition: 'box-shadow 0.2s'
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start" gap={2}>
          {/* Left: Title & Metadata */}
          <Box flex={1} minWidth={0}>
            <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
              {rank && (
                <Chip
                  label={`#${rank}`}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 'bold' }}
                />
              )}
              <Chip
                label={getTierLabel(dossier.tier)}
                size="small"
                color={getTierColor(dossier.tier)}
              />
            </Box>

            <Typography variant="h6" gutterBottom sx={{ wordBreak: 'break-word' }}>
              {dossier.title || dossier.nct_id}
            </Typography>

            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              <Chip 
                label={dossier.nct_id} 
                size="small" 
                variant="outlined"
                sx={{ fontFamily: 'monospace' }}
              />
              {dossier.phase && (
                <Chip 
                  label={dossier.phase} 
                  size="small" 
                  variant="outlined" 
                />
              )}
            </Box>
          </Box>

          {/* Right: Match Score */}
          <Box textAlign="right" minWidth="120px" flexShrink={0}>
            <Typography 
              variant="h4" 
              color={scorePercent >= 80 ? 'success.main' : 'text.primary'}
              fontWeight="bold"
            >
              {scorePercent}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Match Score
            </Typography>
            <LinearProgress
              variant="determinate"
              value={scorePercent}
              color={scorePercent >= 80 ? 'success' : 'primary'}
              sx={{ mt: 1, height: 8, borderRadius: 4 }}
            />
          </Box>
        </Box>

        {/* Actions */}
        <Box display="flex" gap={2} mt={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<DocumentTextIcon className="h-5 w-5" />}
            onClick={handleViewClick}
            size="small"
          >
            View Full Dossier
          </Button>
          <Button
            variant="outlined"
            href={`https://clinicaltrials.gov/study/${dossier.nct_id}`}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
          >
            ClinicalTrials.gov
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UniversalDossierSummaryCard;


