/**
 * SLDrugRecommendations Component
 * 
 * Displays ranked synthetic lethality drug recommendations with confidence scores.
 * Shows drug name, class, FDA approval status, evidence tier, and rationale.
 * 
 * Props:
 * - recommendedDrugs: Array of drug objects with:
 *   - drug_name: string
 *   - drug_class: string
 *   - target_pathway: string
 *   - confidence: number (0.0 - 1.0)
 *   - mechanism: string
 *   - fda_approved: boolean
 *   - evidence_tier: "I" | "II" | "III" | "Research"
 *   - rationale: string[]
 */
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import { LocalPharmacy, CheckCircle, Science } from '@mui/icons-material';

const SLDrugRecommendations = ({ recommendedDrugs = [] }) => {
  if (!recommendedDrugs || recommendedDrugs.length === 0) {
    return (
      <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            No synthetic lethality drug recommendations available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return 'success';
    if (confidence >= 0.5) return 'warning';
    return 'default';
  };

  const getEvidenceTierColor = (tier) => {
    if (tier === 'I') return 'success';
    if (tier === 'II') return 'info';
    if (tier === 'III') return 'warning';
    return 'default';
  };

  return (
    <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
      <CardHeader
        avatar={<LocalPharmacy color="primary" />}
        title="💊 Synthetic Lethality Drug Recommendations"
        subheader={`${recommendedDrugs.length} drug${recommendedDrugs.length !== 1 ? 's' : ''} ranked by confidence`}
      />
      <CardContent>
        <List disablePadding>
          {recommendedDrugs.map((drug, idx) => {
            const confidencePercent = (drug.confidence * 100).toFixed(0);
            const confidenceColor = getConfidenceColor(drug.confidence);
            const tierColor = getEvidenceTierColor(drug.evidence_tier);

            return (
              <ListItem
                key={idx}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1.5,
                  bgcolor: idx === 0 ? 'action.hover' : 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={1}>
                      <Chip
                        label={`#${idx + 1}`}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 'bold', minWidth: { xs: 35, sm: 40 }, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                      <Typography 
                        variant="h6" 
                        component="span" 
                        sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}
                      >
                        {drug.drug_name}
                      </Typography>
                      <Chip
                        label={drug.drug_class}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                      {drug.fda_approved && (
                        <Chip
                          label="FDA Approved"
                          size="small"
                          color="success"
                          icon={<CheckCircle fontSize="small" />}
                          sx={{ fontSize: '0.75rem' }}
                        />
                      )}
                      <Chip
                        label={`${confidencePercent}% confidence`}
                        size="small"
                        color={confidenceColor}
                        sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                      />
                      {drug.evidence_tier && (
                        <Chip
                          label={`Tier ${drug.evidence_tier}`}
                          size="small"
                          color={tierColor}
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Stack spacing={1}>
                      {drug.target_pathway && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          <strong>Target Pathway:</strong> {drug.target_pathway}
                        </Typography>
                      )}
                      {drug.mechanism && (
                        <Typography variant="body2" color="text.secondary">
                          {drug.mechanism}
                        </Typography>
                      )}
                      {drug.rationale && drug.rationale.length > 0 && (
                        <Box component="ul" sx={{ mt: 0.5, mb: 0, pl: 2 }}>
                          {drug.rationale.map((r, i) => (
                            <li key={i}>
                              <Typography variant="caption" color="text.secondary">
                                {r}
                              </Typography>
                            </li>
                          ))}
                        </Box>
                      )}
                    </Stack>
                  }
                />
              </ListItem>
            );
          })}
        </List>

        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            <strong>Research Use Only:</strong> These recommendations are for research purposes only and should not be used for clinical decision-making without consultation with a qualified oncologist.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SLDrugRecommendations;
