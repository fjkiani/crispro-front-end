import React from 'react';
import { Box, Typography, Chip, IconButton } from '@mui/material';
import { Launch as LaunchIcon } from '@mui/icons-material';

/**
 * Individual Citation Card Component
 * Renders an individual paper citation with title, authors, PMID, year, journal, etc.
 */
export const CitationCard = ({ paper }) => {
  if (!paper) return null;

  const formatAuthors = (authors) => {
    if (!authors) return '';
    if (Array.isArray(authors)) {
      return authors.length <= 2 ? authors.join(', ') : `${authors.slice(0, 2).join(', ')} et al.`;
    }
    return authors;
  };

  const getStudyTypeColor = (studyType) => {
    switch (studyType) {
      case 'rct': return 'success';
      case 'guideline': return 'info';
      case 'meta-analysis': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box
      sx={{
        mt: 1,
        p: 1.5,
        bgcolor: 'rgba(0,0,0,0.03)',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
      }}
    >
      {/* Citation Header with Relevance */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', lineHeight: 1.3 }}>
            {paper.title || 'Title not available'}
          </Typography>
          {paper.authors && (
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
              {formatAuthors(paper.authors)}
            </Typography>
          )}
        </Box>

        {/* Relevance Score */}
        {paper.relevance_score && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            ml: 1
          }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              {(paper.relevance_score * 100).toFixed(0)}%
            </Typography>
            <Box sx={{
              width: 40,
              height: 4,
              bgcolor: 'rgba(0,0,0,0.1)',
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <Box sx={{
                width: `${paper.relevance_score * 100}%`,
                height: '100%',
                bgcolor: paper.relevance_score > 0.8 ? 'success.main' :
                         paper.relevance_score > 0.6 ? 'warning.main' : 'error.main',
                transition: 'width 0.3s ease'
              }} />
            </Box>
          </Box>
        )}
      </Box>

      {/* Citation Details */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {paper.pmid && (
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              PMID: {paper.pmid}
            </Typography>
          )}
          {paper.year && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {paper.year}
            </Typography>
          )}
          {paper.journal && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              {paper.journal}
            </Typography>
          )}
        </Box>

        {/* Study Type Badge */}
        {paper.study_type && (
          <Chip
            size="small"
            label={paper.study_type.toUpperCase()}
            color={getStudyTypeColor(paper.study_type)}
            variant="outlined"
            sx={{ fontSize: '0.6rem', height: '18px' }}
          />
        )}

        {/* External Link */}
        {(paper.url || paper.doi) && (
          <IconButton
            size="small"
            onClick={() => {
              const url = paper.url || `https://doi.org/${paper.doi}`;
              window.open(url, '_blank');
            }}
            sx={{ p: 0.5 }}
          >
            <LaunchIcon sx={{ fontSize: '14px' }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

