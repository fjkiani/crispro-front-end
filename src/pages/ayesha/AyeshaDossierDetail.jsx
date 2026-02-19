/**
 * Ayesha Dossier Detail View
 * 
 * Full dossier display with:
 * - Markdown rendering (ReactMarkdown + remark-gfm)
 * - Export (client-side download)
 * - Share link
 * - Back to list navigation
 * 
 * Data source: localStorage via dossierStore (no backend dependency)
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Breadcrumbs,
  Link,
  Grid,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  ArrowLeftIcon,
  ShareIcon,
  DocumentArrowDownIcon,
  BeakerIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ResistanceProphetCard from '../../components/ayesha/ResistanceProphetCard';
import { getDossier } from '../../utils/dossierStore';


const getTierColor = (tier) => {
  switch (tier) {
    case 'TOP_TIER': return 'success';
    case 'GOOD_TIER': return 'info';
    default: return 'default';
  }
};

const HolisticScoreBreakdown = ({ breakdown, weights }) => {
  if (!breakdown) return null;

  const components = [
    {
      label: 'Mechanism Fit',
      score: breakdown.mechanism_fit_score,
      weight: weights?.mechanism_fit || 0.4,
      icon: <BeakerIcon className="h-4 w-4" />,
      color: 'primary'
    },
    {
      label: 'Eligibility',
      score: breakdown.eligibility_score,
      weight: weights?.eligibility || 0.3,
      icon: <UserGroupIcon className="h-4 w-4" />,
      color: 'info'
    },
    {
      label: 'PGx Safety',
      score: breakdown.pgx_safety_score,
      weight: weights?.pgx_safety || 0.15,
      icon: <ShieldCheckIcon className="h-4 w-4" />,
      color: 'success'
    },
    {
      label: 'Resistance Risk',
      score: breakdown.resistance_risk_score,
      weight: weights?.resistance_risk || 0.15,
      icon: <ChartBarIcon className="h-4 w-4" />,
      color: breakdown.resistance_risk_score < 0.5 ? 'error' : 'warning'
    }
  ];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Holistic Score Analysis
      </Typography>
      <Grid container spacing={3}>
        {components.map((comp) => (
          <Grid item xs={12} sm={6} md={3} key={comp.label}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              {comp.icon}
              <Typography variant="subtitle2">{comp.label}</Typography>
              <Chip label={`${(comp.weight * 100).toFixed(0)}%`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <LinearProgress
                variant="determinate"
                value={(comp.score || 0) * 100}
                color={comp.color}
                sx={{ flex: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" fontWeight="bold">
                {((comp.score || 0) * 100).toFixed(0)}%
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

const AyeshaDossierDetail = () => {
  const { nct_id } = useParams();
  const navigate = useNavigate();

  const [dossier, setDossier] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (nct_id) {
      const found = getDossier(nct_id);
      if (found) {
        setDossier(found);
      } else {
        setNotFound(true);
      }
    }
  }, [nct_id]);

  const handleExport = () => {
    if (!dossier?.markdown) return;
    const blob = new Blob([dossier.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nct_id}_DOSSIER.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Dossier link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link. Please copy manually: ' + url);
    });
  };

  if (notFound) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          Dossier not found for {nct_id}. It may have been cleared from browser storage.
        </Alert>
        <Button
          startIcon={<ArrowLeftIcon className="h-5 w-5" />}
          onClick={() => navigate('/ayesha-dossiers')}
          sx={{ mt: 2 }}
          variant="outlined"
        >
          Back to List
        </Button>
      </Box>
    );
  }

  if (!dossier) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="body1" color="text.secondary">
          Loading dossier...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/ayesha-dossiers')}
          underline="hover"
          sx={{ cursor: 'pointer' }}
        >
          All Dossiers
        </Link>
        <Typography variant="body2" color="text.primary">
          {dossier.title || dossier.nct_id}
        </Typography>
      </Breadcrumbs>

      {/* Action Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Button
          startIcon={<ArrowLeftIcon className="h-5 w-5" />}
          onClick={() => navigate('/ayesha-dossiers')}
          variant="outlined"
        >
          Back to List
        </Button>

        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            startIcon={<ShareIcon className="h-5 w-5" />}
            onClick={handleShare}
            variant="outlined"
          >
            Share Link
          </Button>
          <Button
            startIcon={<DocumentArrowDownIcon className="h-5 w-5" />}
            onClick={handleExport}
            variant="contained"
          >
            Export Dossier
          </Button>
        </Box>
      </Box>

      {/* Dossier Metadata */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              Dossier ID
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {dossier.nct_id}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              Match Tier
            </Typography>
            <Box mt={0.5}>
              <Chip
                label={dossier.metadata?.tier || dossier.tier || 'UNKNOWN'}
                size="small"
                color={getTierColor(dossier.metadata?.tier || dossier.tier)}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              Efficacy Score
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {dossier.metadata?.match_score
                ? Math.round(dossier.metadata.match_score * 100)
                : dossier.match_score
                  ? Math.round(dossier.match_score * 100)
                  : 0}%
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Holistic Score Analysis */}
      <HolisticScoreBreakdown
        breakdown={dossier.metadata?.holistic_score_breakdown}
        weights={dossier.metadata?.weights}
      />

      {/* Resistance Prophet Predictions */}
      <ResistanceProphetCard resistance_prediction={dossier.metadata?.resistance_prediction} />

      {/* Markdown Content */}
      <Paper sx={{ p: 4 }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <Typography variant="h3" gutterBottom sx={{ mt: 4, mb: 2 }} {...props} />
            ),
            h2: ({ node, ...props }) => (
              <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 2 }} {...props} />
            ),
            h3: ({ node, ...props }) => (
              <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 1 }} {...props} />
            ),
            p: ({ node, ...props }) => (
              <Typography variant="body1" paragraph {...props} />
            ),
            table: ({ node, ...props }) => (
              <Box sx={{ overflowX: 'auto', my: 2 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }} {...props} />
              </Box>
            ),
            th: ({ node, ...props }) => (
              <th style={{
                border: '1px solid #ddd',
                padding: '12px',
                backgroundColor: '#f5f5f5',
                textAlign: 'left'
              }} {...props} />
            ),
            td: ({ node, ...props }) => (
              <td style={{
                border: '1px solid #ddd',
                padding: '12px'
              }} {...props} />
            ),
            code: ({ node, inline, ...props }) => (
              <Box
                component={inline ? 'span' : 'pre'}
                sx={{
                  bgcolor: 'grey.100',
                  p: inline ? 0.5 : 2,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  overflow: 'auto',
                  display: inline ? 'inline' : 'block'
                }}
                {...props}
              />
            ),
            blockquote: ({ node, ...props }) => (
              <Box
                sx={{
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                  pl: 2,
                  py: 1,
                  my: 2,
                  bgcolor: 'grey.50',
                  fontStyle: 'italic'
                }}
                {...props}
              />
            ),
          }}
        >
          {dossier.markdown || '_No analysis content available._'}
        </ReactMarkdown>
      </Paper>

      {/* Bottom Actions */}
      <Box display="flex" justifyContent="space-between" mt={3} flexWrap="wrap" gap={2}>
        <Button
          startIcon={<ArrowLeftIcon className="h-5 w-5" />}
          onClick={() => navigate('/ayesha-dossiers')}
          variant="outlined"
        >
          Back to List
        </Button>

        <Button
          startIcon={<DocumentArrowDownIcon className="h-5 w-5" />}
          onClick={handleExport}
          variant="contained"
        >
          Download Dossier
        </Button>
      </Box>
    </Box>
  );
};

export default AyeshaDossierDetail;
