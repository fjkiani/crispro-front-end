/**
 * SLExplanation Component
 * 
 * Displays explanation section with summary and key points.
 */
import React from 'react';
import { Box, Typography } from '@mui/material';

export const SLExplanation = ({ explanation }) => {
  if (!explanation) {
    return null;
  }

  return (
    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
      <Typography variant="subtitle2" gutterBottom>
        Explanation
      </Typography>
      {explanation.summary && (
        <Typography variant="body2" color="text.secondary" paragraph>
          {explanation.summary}
        </Typography>
      )}
      {explanation.key_points && explanation.key_points.length > 0 && (
        <Box component="ul" sx={{ pl: 2 }}>
          {explanation.key_points.map((point, idx) => (
            <li key={idx}>
              <Typography variant="body2" color="text.secondary">
                {point}
              </Typography>
            </li>
          ))}
        </Box>
      )}
    </Box>
  );
};
