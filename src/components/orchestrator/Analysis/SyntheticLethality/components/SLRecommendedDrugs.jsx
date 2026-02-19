/**
 * SLRecommendedDrugs Component
 * 
 * Displays full list of recommended drugs.
 */
import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { Science } from '@mui/icons-material';

export const SLRecommendedDrugs = ({ recommendedDrugs }) => {
  if (!recommendedDrugs || recommendedDrugs.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        <Science sx={{ verticalAlign: 'middle', mr: 0.5 }} />
        Recommended Drugs ({recommendedDrugs.length})
      </Typography>
      <List>
        {recommendedDrugs.map((drug, idx) => (
          <ListItem
            key={idx}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              mb: 1,
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    {drug.drug_name}
                  </Typography>
                  <Chip label={drug.drug_class} size="small" variant="outlined" />
                  {drug.fda_approved && (
                    <Chip label="FDA Approved" size="small" color="success" />
                  )}
                  {drug.confidence && (
                    <Chip
                      label={`${(drug.confidence * 100).toFixed(0)}% confidence`}
                      size="small"
                      color={drug.confidence > 0.7 ? 'success' : 'default'}
                    />
                  )}
                </Box>
              }
              secondary={
                <Box>
                  {drug.target_pathway && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Target: {drug.target_pathway}
                    </Typography>
                  )}
                  {drug.mechanism && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {drug.mechanism}
                    </Typography>
                  )}
                  {drug.rationale && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      {Array.isArray(drug.rationale) ? drug.rationale.join('; ') : drug.rationale}
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
