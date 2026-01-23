/**
 * Keyword Analysis Card Component
 * 
 * Displays keyword hotspots from Research Intelligence:
 * - Top keywords (word cloud or chips)
 * - Keyword frequency
 * - Trend indicators (if available)
 * 
 * Research Use Only - Not for Clinical Diagnosis
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Paper,
  LinearProgress
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

export default function KeywordAnalysisCard({ keywordAnalysis, topKeywords }) {
  if (!topKeywords || topKeywords.length === 0) {
    return null;
  }

  // Handle different formats: array of strings or array of objects
  const keywords = topKeywords.map((kw, idx) => {
    if (typeof kw === 'string') {
      return { word: kw, count: null, idx };
    }
    return { word: kw.word || kw.keyword || kw, count: kw.count || kw.frequency || null, idx };
  });

  // Sort by count if available, otherwise keep order
  const sortedKeywords = keywords.sort((a, b) => {
    if (a.count !== null && b.count !== null) {
      return b.count - a.count;
    }
    return a.idx - b.idx;
  });

  // Get top 5 for primary display
  const top5 = sortedKeywords.slice(0, 5);
  const rest = sortedKeywords.slice(5, 20);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocalFireDepartmentIcon sx={{ mr: 1, color: 'error.main' }} />
          <Typography variant="h6">Keyword Hotspots</Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Emerging mechanisms identified from literature analysis
        </Typography>

        {/* Top 5 Keywords (Primary) */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Top Mechanisms
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {top5.map((kw, idx) => (
              <Chip
                key={idx}
                label={kw.count !== null ? `${kw.word} (${kw.count})` : kw.word}
                size="medium"
                color="primary"
                icon={idx === 0 ? <TrendingUpIcon /> : undefined}
                sx={{
                  fontWeight: idx === 0 ? 'bold' : 'normal',
                  fontSize: idx === 0 ? '0.95rem' : '0.875rem'
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Rest of Keywords */}
        {rest.length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Additional Keywords ({rest.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {rest.map((kw, idx) => (
                <Chip
                  key={idx}
                  label={kw.count !== null ? `${kw.word} (${kw.count})` : kw.word}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Keyword Analysis Details (if available) */}
        {keywordAnalysis && Object.keys(keywordAnalysis).length > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Analysis includes frequency analysis and trend tracking
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}




