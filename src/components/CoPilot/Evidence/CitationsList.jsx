import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { CitationCard } from './CitationCard';

/**
 * Citations List Component
 * Manages an expandable list of CitationCard components
 */
export const CitationsList = ({ papers, maxVisible = 3 }) => {
  if (!papers || papers.length === 0) return null;

  const [showAll, setShowAll] = useState(false);
  const visiblePapers = showAll ? papers : papers.slice(0, maxVisible);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 1.5, display: 'block', color: 'text.secondary' }}>
        📚 Supporting Citations ({papers.length})
      </Typography>

      {visiblePapers.map((paper, index) => (
        <CitationCard key={index} paper={paper} />
      ))}

      {/* Show More Button */}
      {papers.length > maxVisible && (
        <Button
          size="small"
          variant="text"
          onClick={() => setShowAll(!showAll)}
          sx={{ mt: 1, fontSize: '0.75rem' }}
        >
          {showAll ? `Show Less` : `Show All ${papers.length} Citations`}
        </Button>
      )}
    </Box>
  );
};

