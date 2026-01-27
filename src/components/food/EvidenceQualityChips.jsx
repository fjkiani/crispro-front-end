import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
  Tooltip,
  Grid
} from '@mui/material';
import {
  Science as ScienceIcon,
  Article as ArticleIcon,
  CalendarToday as CalendarTodayIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
// Using CSS transitions instead of framer-motion for better compatibility

/**
 * EvidenceQualityChips Component
 * 
 * Displays evidence quality indicators: study types, recency, citation count
 * from paper objects in the evidence response.
 * 
 * Props:
 * - papers: array - Array of paper objects with quality_score, study_type, year, citation_count
 * - evidenceGrade: string - Overall evidence grade (STRONG, MODERATE, WEAK, INSUFFICIENT)
 * - totalPapers: number - Total number of papers found
 * - rctCount: number - Number of RCTs found
 */
export default function EvidenceQualityChips({ 
  papers = [], 
  evidenceGrade, 
  totalPapers = 0,
  rctCount = 0
}) {
  // Handle empty evidence gracefully
  if (!papers || papers.length === 0) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
        <Typography variant="body2" color="text.secondary">
          No evidence papers found for this compound-disease pair
        </Typography>
      </Paper>
    );
  }

  // Get study type color
  const getStudyTypeColor = (studyType) => {
    const type = studyType?.toLowerCase() || '';
    if (type.includes('clinical trial') || type.includes('rct')) return 'primary';
    if (type.includes('meta-analysis')) return 'success';
    if (type.includes('case study') || type.includes('case report')) return 'warning';
    return 'default';
  };

  // Get study type icon
  const getStudyTypeIcon = (studyType) => {
    const type = studyType?.toLowerCase() || '';
    if (type.includes('clinical trial') || type.includes('rct')) return <ScienceIcon />;
    if (type.includes('meta-analysis')) return <ArticleIcon />;
    return <ArticleIcon />;
  };

  // Get recency color
  const getRecencyColor = (year) => {
    if (!year) return 'default';
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(year);
    if (age <= 2) return 'success'; // Very recent (2023+)
    if (age <= 5) return 'info'; // Recent (2019-2022)
    if (age <= 10) return 'warning'; // Moderate (2014-2018)
    return 'default'; // Older
  };

  // Get citation count color
  const getCitationColor = (citations) => {
    if (!citations) return 'default';
    if (citations >= 100) return 'success';
    if (citations >= 50) return 'info';
    if (citations >= 10) return 'warning';
    return 'default';
  };

  // Get evidence grade color
  const getGradeColor = (grade) => {
    const g = grade?.toUpperCase() || '';
    if (g === 'STRONG') return 'success';
    if (g === 'MODERATE') return 'info';
    if (g === 'WEAK') return 'warning';
    return 'error';
  };

  // Calculate average quality score
  const avgQualityScore = papers.length > 0
    ? papers.reduce((sum, p) => sum + (p.quality_score || 0), 0) / papers.length
    : 0;

  // Get top 5 papers for display
  const topPapers = papers.slice(0, 5);

  return (
    <Paper 
      sx={{ 
        p: 3, 
        bgcolor: 'background.paper',
        borderRadius: 2
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Evidence Quality Summary
        </Typography>

        {/* Overall Evidence Grade */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Chip
              label={evidenceGrade || 'INSUFFICIENT'}
              color={getGradeColor(evidenceGrade)}
              size="medium"
              sx={{ fontWeight: 'bold' }}
            />
            <Typography variant="body2" color="text.secondary">
              Overall Evidence Grade
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {totalPapers} total papers found
            {rctCount > 0 && ` • ${rctCount} RCT${rctCount > 1 ? 's' : ''}`}
            {avgQualityScore > 0 && ` • Avg Quality: ${(avgQualityScore * 100).toFixed(0)}%`}
          </Typography>
        </Box>

        {/* Top Papers Quality Indicators */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          Top Papers Quality Indicators:
        </Typography>

        <Grid container spacing={2}>
          {topPapers.map((paper, index) => {
            const studyType = paper.study_type || paper.type || 'Study';
            const year = paper.year || paper.publication_year;
            const citations = paper.citation_count || paper.citations || 0;
            const qualityScore = paper.quality_score || 0;

            return (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  sx={{
                    opacity: 1,
                    transform: 'translateY(0)',
                    transition: 'opacity 0.3s ease, transform 0.3s ease'
                  }}
                >
                  <Paper 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    {/* Paper Title (truncated) */}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'medium', 
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {paper.title || `Paper ${index + 1}`}
                    </Typography>

                    {/* Study Type Badge */}
                    <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap' }}>
                      <Chip
                        icon={getStudyTypeIcon(studyType)}
                        label={studyType}
                        color={getStudyTypeColor(studyType)}
                        size="small"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </Stack>

                    {/* Quality Indicators Row */}
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                      {/* Recency */}
                      {year && (
                        <Tooltip title={`Published in ${year}`}>
                          <Chip
                            icon={<CalendarTodayIcon />}
                            label={year}
                            color={getRecencyColor(year)}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.65rem' }}
                          />
                        </Tooltip>
                      )}

                      {/* Citations */}
                      {citations > 0 && (
                        <Tooltip title={`${citations} citations`}>
                          <Chip
                            label={`${citations} cites`}
                            color={getCitationColor(citations)}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.65rem' }}
                          />
                        </Tooltip>
                      )}

                      {/* Quality Score Stars */}
                      {qualityScore > 0 && (
                        <Tooltip title={`Quality Score: ${(qualityScore * 100).toFixed(0)}%`}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon
                                key={star}
                                sx={{
                                  fontSize: 14,
                                  color: qualityScore >= star / 5 ? 'warning.main' : 'grey.300'
                                }}
                              />
                            ))}
                          </Box>
                        </Tooltip>
                      )}
                    </Stack>

                    {/* PMID Link */}
                    {paper.pmid && (
                      <Typography 
                        variant="caption" 
                        component="a"
                        href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ 
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                          display: 'block',
                          mt: 0.5
                        }}
                      >
                        PMID: {paper.pmid}
                      </Typography>
                    )}
                  </Paper>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Evidence Quality Legend */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            <strong>Quality Indicators:</strong>
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              label="Clinical Trial/RCT" 
              color="primary" 
              size="small" 
              sx={{ fontSize: '0.65rem' }}
            />
            <Chip 
              label="Meta-Analysis" 
              color="success" 
              size="small" 
              sx={{ fontSize: '0.65rem' }}
            />
            <Chip 
              label="Recent (2020+)" 
              color="success" 
              size="small" 
              variant="outlined"
              sx={{ fontSize: '0.65rem' }}
            />
            <Chip 
              label="100+ Citations" 
              color="success" 
              size="small" 
              variant="outlined"
              sx={{ fontSize: '0.65rem' }}
            />
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}

