/**
 * Ayesha Dossier Detail View
 * 
 * Full dossier display with:
 * - Markdown rendering
 * - Export options (markdown download)
 * - Share link functionality
 * - Back to list navigation
 * 
 * Modular architecture:
 * - Separate markdown renderer (can be extracted to component)
 * - Export logic isolated (can be extracted to hook)
 * - Share logic isolated (can be extracted to hook)
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Grid,
  Chip,
} from '@mui/material';
import {
  ArrowLeftIcon,
  ShareIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';

const getTierColor = (tier) => {
  switch(tier) {
    case 'TOP_TIER': return 'success';
    case 'GOOD_TIER': return 'info';
    default: return 'default';
  }
};

const AyeshaDossierDetail = () => {
  const { nct_id } = useParams();
  const navigate = useNavigate();
  
  const [dossier, setDossier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (nct_id) {
      loadDossier();
    }
  }, [nct_id]);

  const loadDossier = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_ROOT}/api/ayesha/dossiers/detail/${nct_id}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDossier(data);
      
    } catch (err) {
      setError(err.message);
      console.error('Failed to load dossier:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format = 'markdown') => {
    try {
      const response = await fetch(
        `${API_ROOT}/api/ayesha/dossiers/export/${nct_id}?format=${format}`
      );
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Download as file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${nct_id}_DOSSIER.md`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export dossier. Please try again.');
    }
  };

  const handleShare = () => {
    // Copy dossier URL to clipboard
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Dossier link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link. Please copy manually: ' + url);
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading dossier...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          <Typography variant="h6">Error Loading Dossier</Typography>
          <Typography variant="body2">{error}</Typography>
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
      <Box p={3}>
        <Alert severity="warning">
          Dossier not found for {nct_id}
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

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/ayesha-trials')}
          underline="hover"
          sx={{ cursor: 'pointer' }}
        >
          Ayesha Trial Explorer
        </Link>
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
          {dossier.nct_id}
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
            onClick={() => handleExport('markdown')}
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
              NCT ID
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
              {dossier.nct_id}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              Match Tier
            </Typography>
            <Box mt={0.5}>
              <Chip 
                label={dossier.metadata.tier}
                size="small"
                color={getTierColor(dossier.metadata.tier)}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              Match Score
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {Math.round(dossier.metadata.match_score * 100)}%
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Markdown Content */}
      <Paper sx={{ p: 4 }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom renderers for better formatting
            h1: ({node, ...props}) => (
              <Typography variant="h3" gutterBottom sx={{ mt: 4, mb: 2 }} {...props} />
            ),
            h2: ({node, ...props}) => (
              <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 2 }} {...props} />
            ),
            h3: ({node, ...props}) => (
              <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 1 }} {...props} />
            ),
            p: ({node, ...props}) => (
              <Typography variant="body1" paragraph {...props} />
            ),
            table: ({node, ...props}) => (
              <Box sx={{ overflowX: 'auto', my: 2 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }} {...props} />
              </Box>
            ),
            th: ({node, ...props}) => (
              <th style={{ 
                border: '1px solid #ddd', 
                padding: '12px', 
                backgroundColor: '#f5f5f5',
                textAlign: 'left'
              }} {...props} />
            ),
            td: ({node, ...props}) => (
              <td style={{ 
                border: '1px solid #ddd', 
                padding: '12px' 
              }} {...props} />
            ),
            code: ({node, inline, ...props}) => (
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
            blockquote: ({node, ...props}) => (
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
          {dossier.markdown}
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
          onClick={() => handleExport('markdown')}
          variant="contained"
        >
          Download Dossier
        </Button>
      </Box>
    </Box>
  );
};

export default AyeshaDossierDetail;






